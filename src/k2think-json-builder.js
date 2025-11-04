#!/usr/bin/env node

/**
 * K2Think JSON Builder - Построение кастомных JSON запросов
 * 
 * Позволяет создавать любые JSON структуры для K2Think API
 * с полной гибкостью и контролем над форматом
 * 
 * Использование:
 * 1. Установите cookies: export K2THINK_COOKIES="ваши_cookies"
 * 2. Запустите: node k2think-json-builder.js
 */

const https = require('https');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class K2ThinkJsonBuilder {
    constructor(cookies, baseUrl = 'https://www.k2think.ai') {
        this.baseUrl = baseUrl;
        this.cookies = cookies;
        
        if (!cookies) {
            throw new Error('Cookies обязательны для K2ThinkJsonBuilder');
        }
        
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Origin': baseUrl,
            'Referer': `${baseUrl}/`,
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            'Cookie': this.encodeCookies(cookies)
        };
    }
    
    /**
     * Создать базовую структуру запроса
     */
    createBaseRequest(model = 'MBZUAI-IFM/K2-Think') {
        return {
            model: model,
            input: [],
            text: {
                format: {
                    type: "text"
                }
            },
            reasoning: {},
            tools: [],
            temperature: 1,
            max_output_tokens: 2048,
            top_p: 1,
            store: true,
            include: ["web_search_call.action.sources"]
        };
    }
    
    /**
     * Добавить сообщение в input
     */
    addMessage(request, role, content, type = 'input_text') {
        const message = {
            role: role,
            content: [{
                type: type,
                text: content
            }]
        };
        
        request.input.push(message);
        return request;
    }
    
    /**
     * Добавить системный промпт
     */
    addSystemMessage(request, content) {
        return this.addMessage(request, 'system', content, 'input_text');
    }
    
    /**
     * Добавить сообщение пользователя
     */
    addUserMessage(request, content) {
        return this.addMessage(request, 'user', content, 'input_text');
    }
    
    /**
     * Добавить ответ ассистента
     */
    addAssistantMessage(request, content) {
        return this.addMessage(request, 'assistant', content, 'output_text');
    }
    
    /**
     * Установить параметры модели
     */
    setModelParams(request, params = {}) {
        return {
            ...request,
            temperature: params.temperature !== undefined ? params.temperature : request.temperature,
            max_output_tokens: params.max_tokens || params.max_output_tokens || request.max_output_tokens,
            top_p: params.top_p !== undefined ? params.top_p : request.top_p,
            store: params.store !== undefined ? params.store : request.store
        };
    }
    
    /**
     * Добавить инструменты
     */
    addTools(request, tools = []) {
        return {
            ...request,
            tools: [...request.tools, ...tools]
        };
    }
    
    /**
     * Установить include параметры
     */
    setInclude(request, include = []) {
        return {
            ...request,
            include: include
        };
    }
    
    /**
     * Создать полный диалог из истории
     */
    createDialogFromHistory(history, model = 'MBZUAI-IFM/K2-Think') {
        const request = this.createBaseRequest(model);
        
        history.forEach(msg => {
            if (msg.role === 'system') {
                this.addSystemMessage(request, msg.content);
            } else if (msg.role === 'user') {
                this.addUserMessage(request, msg.content);
            } else if (msg.role === 'assistant') {
                this.addAssistantMessage(request, msg.content);
            }
        });
        
        return request;
    }
    
    /**
     * Отправить JSON запрос
     */
    async sendRequest(request) {
        console.log('📤 Отправляемый JSON:');
        console.log(JSON.stringify(request, null, 2));
        console.log('\n');
        
        return new Promise((resolve, reject) => {
            // Конвертируем в формат K2Think API
            const k2thinkPayload = this.convertToK2ThinkFormat(request);
            
            const options = {
                hostname: 'www.k2think.ai',
                port: 443,
                path: '/api/chat/completions',
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Content-Length': Buffer.byteLength(JSON.stringify(k2thinkPayload))
                }
            };
            
            const req = https.request(options, (res) => {
                let fullText = '';
                let buffer = '';
                
                if (res.statusCode !== 200) {
                    let errorData = '';
                    res.on('data', (chunk) => {
                        errorData += chunk;
                    });
                    res.on('end', () => {
                        reject(new Error(`HTTP ${res.statusCode}: ${errorData}`));
                    });
                    return;
                }
                
                res.on('data', (chunk) => {
                    buffer += chunk;
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data === '[DONE]') {
                                resolve({
                                    request: request,
                                    response: fullText,
                                    usage: { total_tokens: fullText.length }
                                });
                                return;
                            }
                            
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.content) {
                                    const answerMatch = parsed.content.match(/<answer>(.*?)<\/answer>/s);
                                    if (answerMatch) {
                                        const content = answerMatch[1];
                                        if (!fullText.includes(content)) {
                                            fullText = content;
                                            process.stdout.write(content);
                                        }
                                    }
                                }
                            } catch (error) {
                                // Игнорируем ошибки парсинга
                            }
                        }
                    }
                });
                
                res.on('end', () => {
                    resolve({
                        request: request,
                        response: fullText,
                        usage: { total_tokens: fullText.length }
                    });
                });
            });
            
            req.on('error', reject);
            req.write(JSON.stringify(k2thinkPayload));
            req.end();
        });
    }
    
    /**
     * Конвертировать универсальный формат в K2Think формат
     */
    convertToK2ThinkFormat(request) {
        const now = new Date();
        
        return {
            stream: true,
            model: request.model,
            messages: request.input.map(item => ({
                role: item.role,
                content: item.content[0].text
            })),
            params: {
                temperature: request.temperature,
                max_tokens: request.max_output_tokens,
                top_p: request.top_p
            },
            tool_servers: request.tools || [],
            features: {
                image_generation: false,
                code_interpreter: false,
                web_search: request.include?.includes('web_search_call.action.sources') || false
            },
            variables: {
                '{{USER_NAME}}': 'User',
                '{{USER_LOCATION}}': 'Unknown',
                '{{CURRENT_DATETIME}}': now.toISOString().replace('T', ' ').substring(0, 19),
                '{{CURRENT_DATE}}': now.toISOString().substring(0, 10),
                '{{CURRENT_TIME}}': now.toTimeString().substring(0, 8),
                '{{CURRENT_WEEKDAY}}': now.toLocaleDateString('en-US', { weekday: 'long' }),
                '{{CURRENT_TIMEZONE}}': 'Europe/Moscow',
                '{{USER_LANGUAGE}}': 'en-US'
            }
        };
    }
    
    /**
     * Сохранить JSON запрос в файл
     */
    saveRequest(request, filename = 'k2think-request.json') {
        fs.writeFileSync(filename, JSON.stringify(request, null, 2));
        console.log(`💾 JSON запрос сохранен в ${filename}`);
    }
    
    /**
     * Загрузить JSON запрос из файла
     */
    loadRequest(filename = 'k2think-request.json') {
        if (fs.existsSync(filename)) {
            return JSON.parse(fs.readFileSync(filename, 'utf8'));
        }
        throw new Error(`Файл ${filename} не найден`);
    }
    
    /**
     * Кодирование cookies
     */
    encodeCookies(cookies) {
        try {
            const cookiePairs = cookies.split(';').map(pair => pair.trim());
            const encodedPairs = cookiePairs.map(pair => {
                const [name, ...valueParts] = pair.split('=');
                if (!name || valueParts.length === 0) return pair;
                const value = valueParts.join('=');
                return `${name}=${encodeURIComponent(value)}`;
            });
            return encodedPairs.join('; ');
        } catch (error) {
            console.warn('⚠️  Ошибка кодирования cookies:', error.message);
            return cookies;
        }
    }
}

