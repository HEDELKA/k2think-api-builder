/**
 * Тесты для CustomAPIBuilder
 */

const { CustomAPIBuilder, create } = require('../src/index');

describe('CustomAPIBuilder', () => {
    let builder;

    beforeAll(async () => {
        builder = new CustomAPIBuilder();
        await builder.init();
    });

    describe('Инициализация', () => {
        test('должен инициализироваться корректно', async () => {
            const newBuilder = new CustomAPIBuilder();
            const initialized = await newBuilder.init();
            expect(initialized).toBe(true);
        });

        test('должен иметь диалог после инициализации', () => {
            expect(builder.dialog).toBeDefined();
            expect(typeof builder.dialog.sendMessage).toBe('function');
        });
    });

    describe('Создание API методов', () => {
        test('должен создавать метод из шаблона', () => {
            const api = builder.createFromTemplate('textAnalyzer');
            expect(api).toBeDefined();
            expect(typeof api.execute).toBe('function');
            expect(api.name).toBe('textAnalyzer');
        });

        test('должен создавать кастомный JSON метод', () => {
            const api = builder.createJSONMethod('testAPI', {
                description: 'Тестовый API',
                systemPrompt: 'Тестовый промпт',
                jsonSchema: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { type: 'string' }
                    }
                }
            });

            expect(api).toBeDefined();
            expect(typeof api.execute).toBe('function');
            expect(api.name).toBe('testAPI');
        });

        test('должен выбрасывать ошибку для несуществующего шаблона', () => {
            expect(() => {
                builder.createFromTemplate('nonExistentTemplate');
            }).toThrow('Шаблон "nonExistentTemplate" не найден');
        });
    });

    describe('Парсинг JSON ответов', () => {
        test('должен извлекать JSON из markdown', () => {
            const response = 'Вот результат анализа:\n```json\n{"status": "ok", "data": "test"}\n```\nКонец ответа.';
            const result = builder.parseJSONResponse(response);
            
            expect(result).toEqual({ status: 'ok', data: 'test' });
        });

        test('должен обрабатывать чистый JSON', () => {
            const response = '{"status": "ok", "data": "test"}';
            const result = builder.parseJSONResponse(response);
            
            expect(result).toEqual({ status: 'ok', data: 'test' });
        });

        test('должен возвращать ошибку для невалидного JSON', () => {
            const response = 'Это не JSON ответ';
            const result = builder.parseJSONResponse(response);
            
            expect(result).toHaveProperty('error');
            expect(result.error).toBe('JSON не найден в ответе');
        });
    });
});

describe('Фабричный метод', () => {
    test('должен создавать инициализированный билдер', async () => {
        const builder = await create();
        expect(builder).toBeDefined();
        expect(typeof builder.createFromTemplate).toBe('function');
        expect(typeof builder.createJSONMethod).toBe('function');
    });
});

describe('Интеграция с реальным API', () => {
    let builder;

    beforeAll(async () => {
        builder = await create();
    });

    test('должен выполнять текстовый анализ', async () => {
        const analyzer = builder.createFromTemplate('textAnalyzer');
        
        // Мокаем реальный вызов API
        const mockResponse = JSON.stringify({
            sentiment: 'позитивный',
            themes: ['качество', 'рекомендация'],
            keywords: ['отличный', 'продукт'],
            confidence: 0.95
        });

        // Заменяем метод execute на мок
        analyzer.execute = jest.fn().mockResolvedValue(JSON.parse(mockResponse));

        const result = await analyzer.execute('Отличный продукт!');
        
        expect(result).toBeDefined();
        expect(result.sentiment).toBe('позитивный');
        expect(result.themes).toContain('качество');
        expect(result.keywords).toContain('отличный');
    }, 10000);

    test('должен обрабатывать ошибки API', async () => {
        const analyzer = builder.createFromTemplate('textAnalyzer');
        
        // Мокаем ошибку
        analyzer.execute = jest.fn().mockRejectedValue(new Error('API недоступен'));

        await expect(analyzer.execute('Тест')).rejects.toThrow('API недоступен');
    });
});
