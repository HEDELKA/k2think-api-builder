#!/usr/bin/env node

/**
 * Пример создания кастомного JSON API
 */

const { CustomAPIBuilder } = require('../src/index');

async function customAPIExample() {
    console.log('🎨 Пример создания кастомного JSON API\n');

    const builder = new CustomAPIBuilder();
    await builder.init();

    // Создаем свой API для анализа продуктов
    const productAnalyzer = builder.createJSONMethod('productAnalyzer', {
        description: 'Анализ продуктов из отзывов',
        systemPrompt: 'Ты - эксперт по анализу продуктов. Проанализируй отзыв о продукте и верни детальную информацию в JSON формате.',
        
        jsonSchema: {
            type: "object",
            required: ["product_name", "overall_rating", "sentiment", "pros", "cons"],
            properties: {
                product_name: { type: "string" },
                overall_rating: { type: "number", minimum: 1, maximum: 5 },
                sentiment: { 
                    type: "string", 
                    enum: ["позитивный", "негативный", "нейтральный"] 
                },
                pros: { 
                    type: "array", 
                    items: { type: "string" } 
                },
                cons: { 
                    type: "array", 
                    items: { type: "string" } 
                },
                key_features: { 
                    type: "array", 
                    items: { type: "string" } 
                },
                recommendation: { 
                    type: "string", 
                    enum: ["рекомендую", "не рекомендую", "нейтрально"] 
                },
                price_mention: { type: "string" },
                quality_score: { type: "number", minimum: 0, maximum: 10 }
            }
        },

        validateInput: (input) => {
            if (!input || typeof input !== 'string') {
                throw new Error('Требуется текст отзыва');
            }
            if (input.length < 10) {
                throw new Error('Отзыв слишком короткий');
            }
            return true;
        }
    });

    // Тестируем API
    const testReviews = [
        'iPhone 15 Pro Max - просто космос! Камера 48Мп делает потрясающие фото, батарея держит два дня. Да, цена высокая, но оно того стоит.',
        'Этот дешевый смартфон ужасен. Телефон постоянно зависает, камера делает мыльные фото. Зря потратил деньги.',
        'Samsung Galaxy S23 - нормальный телефон. Плюсы: хороший экран, быстрая работа. Минусы: цена завышена, батарея могла бы быть лучше.'
    ];

    for (let i = 0; i < testReviews.length; i++) {
        console.log(`\n📝 Анализ отзыва #${i + 1}:`);
        console.log(`Текст: "${testReviews[i]}"`);
        
        try {
            const analysis = await productAnalyzer.execute(testReviews[i]);
            console.log('📊 Результат анализа:');
            console.log(JSON.stringify(analysis, null, 2));
            
            // Дополнительная обработка
            if (analysis.overall_rating >= 4) {
                console.log('✅ Высокий рейтинг продукта');
            } else if (analysis.overall_rating <= 2) {
                console.log('❌ Низкий рейтинг продукта');
            } else {
                console.log('⚠️ Средний рейтинг продукта');
            }
            
        } catch (error) {
            console.error('❌ Ошибка анализа:', error.message);
        }
        
        console.log('─'.repeat(60));
    }
}

// Запуск примера
if (require.main === module) {
    customAPIExample().catch(console.error);
}

module.exports = customAPIExample;