/**
 * Демонстрация работы
 */
async function demo() {
    let cookies = process.env.K2THINK_COOKIES;
    
    if (!cookies) {
        try {
            if (fs.existsSync('./cookies.txt')) {
                cookies = fs.readFileSync('./cookies.txt', 'utf8').trim();
                console.log('✅ Cookies загружены из файла cookies.txt');
            }
        } catch (error) {
            console.log('⚠️  Не удалось прочитать cookies.txt');
        }
    }
    
    if (!cookies) {
        console.error('❌ Cookies не найдены');
        console.log('Установите cookies: export K2THINK_COOKIES="..."');
        return;
    }
    
    const builder = new K2ThinkJsonBuilder(cookies);
    
    try {
        console.log('🚀 Демонстрация K2Think JSON Builder\n');
        
        // Пример 1: Базовый запрос
        console.log('=== Пример 1: Базовый запрос ===');
        let request1 = builder.createBaseRequest();
        request1 = builder.addSystemMessage(request1, 'Ты - полезный AI ассистент');
        request1 = builder.addUserMessage(request1, 'Привет! Как дела?');
        
        const response1 = await builder.sendRequest(request1);
        console.log('\n✅ Ответ получен\n');
        
        // Пример 2: Полный диалог
        console.log('=== Пример 2: Полный диалог ===');
        const history = [
            { role: 'system', content: 'Ты - эксперт по программированию' },
            { role: 'user', content: 'Что такое async/await?' },
            { role: 'assistant', content: 'Async/await - это синтаксический сахар для работы с промисами...' },
            { role: 'user', content: 'Можешь привести пример?' }
        ];
        
        let request2 = builder.createDialogFromHistory(history);
        request2 = builder.setModelParams(request2, {
            temperature: 0.7,
            max_tokens: 1024
        });
        
        builder.saveRequest(request2, 'example-dialog.json');
        
        const response2 = await builder.sendRequest(request2);
        console.log('\n✅ Диалог завершен\n');
        
        // Пример 3: Кастомный JSON
        console.log('=== Пример 3: Кастомный JSON с инструментами ===');
        let request3 = builder.createBaseRequest('MBZUAI-IFM/K2-Think');
        request3 = builder.addSystemMessage(request3, 'Ты - AI ассистент с доступом к веб-поиску');
        request3 = builder.addUserMessage(request3, 'Найди информацию о последних новостях в AI');
        request3 = builder.setInclude(request3, ['web_search_call.action.sources']);
        request3 = builder.setModelParams(request3, {
            temperature: 0.5,
            max_tokens: 2048
        });
        
        const response3 = await builder.sendRequest(request3);
        console.log('\n✅ Запрос с веб-поиском завершен\n');
        
        console.log('🎉 Все примеры успешно выполнены!');
        console.log('💡 Вы можете создавать любые JSON структуры для K2Think API');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Запуск демонстрации
if (require.main === module) {
    demo();
}

module.exports = K2ThinkJsonBuilder;
