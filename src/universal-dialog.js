#!/usr/bin/env node

/**
 * Универсальный диалоговый режим - поддержка различных API
 * 
 * Поддерживаемые форматы:
 * - K2Think.ai API (cookies)
 * - OpenAI/Anthropic/Other APIs (API keys)
 * - Кастомные форматы сообщений
 * 
 * Использование:
 * 1. Настройте config.json или переменные окружения
 * 2. Запустите: node universal-dialog.js
 */

const https = require('https');
const fs = require('fs');

class UniversalDialog {
    constructor(config = {}) {
        this.config = {
            provider: config.provider || 'k2think', // k2think, openai, anthropic, custom
            model: config.model || 'MBZUAI-IFM/K2-Think',
            apiKey: config.apiKey || process.env.API_KEY,
            cookies: config.cookies || process.env.K2THINK_COOKIES,
            baseUrl: config.baseUrl || 'https://www.k2think.ai',
            maxTokens: config.maxTokens || 2048,
            temperature: config.temperature || 1,
            topP: config.topP || 1,
            stream: config.stream !== false,
            ...config
        };
        
        this.conversationHistory = [];
        this.systemPrompt = config.systemPrompt || '';
        
        this.setupProvider();
    }
    
    setupProvider() {
        switch (this.config.provider) {
            case 'k2think':
                this.setupK2Think();
                break;
            case 'openai':
                this.setupOpenAI();
                break;
            case 'anthropic':
                this.setupAnthropic();
                break;
            case 'custom':
                this.setupCustom();
                break;
            default:
                throw new Error(`Провайдер ${this.config.provider} не поддерживается`);
        }
    }
    
