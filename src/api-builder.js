#!/usr/bin/env node

/**
 * Конструктор кастомных API на основе K2Think.ai
 * 
 * Позволяет создавать свои API для любых задач:
 * - Анализ текста
 * - Генерация контента  
 * - Классификация
 * - Перевод
 * - И многое другое
 */

const fs = require('fs');
const K2ThinkDialog = require('./k2think-dialog');
const CookieConverter = require('./cookie-converter');

class CustomAPIBuilder {
    constructor(options = {}) {
        this.options = options || {};
        this.cookies = null;
        this.dialog = null;
        this.aiEnabled = false;
    }

    async init() {
        try {
            // Пропускаем загрузку cookies если указана опция
            if (this.options.skipCookies) {
                console.log('🔧 AI функции отключены (skipCookies=true)');
                this.aiEnabled = false;
                return true;
            }
            
            // Загружаем cookies
            const converter = new CookieConverter();
            this.cookies = converter.getCookiesFromFile() || process.env.K2THINK_COOKIES;
            
            if (!this.cookies) {
                console.warn('⚠️  Cookies не найдены. AI функции будут отключены.');
                console.log('💡 Для включения AI функций запустите: npm run cookies');
                this.aiEnabled = false;
                return true; // Возвращаем true вместо false
            }
            
            // Валидация cookies
            if (!this.validateCookies(this.cookies)) {
                console.warn('⚠️  Cookies невалидны. AI функции будут отключены.');
                this.aiEnabled = false;
                return true;
            }

            this.dialog = new K2ThinkDialog(this.cookies, 'https://www.k2think.ai', { skipCookies: false });
            this.aiEnabled = true;
            console.log('✅ Custom API Builder готов к работе (с AI функциями)');
            return true;
            
        } catch (error) {
            console.warn('⚠️  Ошибка инициализации AI функций:', error.message);
            console.log('💡 Продолжаем работу без AI функций');
            this.aiEnabled = false;
            this.dialog = null;
            this.cookies = null;
            return true; // Не падаем полностью
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
            return false;
        }
        
        return true;
    }
    
    /**
     * Проверка доступны ли AI функции
     */
    isAIEnabled() {
        return this.aiEnabled && this.dialog !== null;
    }

