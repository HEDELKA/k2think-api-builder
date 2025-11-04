#!/usr/bin/env node

/**
 * Пример пакетной обработки данных
 */

const { CustomAPIBuilder } = require('../src/index');

async function batchProcessingExample() {
    console.log('📦 Пример пакетной обработки данных\n');

    const builder = new CustomAPIBuilder();
    await builder.init();

    // Создаем API для анализа тональности
    const sentimentAnalyzer = builder.createFromTemplate('sentimentAnalyzer');

    // Массив текстов для анализа
    const texts = [
        'Отличный продукт, очень доволен покупкой!',
        'Ужасное качество, зря потратил деньги.',
        'Нормальный товар, соответствует цене.',
        'Просто супер! Лучший выбор в этой категории.',
        'Не рекомендую, много недостатков.',
        'Хороший сервис, быстрая доставка.',
        'Цена завышена, качество среднее.',
        'Идеально для моих задач, всем доволен!'
    ];

    console.log(`📊 Анализ ${texts.length} текстов...\n`);

    const results = [];
    const startTime = Date.now();

    // Обрабатываем тексты пакетно
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        
        try {
            console.log(`🔍 Анализ текста ${i + 1}/${texts.length}: "${text}"`);
            
            const result = await sentimentAnalyzer.execute(text);
            
            // Добавляем метаданные
            results.push({
                id: i + 1,
                original_text: text,
                analysis: result,
                processed_at: new Date().toISOString()
            });

            // Выводим краткий результат
            console.log(`   Тональность: ${result.overall_sentiment}`);
            console.log(`   Оценка: ${result.sentiment_score}`);
            console.log(`   Эмоции: ${result.emotions.join(', ')}`);
            console.log('');

        } catch (error) {
            console.error(`❌ Ошибка при анализе текста ${i + 1}:`, error.message);
            
            results.push({
                id: i + 1,
                original_text: text,
                error: error.message,
                processed_at: new Date().toISOString()
            });
        }
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Статистика обработки
    console.log('📈 Статистика обработки:');
    console.log(`✅ Успешно обработано: ${results.filter(r => !r.error).length}/${texts.length}`);
    console.log(`❌ Ошибок: ${results.filter(r => r.error).length}/${texts.length}`);
    console.log(`⏱️ Время обработки: ${processingTime}мс`);
    console.log(`⚡ Среднее время на запрос: ${(processingTime / texts.length).toFixed(0)}мс`);

    // Анализ результатов
    const successfulResults = results.filter(r => !r.error);
    if (successfulResults.length > 0) {
        const sentiments = successfulResults.map(r => r.analysis.overall_sentiment);
        const sentimentCounts = {
            позитивный: sentiments.filter(s => s === 'позитивный').length,
            негативный: sentiments.filter(s => s === 'негативный').length,
            нейтральный: sentiments.filter(s => s === 'нейтральный').length
        };

        console.log('\n📊 Распределение тональности:');
        console.log(`😊 Позитивных: ${sentimentCounts.позитивный}`);
        console.log(`😔 Негативных: ${sentimentCounts.негативный}`);
        console.log(`😐 Нейтральных: ${sentimentCounts.нейтральный}`);

        // Находим самый эмоциональный текст
        const mostEmotional = successfulResults.reduce((max, current) => {
            const maxScore = Math.abs(max.analysis.sentiment_score);
            const currentScore = Math.abs(current.analysis.sentiment_score);
            return currentScore > maxScore ? current : max;
        });

        console.log('\n🎯 Самый эмоциональный отзыв:');
        console.log(`Текст: "${mostEmotional.original_text}"`);
        console.log(`Тональность: ${mostEmotional.analysis.overall_sentiment}`);
        console.log(`Оценка: ${mostEmotional.analysis.sentiment_score}`);
    }

    // Сохраняем результаты в файл
    const fs = require('fs');
    const reportData = {
        metadata: {
            total_texts: texts.length,
            successful: successfulResults.length,
            failed: results.filter(r => r.error).length,
            processing_time_ms: processingTime,
            processed_at: new Date().toISOString()
        },
        results: results
    };

    try {
        fs.writeFileSync('batch-analysis-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n💾 Отчет сохранен в файл: batch-analysis-report.json');
    } catch (error) {
        console.error('❌ Ошибка сохранения отчета:', error.message);
    }
}

// Запуск примера
if (require.main === module) {
    batchProcessingExample().catch(console.error);
}

module.exports = batchProcessingExample;
