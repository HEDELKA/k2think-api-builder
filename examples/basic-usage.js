#!/usr/bin/env node

/**
 * Базовый пример использования K2Think API Builder
 */

const { CustomAPIBuilder } = require('../src/index');

async function basicExample() {
    console.log('🚀 Базовый пример K2Think API Builder\n');

    // Создаем билдер
    const builder = new CustomAPIBuilder();
    
    // Инициализируем
    const initialized = await builder.init();
    if (!initialized) {
        console.log('❌ Не удалось инициализировать билдер');
        return;
    }

    // Используем готовый шаблон
    const analyzer = builder.createFromTemplate('textAnalyzer');
    
    try {
        const result = await analyzer.execute('Этот продукт просто замечательный! Качество отличное, рекомендую всем.');
        
        console.log('📊 Результат анализа текста:');
        console.log(JSON.stringify(result, null, 2));
        
        // Проверяем структуру
        if (result.sentiment && result.themes && result.keywords) {
            console.log('✅ Анализ выполнен успешно!');
            console.log(`Тональность: ${result.sentiment}`);
            console.log(`Темы: ${result.themes.join(', ')}`);
            console.log(`Ключевые слова: ${result.keywords.join(', ')}`);
        }
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Запуск примера
if (require.main === module) {
    basicExample().catch(console.error);
}

module.exports = basicExample;