    setupK2Think() {
        if (!this.config.cookies && !this.config.skipCookies) {
            throw new Error('Cookies обязательны для K2Think');
        }
        
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Origin': this.config.baseUrl,
            'Referer': `${this.config.baseUrl}/`,
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            'Cookie': this.config.cookies ? this.encodeCookies(this.config.cookies) : null
        };
    }
    
    setupOpenAI() {
        if (!this.config.apiKey) {
            throw new Error('API Key обязателен для OpenAI');
        }
        
        this.config.baseUrl = 'https://api.openai.com/v1';
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': this.config.stream ? 'text/event-stream' : 'application/json'
        };
    }
    
    setupAnthropic() {
        if (!this.config.apiKey) {
            throw new Error('API Key обязателен для Anthropic');
        }
        
        this.config.baseUrl = 'https://api.anthropic.com/v1';
        this.headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Accept': this.config.stream ? 'text/event-stream' : 'application/json'
        };
    }
    
    setupCustom() {
        // Кастомный провайдер - использует настройки из config
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': this.config.stream ? 'text/event-stream' : 'application/json',
            ...this.config.customHeaders
        };
        
        if (this.config.apiKey) {
            this.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
    }
    
    /**
     * Конвертация в универсальный формат
     */
    toUniversalFormat(messages = this.conversationHistory) {
        const input = [];
        
        // Добавляем системный промпт если есть
        if (this.systemPrompt) {
            input.push({
                role: 'system',
                content: [{
                    type: 'input_text',
                    text: this.systemPrompt
                }]
            });
        }
        
        // Конвертируем сообщения
        messages.forEach(msg => {
            const content = [{
                type: msg.role === 'assistant' ? 'output_text' : 'input_text',
                text: msg.content
            }];
            
            input.push({
                role: msg.role,
                content: content
            });
        });
        
        return {
            model: this.config.model,
            input: input,
            text: {
                format: {
                    type: 'text'
                }
            },
            reasoning: {},
            tools: this.config.tools || [],
            temperature: this.config.temperature,
            max_output_tokens: this.config.maxTokens,
            top_p: this.config.topP,
            store: true,
            include: this.config.include || []
        };
    }
    
    /**
     * Добавить сообщение в историю
     */
    addMessage(role, content) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });
    }
    
    /**
     * Отправить сообщение и получить ответ
     */
    async sendMessage(message, options = {}) {
        this.config = { ...this.config, ...options };
        
        this.addMessage('user', message);
        
        const payload = this.toUniversalFormat();
        
        if (this.config.provider === 'k2think') {
            return await this.sendK2ThinkMessage(payload);
        } else if (this.config.provider === 'openai') {
            return await this.sendOpenAIMessage(payload);
        } else if (this.config.provider === 'anthropic') {
            return await this.sendAnthropicMessage(payload);
        } else {
            return await this.sendCustomMessage(payload);
        }
    }
    
    async sendK2ThinkMessage(payload) {
        // K2Think специфическая логика
        const chatPayload = {
            stream: true,
            model: this.config.model,
            messages: payload.input.map(item => ({
                role: item.role,
                content: item.content[0].text
            })),
            params: {},
            tool_servers: [],
            features: {
                image_generation: false,
                code_interpreter: false,
                web_search: false
            },
            variables: {
                '{{USER_NAME}}': 'User',
                '{{USER_LOCATION}}': 'Unknown',
                '{{CURRENT_DATETIME}}': new Date().toISOString().replace('T', ' ').substring(0, 19),
                '{{CURRENT_DATE}}': new Date().toISOString().substring(0, 10),
                '{{CURRENT_TIME}}': new Date().toTimeString().substring(0, 8),
                '{{CURRENT_WEEKDAY}}': new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                '{{CURRENT_TIMEZONE}}': 'Europe/Moscow',
                '{{USER_LANGUAGE}}': 'en-US'
            }
        };
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'www.k2think.ai',
                port: 443,
                path: '/api/chat/completions',
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Content-Length': Buffer.byteLength(JSON.stringify(chatPayload))
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
                                this.addMessage('assistant', fullText);
                                resolve({
                                    content: fullText,
                                    usage: { total_tokens: fullText.length },
                                    model: this.config.model
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
                    this.addMessage('assistant', fullText);
                    resolve({
                        content: fullText,
                        usage: { total_tokens: fullText.length },
                        model: this.config.model
                    });
                });
            });
            
            req.on('error', reject);
            req.write(JSON.stringify(chatPayload));
            req.end();
        });
    }
    
    async sendOpenAIMessage(payload) {
        // OpenAI специфическая логика
        const openaiPayload = {
            model: this.config.model,
            messages: payload.input.map(item => ({
                role: item.role,
                content: item.content[0].text
            })),
            temperature: payload.temperature,
            max_tokens: payload.max_output_tokens,
            top_p: payload.top_p,
            stream: payload.stream
        };
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.openai.com',
                port: 443,
                path: '/chat/completions',
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Content-Length': Buffer.byteLength(JSON.stringify(openaiPayload))
                }
            };
            
            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(responseData);
                        const content = response.choices[0].message.content;
                        this.addMessage('assistant', content);
                        resolve(response);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            req.on('error', reject);
            req.write(JSON.stringify(openaiPayload));
            req.end();
        });
    }
    
    async sendAnthropicMessage(payload) {
        // Anthropic специфическая логика
        const anthropicPayload = {
            model: this.config.model,
            messages: payload.input.filter(item => item.role !== 'system').map(item => ({
                role: item.role,
                content: item.content[0].text
            })),
            system: this.systemPrompt,
            temperature: payload.temperature,
            max_tokens: payload.max_output_tokens,
            top_p: payload.top_p,
            stream: payload.stream
        };
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.anthropic.com',
                port: 443,
                path: '/messages',
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Content-Length': Buffer.byteLength(JSON.stringify(anthropicPayload))
                }
            };
            
            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(responseData);
                        const content = response.content[0].text;
                        this.addMessage('assistant', content);
                        resolve(response);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            req.on('error', reject);
            req.write(JSON.stringify(anthropicPayload));
            req.end();
        });
    }
    
    async sendCustomMessage(payload) {
        // Кастомный провайдер
        const url = new URL(this.config.baseUrl + (this.config.endpoint || '/chat/completions'));
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname,
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Content-Length': Buffer.byteLength(JSON.stringify(payload))
                }
            };
            
            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(responseData);
                        const content = response.content || response.choices?.[0]?.message?.content || response.text;
                        this.addMessage('assistant', content);
                        resolve(response);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            req.on('error', reject);
            req.write(JSON.stringify(payload));
            req.end();
        });
    }
    
    /**
     * Очистить историю диалога
     */
    clearHistory() {
        this.conversationHistory = [];
    }
    
    /**
     * Получить историю в универсальном формате
     */
    getHistory() {
        return this.toUniversalFormat();
    }
    
    /**
     * Сохранить историю в файл
     */
    saveHistory(filename = 'conversation.json') {
        const data = {
            timestamp: new Date().toISOString(),
            config: this.config,
            history: this.conversationHistory,
            universalFormat: this.getHistory()
        };
        
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`💾 История сохранена в ${filename}`);
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
    // Загружаем конфигурацию
    let config = {};
    
    if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
        console.log('✅ Конфигурация загружена из config.json');
    } else {
        // Создаем пример конфигурации
        config = {
            provider: 'k2think',
            model: 'MBZUAI-IFM/K2-Think',
            systemPrompt: 'Ты - полезный AI ассистент. Отвечай кратко и по делу.',
            temperature: 0.7,
            maxTokens: 1024
        };
        
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        console.log('📝 Создан пример конфигурации config.json');
    }
    
    // Для K2Think нужно cookies
    if (config.provider === 'k2think' && !config.cookies) {
        if (fs.existsSync('./cookies.txt')) {
            config.cookies = fs.readFileSync('./cookies.txt', 'utf8').trim();
            console.log('✅ Cookies загружены из файла cookies.txt');
        } else {
            console.error('❌ Cookies не найдены для K2Think');
            console.log('Добавьте cookies в config.json или создайте файл cookies.txt');
            return;
        }
    }
    
    const dialog = new UniversalDialog(config);
    
    try {
        console.log('\n🚀 Запуск универсального диалога...\n');
        
        // Демонстрация универсального формата
        console.log('📋 Универсальный формат запроса:');
        console.log(JSON.stringify(dialog.getHistory(), null, 2));
        console.log('\n');
        
        // Отправляем сообщения
        const response1 = await dialog.sendMessage('Привет! Расскажи о себе кратко');
        console.log('\n🤖 Ответ 1:', response1.content?.substring(0, 200) + '...');
        
        const response2 = await dialog.sendMessage('Какие у тебя возможности?');
        console.log('\n🤖 Ответ 2:', response2.content?.substring(0, 200) + '...');
        
        const response3 = await dialog.sendMessage('Помоги мне с задачей');
        console.log('\n🤖 Ответ 3:', response3.content?.substring(0, 200) + '...');
        
        // Сохраняем историю
        dialog.saveHistory();
        
        console.log('\n🎉 Диалог успешно завершен!');
        console.log('💡 Используйте UniversalDialog для работы с любыми AI API!');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Запуск демонстрации
if (require.main === module) {
    demo();
}

module.exports = UniversalDialog;
