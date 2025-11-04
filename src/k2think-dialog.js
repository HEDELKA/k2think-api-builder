#!/usr/bin/env node

/**
 * K2Think.ai API - Полноценный диалог с памятью
 * 
 * Пример работы с API K2Think.ai с поддержкой потоковой обработки
 * и сохранением контекста диалога
 * 
 * Использование:
 * 1. Установите cookies: export K2THINK_COOKIES="ваши_cookies"
 * 2. Запустите: node k2think-dialog.js
 */

const https = require('https');
const { v4: uuidv4 } = require('uuid');

class K2ThinkDialog {
    constructor(cookies, baseUrl = 'https://www.k2think.ai', options = {}) {
        this.baseUrl = baseUrl;
        this.options = options || {};
        
        // Если cookies не предоставлены и опция skipCookies не установлена
        if (!cookies && !options.skipCookies) {
            throw new Error('Cookies обязательны для K2ThinkDialog');
        }
        
        // Кодируем cookies для безопасной передачи в HTTP заголовках
        this.cookies = cookies ? this.encodeCookies(cookies) : null;
        
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Origin': baseUrl,
            'Referer': `${baseUrl}/`,
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 YaBrowser/25.8.0.0 Safari/537.36',
            'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "YaBrowser";v="25.8", "Yowser";v="2.5"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin'
        };
    }
    
    /**
     * Кодирование cookies для безопасной передачи в HTTP заголовках
     */
    encodeCookies(cookies) {
        try {
            // Разделяем cookies на пары name=value
            const cookiePairs = cookies.split(';').map(pair => pair.trim());
            
            const encodedPairs = cookiePairs.map(pair => {
                const [name, ...valueParts] = pair.split('=');
                if (!name || valueParts.length === 0) return pair;
                
                const value = valueParts.join('=');
                // Кодируем только значение, оставляя имя как есть
                return `${name}=${encodeURIComponent(value)}`;
            });
            
            return encodedPairs.join('; ');
        } catch (error) {
            console.warn('⚠️  Ошибка кодирования cookies, используем оригинал:', error.message);
            return cookies;
        }
    }
    
    /**
     * Проверка валидности cookies
     */
    validateCookies(cookies) {
        if (!cookies || typeof cookies !== 'string') {
            return false;
        }
        
        // Проверяем наличие базовой структуры
        const hasNameValuePair = cookies.includes('=');
        if (!hasNameValuePair) {
            return false;
        }
        
        // Проверяем на недопустимые символы для HTTP заголовков
        // eslint-disable-next-line no-control-regex
        const invalidChars = /[\x00-\x1F\x7F]/; // Control characters
        if (invalidChars.test(cookies)) {
            console.warn('⚠️  Обнаружены недопустимые символы в cookies');
            return false;
        }
        
        return true;
    }

    /**
     * Создание нового чата с первым сообщением
     */
    async createNewChat(message, model = 'MBZUAI-IFM/K2-Think') {
        return new Promise((resolve, reject) => {
            const messageId = uuidv4();
            const timestamp = Math.floor(Date.now() / 1000);

            const payload = {
                chat: {
                    id: '',
                    title: 'New Chat',
                    models: [model],
                    params: {},
                    history: {
                        messages: {
                            [messageId]: {
                                id: messageId,
                                parentId: null,
                                childrenIds: [],
                                role: 'user',
                                content: message,
                                timestamp: timestamp,
                                models: [model]
                            }
                        },
                        currentId: messageId
                    },
                    messages: [{
                        id: messageId,
                        parentId: null,
                        childrenIds: [],
                        role: 'user',
                        content: message,
                        timestamp: timestamp,
                        models: [model]
                    }],
                    tags: [],
                    timestamp: Date.now()
                }
            };

            this.makeRequest('/api/v1/chats/new', 'POST', payload)
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Отправка сообщения с потоковой обработкой ответа
     */
    async sendMessage(chatId, message, model = 'MBZUAI-IFM/K2-Think') {
        const now = new Date();
        
        // Получаем текущий чат
        const chatInfo = await this.makeRequest(`/api/v1/chats/${chatId}`);
        
        // Создаем новое сообщение
        const messageId = uuidv4();
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Добавляем новое сообщение в историю
        const newMessage = {
            id: messageId,
            parentId: chatInfo.chat.history.currentId,
            childrenIds: [],
            role: 'user',
            content: message,
            timestamp: timestamp,
            models: [model]
        };
        
        // Обновляем историю
        chatInfo.chat.history.messages[messageId] = newMessage;
        chatInfo.chat.history.currentId = messageId;
        chatInfo.chat.messages.push(newMessage);

        const payload = {
            stream: true,
            model: model,
            messages: chatInfo.chat.messages.map(msg => ({
                role: msg.role,
                content: msg.content
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
                '{{CURRENT_DATETIME}}': now.toISOString().replace('T', ' ').substring(0, 19),
                '{{CURRENT_DATE}}': now.toISOString().substring(0, 10),
                '{{CURRENT_TIME}}': now.toTimeString().substring(0, 8),
                '{{CURRENT_WEEKDAY}}': now.toLocaleDateString('en-US', { weekday: 'long' }),
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
                    'Cookie': this.cookies,
                    'Content-Length': Buffer.byteLength(JSON.stringify(payload))
                }
            };

            const req = https.request(options, (res) => {
                let fullText = '';
                let buffer = '';
                let errorData = '';

                if (res.statusCode !== 200) {
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
                    
                    // Обрабатываем SSE (Server-Sent Events)
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data === '[DONE]') {
                                resolve(fullText);
                                return;
                            }
                            
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.content) {
                                    // Извлекаем ответ из <answer>...</answer>
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
                    // Возвращаем объект с id чата и текстом ответа
                    resolve({
                        id: chatId,
                        response: fullText
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(JSON.stringify(payload));
            req.end();
        });
    }

    /**
     * Получение информации о чате
     */
    async getChat(chatId) {
        return await this.makeRequest(`/api/v1/chats/${chatId}`);
    }

    /**
     * Получение списка чатов
     */
    async getChatList(page = 1) {
        return await this.makeRequest(`/api/v1/chats/?page=${page}`);
    }

    /**
     * Базовый HTTP запрос
     */
    makeRequest(path, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'www.k2think.ai',
                port: 443,
                path: path,
                method: method,
                headers: {
                    ...this.headers,
                    'Cookie': this.cookies,
                    'Content-Length': data ? Buffer.byteLength(JSON.stringify(data)) : 0
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(responseData);
                        resolve(jsonData);
                    } catch (error) {
                        resolve(responseData);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }
}

/**
 * Демонстрация работы
 */
async function demo() {
    // Пытаемся получить cookies из файла или переменной окружения
    let cookies = process.env.K2THINK_COOKIES;
    
    if (!cookies) {
        try {
            const fs = require('fs');
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
        console.log('\n🔑 Получите cookies:');
        console.log('1. Экспортируйте cookies из браузера в Cookie.json');
        console.log('2. Запустите: npm run cookies');
        console.log('3. Затем: source set-cookies.sh');
        console.log('\nИли установите вручную:');
        console.log('export K2THINK_COOKIES="token=..."');
        return;
    }

    const dialog = new K2ThinkDialog(cookies);

    try {
        // Создаем чат с представлением
        const response1 = await dialog.createNewChat('Привет! Как дела?');
        console.log('\n📝 Ответ 1:');
        console.log(response1);

        const response2 = await dialog.sendMessage(response1.id, 'Расскажи о себе');
        console.log('\n📝 Ответ 2:');
        console.log(response2.response);

        const response3 = await dialog.sendMessage(response2.id, 'Что ты умеешь?');
        console.log('\n📝 Ответ 3:');
        console.log(response3.response);

        const response4 = await dialog.sendMessage(response3.id, 'Помоги мне с задачей');
        console.log('\n📝 Ответ 4:');
        console.log(response4.response);

        const response5 = await dialog.sendMessage(response4.id, 'Спасибо за помощь!');
        console.log('\n📝 Ответ 5:');
        console.log(response5.response);
        console.log('\n');

        // Итоговый вопрос
        console.log('💬 Вопрос: Сделай краткое резюме обо мне');
        console.log('🤖 Ответ: ');
        const summaryResponse = await dialog.sendMessage(response5.id, 'Сделай краткое резюме обо мне на основе нашего разговора');
        console.log(summaryResponse.response);
        console.log('\n');

        // Получаем финальную информацию о чате
        const chatInfo = await dialog.getChat(response5.id);
        console.log('📊 Статистика чата:');
        console.log(`💬 Всего сообщений: ${chatInfo.chat.messages.length}`);
        console.log(`📋 Заголовок: ${chatInfo.title}`);
        console.log(`🕐 Создан: ${new Date(chatInfo.created_at * 1000).toLocaleString()}`);

        console.log('\n🎉 Диалог успешно завершен!');
        console.log('💡 Модель помнит весь контекст и может ссылаться на предыдущие сообщения.');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Запуск демонстрации
if (require.main === module) {
    demo();
}

module.exports = K2ThinkDialog;