    /**
     * Улучшенный парсер JSON ответов
     */
    parseJSONResponse(response) {
        try {
            // Ищем JSON в ответе (может быть в кодовых блоках или просто текстом)
            let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (!jsonMatch) {
                jsonMatch = response.match(/\{[\s\S]*\}/);
            }
            
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            }
            
            // Если JSON не найден, пробуем парсить весь ответ
            try {
                return JSON.parse(response);
            } catch {
                return { 
                    error: 'JSON не найден в ответе', 
                    raw_response: response,
                    suggestion: 'Попробуйте улучшить системный промпт для получения структурированного ответа'
                };
            }
        } catch (error) {
            return { 
                error: 'Ошибка парсинга JSON', 
                details: error.message,
                raw_response: response
            };
        }
    }

    /**
     * Создание JSON API метода
     */
    createJSONMethod(name, config) {
        const self = this;
        return {
            name,
            description: config.description,
            systemPrompt: config.systemPrompt || '',
            jsonSchema: config.jsonSchema || null,
            validateInput: config.validateInput || (() => true),
            examples: config.examples || [],
            
            async execute(input, options = {}) {
                try {
                    // Проверяем инициализацию и доступность AI
                    if (!self.isAIEnabled()) {
                        throw new Error('AI функции недоступны. Проверьте настройки cookies или вызовите await init()');
                    }

                    // Валидация
                    if (!this.validateInput(input)) {
                        throw new Error('Неверный формат входных данных');
                    }

                    // Формируем промпт с инструкцией JSON
                    const prompt = this.buildJSONPrompt(input, options);
                    
                    // Создаем временный чат
                    const chat = await self.dialog.createNewChat(prompt);
                    
                    // Получаем ответ
                    const response = await self.dialog.sendMessage(chat.id, prompt);
                    
                    // Парсим JSON
                    const parsedResponse = self.parseJSONResponse(response);
                    
                    // Валидация схемы если есть
                    if (this.jsonSchema && !parsedResponse.error) {
                        const validation = this.validateJSONSchema(parsedResponse, this.jsonSchema);
                        if (!validation.valid) {
                            parsedResponse._validation_errors = validation.errors;
                        }
                    }
                    
                    return parsedResponse;
                    
                } catch (error) {
                    console.error(`❌ Ошибка в методе ${name}:`, error.message);
                    throw error;
                }
            },

            buildJSONPrompt(input, options) {
                let prompt = this.systemPrompt + '\n\n';
                
                // Добавляем схему если есть
                if (this.jsonSchema) {
                    prompt += 'Верни ответ СТРОГО в следующем JSON формате:\n';
                    prompt += '```json\n' + JSON.stringify(this.jsonSchema, null, 2) + '\n```\n\n';
                } else {
                    prompt += 'Верни ответ в формате JSON.\n\n';
                }
                
                if (typeof input === 'object') {
                    prompt += 'Входные данные:\n' + JSON.stringify(input, null, 2) + '\n\n';
                } else {
                    prompt += 'Входные данные: ' + input + '\n\n';
                }
                
                if (options.instructions) {
                    prompt += 'Дополнительные инструкции: ' + options.instructions + '\n\n';
                }
                
                prompt += 'ВАЖНО: Ответ должен быть валидным JSON без дополнительного текста.';
                return prompt;
            },

            validateJSONSchema(data, schema) {
                // Простая валидация схемы
                const errors = [];
                const required = schema.required || [];
                
                for (const field of required) {
                    if (!(field in data)) {
                        errors.push(`Отсутствует обязательное поле: ${field}`);
                    }
                }
                
                return {
                    valid: errors.length === 0,
                    errors
                };
            }
        };
    }

    /**
     * Создание нового API метода (для обратной совместимости)
     */
    createMethod(name, config) {
        return this.createJSONMethod(name, {
            ...config,
            parseResponse: config.parseResponse || this.parseJSONResponse
        });
    }

    /**
     * Готовые шаблоны API
     */
    getTemplates() {
        return {
            // Анализ текста с JSON схемой
            textAnalyzer: {
                description: 'Анализ текста на тональность, темы, ключевые слова',
                systemPrompt: 'Ты - аналитик текста. Проанализируй текст и верни структурированный анализ.',
                jsonSchema: {
                    type: "object",
                    required: ["sentiment", "themes", "keywords", "summary"],
                    properties: {
                        sentiment: { type: "string", enum: ["позитивный", "негативный", "нейтральный"] },
                        themes: { type: "array", items: { type: "string" } },
                        keywords: { type: "array", items: { type: "string" } },
                        summary: { type: "string" },
                        confidence: { type: "number", minimum: 0, maximum: 1 }
                    }
                }
            },

            // Генератор контента с JSON схемой
            contentGenerator: {
                description: 'Генерация контента по заданным параметрам',
                systemPrompt: 'Ты - копирайтер. Создай контент на основе запроса.',
                jsonSchema: {
                    type: "object",
                    required: ["title", "content", "tags"],
                    properties: {
                        title: { type: "string" },
                        content: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        category: { type: "string" },
                        word_count: { type: "number" }
                    }
                }
            },

            // Классификатор с JSON схемой
            classifier: {
                description: 'Классификация объектов по категориям',
                systemPrompt: 'Ты - классификатор. Проанализируй объект и верни классификацию.',
                jsonSchema: {
                    type: "object",
                    required: ["category", "confidence"],
                    properties: {
                        category: { type: "string" },
                        confidence: { type: "number", minimum: 0, maximum: 1 },
                        subcategories: { type: "array", items: { type: "string" } },
                        reasoning: { type: "string" }
                    }
                },
                validateInput: (input) => typeof input === 'string' && input.length > 0
            },

            // Переводчик с JSON схемой
            translator: {
                description: 'Перевод текста между языками',
                systemPrompt: 'Ты - переводчик. Переведи текст с исходного языка на целевой.',
                jsonSchema: {
                    type: "object",
                    required: ["original_text", "translated_text", "source_language", "target_language"],
                    properties: {
                        original_text: { type: "string" },
                        translated_text: { type: "string" },
                        source_language: { type: "string" },
                        target_language: { type: "string" },
                        confidence: { type: "number", minimum: 0, maximum: 1 }
                    }
                },
                validateInput: (input) => input.text && input.from && input.to
            },

            // Экстрактор данных с JSON схемой
            dataExtractor: {
                description: 'Извлечение структурированных данных из текста',
                systemPrompt: 'Ты - экстрактор данных. Извлеки из текста запрошенную информацию.',
                jsonSchema: {
                    type: "object",
                    properties: {}
                }
            },

            // Анализатор тональности с детальной схемой
            sentimentAnalyzer: {
                description: 'Детальный анализ тональности текста',
                systemPrompt: 'Проанализируй тональность текста детально.',
                jsonSchema: {
                    type: "object",
                    required: ["overall_sentiment", "sentiment_score", "emotions"],
                    properties: {
                        overall_sentiment: { type: "string", enum: ["позитивный", "негативный", "нейтральный"] },
                        sentiment_score: { type: "number", minimum: -1, maximum: 1 },
                        emotions: { type: "array", items: { type: "string" } },
                        key_points: { type: "array", items: { type: "string" } },
                        recommendation: { type: "string", enum: ["рекомендует", "не рекомендует", "нейтрально"] },
                        intensity: { type: "string", enum: ["слабая", "умеренная", "сильная"] }
                    }
                }
            },

            // Генератор описаний продуктов
            productDescriber: {
                description: 'Генерация описаний для товаров',
                systemPrompt: 'Ты - копирайтер для интернет-магазина. Создай привлекательное описание товара.',
                jsonSchema: {
                    type: "object",
                    required: ["title", "description", "features", "call_to_action"],
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        features: { type: "array", items: { type: "string" } },
                        call_to_action: { type: "string" },
                        benefits: { type: "array", items: { type: "string" } },
                        target_audience: { type: "string" }
                    }
                },
                validateInput: (input) => input.name && input.category
            }
        };
    }

    /**
     * Создание API из шаблона
     */
    createFromTemplate(templateName, customConfig = {}) {
        const templates = this.getTemplates();
        const template = templates[templateName];
        
        if (!template) {
            throw new Error(`Шаблон "${templateName}" не найден`);
        }

        // Объединяем с кастомной конфигурацией
        const config = { ...template, ...customConfig };
        
        return this.createMethod(templateName, config);
    }

    /**
     * Создание полностью кастомного API
     */
    createCustom(name, config) {
        return this.createMethod(name, config);
    }

    /**
     * Экспорт API в файл
     */
    exportAPI(methods, filename = 'custom-api.js') {
        const apiCode = `
// Автоматически сгенерированный API
const CustomAPIBuilder = require('./api-builder');

class GeneratedAPI {
    constructor() {
        this.builder = new CustomAPIBuilder();
    }

${methods.map(method => `
    async ${method.name}(input, options = {}) {
        const apiMethod = this.builder.createFromTemplate('${method.name}');
        return await apiMethod.execute(input, options);
    }
`).join('')}
}

module.exports = GeneratedAPI;
        `;

        fs.writeFileSync(filename, apiCode);
        console.log(`✅ API экспортирован в файл: ${filename}`);
    }
}

