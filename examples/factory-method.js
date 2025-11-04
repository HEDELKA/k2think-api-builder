#!/usr/bin/env node

/**
 * Пример использования фабричного метода для быстрого создания API
 */

const { create } = require('../src/index');

async function factoryMethodExample() {
    console.log('🏭 Пример использования фабричного метода\n');

    try {
        // Создаем билдер с помощью фабричного метода
        const builder = await create();
        console.log('✅ Билдер успешно создан и инициализирован');

        // Быстро создаем несколько API методов
        const apis = {
            textAnalyzer: builder.createFromTemplate('textAnalyzer'),
            classifier: builder.createFromTemplate('classifier'),
            translator: builder.createFromTemplate('translator'),
            contentGenerator: builder.createFromTemplate('contentGenerator')
        };

        console.log('📊 Создано API методов:', Object.keys(apis).length);

        // Демонстрируем работу каждого API
        const testCases = [
            {
                api: 'textAnalyzer',
                input: 'Этот смартфон просто потрясающий! Камера отличная, батарея держит долго.',
                description: 'Анализ текста'
            },
            {
                api: 'classifier',
                input: 'Tesla Model S',
                description: 'Классификация'
            },
            {
                api: 'translator',
                input: { text: 'Hello world', from: 'en', to: 'ru' },
                description: 'Перевод'
            },
            {
                api: 'contentGenerator',
                input: { topic: 'искусственный интеллект', style: 'научный', length: 'средний' },
                description: 'Генерация контента'
            }
        ];

        console.log('\n🚀 Тестирование API методов:\n');

        for (const testCase of testCases) {
            console.log(`📝 ${testCase.description}:`);
            console.log(`Входные данные: ${JSON.stringify(testCase.input)}`);
            
            try {
                const result = await apis[testCase.api].execute(testCase.input);
                console.log('✅ Результат:');
                console.log(JSON.stringify(result, null, 2));
            } catch (error) {
                console.error('❌ Ошибка:', error.message);
            }
            
            console.log('─'.repeat(50));
        }

        // Создаем кастомный API с помощью фабричного метода
        console.log('🎨 Создание кастомного API через фабричный метод:');
        
        const customAPI = builder.createJSONMethod('reviewAnalyzer', {
            description: 'Анализ отзывов',
            systemPrompt: 'Проанализируй отзыв и верни структурированный анализ.',
            jsonSchema: {
                type: "object",
                required: ["rating", "sentiment", "summary"],
                properties: {
                    rating: { type: "number", minimum: 1, maximum: 5 },
                    sentiment: { type: "string", enum: ["позитивный", "негативный", "нейтральный"] },
                    summary: { type: "string" }
                }
            }
        });

        const customResult = await customAPI.execute(
            "Отличный продукт! Качество на высоте, рекомендую всем друзьям."
        );
        
        console.log('🎯 Результат кастомного API:');
        console.log(JSON.stringify(customResult, null, 2));

        // Экспортируем все созданные API
        console.log('\n📦 Экспорт API в файл...');
        
        const apiMethods = Object.values(apis);
        apiMethods.push(customAPI);
        
        builder.exportAPI(apiMethods, 'generated-api.js');
        
        console.log('✅ Все API экспортированы в generated-api.js');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Запуск примера
if (require.main === module) {
    factoryMethodExample().catch(console.error);
}

module.exports = factoryMethodExample;