// Демонстрация
async function demo() {
    console.log('🔧 Custom API Builder - Демонстрация JSON API\n');

    // Пример 1: С отключенными AI функциями
    console.log('🔧 Пример 1: Работа без AI функций');
    const builderNoAI = new CustomAPIBuilder({ skipCookies: true });
    const initializedNoAI = await builderNoAI.init();
    
    if (initializedNoAI && !builderNoAI.isAIEnabled()) {
        console.log('✅ Builder успешно инициализирован без AI функций');
    }

    // Пример 2: Попытка с AI функциями
    console.log('\n🤖 Пример 2: Попытка инициализации с AI функциями');
    const builder = new CustomAPIBuilder();
    const initialized = await builder.init();
    
    if (!initialized) {
        console.log('❌ Не удалось инициализировать builder');
        return;
    }
    
    if (!builder.isAIEnabled()) {
        console.log('⚠️  AI функции недоступны, но библиотека продолжает работать');
        console.log('💡 Настройте cookies для включения AI функций');
        return;
    }

    // Пример 1: Анализ текста с JSON схемой
    console.log('📊 Пример 1: Анализ текста с JSON схемой');
    const textAnalyzer = builder.createFromTemplate('textAnalyzer');
    
    try {
        const analysis = await textAnalyzer.execute('Этот продукт просто ужасный, не рекомендую никому!');
        console.log('Результат анализа:', JSON.stringify(analysis, null, 2));
    } catch (error) {
        console.log('Ошибка:', error.message);
    }

    // Пример 2: Классификация с JSON схемой
    console.log('\n🏷️  Пример 2: Классификация с JSON схемой');
    const classifier = builder.createFromTemplate('classifier');
    
    try {
        const classification = await classifier.execute('Tesla Model S');
        console.log('Результат классификации:', JSON.stringify(classification, null, 2));
    } catch (error) {
        console.log('Ошибка:', error.message);
    }

    // Пример 3: Кастомный JSON метод
    console.log('\n🎨 Пример 3: Кастомный JSON метод');
    const customJSONMethod = builder.createJSONMethod('summarizer', {
        description: 'Создание краткого содержания текста',
        systemPrompt: 'Ты - редактор. Создай краткое содержание текста в 1-2 предложения.',
        jsonSchema: {
            type: "object",
            required: ["summary", "word_count"],
            properties: {
                summary: { type: "string" },
                word_count: { type: "number" },
                key_points: { type: "array", items: { type: "string" } }
            }
        }
    });

    try {
        const summary = await customJSONMethod.execute('Искусственный интеллект - это область информатики, которая занимается созданием машин, способных выполнять задачи, требующие человеческого интеллекта. ИИ включает машинное обучение, нейронные сети, обработку естественного языка и многие другие технологии.');
        console.log('Результат суммаризации:', JSON.stringify(summary, null, 2));
    } catch (error) {
        console.log('Ошибка:', error.message);
    }

    // Пример 4: Генератор описаний продуктов
    console.log('\n🛍️  Пример 4: Генератор описаний продуктов');
    const productDescriber = builder.createFromTemplate('productDescriber');
    
    try {
        const description = await productDescriber.execute({
            name: "Смартфон Nova Pro",
            category: "электроника",
            features: ["камера 50Мп", "быстрая зарядка", "5G"]
        });
        console.log('Результат генерации:', JSON.stringify(description, null, 2));
    } catch (error) {
        console.log('Ошибка:', error.message);
    }

    // Пример 5: Детальный анализ тональности
    console.log('\n😊 Пример 5: Детальный анализ тональности');
    const sentimentAnalyzer = builder.createFromTemplate('sentimentAnalyzer');
    
    try {
        const sentiment = await sentimentAnalyzer.execute(
            "Качество отличное, доставка быстрая, но цена завышена. В целом доволен покупкой, хотя есть нюансы."
        );
        console.log('Результат анализа тональности:', JSON.stringify(sentiment, null, 2));
    } catch (error) {
        console.log('Ошибка:', error.message);
    }

    console.log('\n✅ Все примеры завершены!');
    console.log('💡 Каждый метод возвращает структурированный JSON с валидацией схемы');
}

// Запуск
if (require.main === module) {
    demo();
}

module.exports = CustomAPIBuilder;
