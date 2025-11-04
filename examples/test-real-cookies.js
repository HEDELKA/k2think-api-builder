#!/usr/bin/env node

/**
 * Тест с реальными cookies из файла
 */

const fs = require('fs');
const CustomAPIBuilder = require('./src/api-builder');
const K2ThinkDialog = require('./src/k2think-dialog');

async function testWithRealCookies() {
    console.log('🍪 Тест с реальными cookies из файла cookies.txt\n');
    
    try {
        // Читаем cookies из файла
        const cookies = fs.readFileSync('./cookies.txt', 'utf8').trim();
        console.log('📝 Cookies загружены из файла');
        console.log(`   Длина: ${cookies.length} символов`);
        console.log(`   Превью: ${cookies.substring(0, 100)}...`);
        
        // Проверяем наличие специальных символов
        const hasSpecialChars = /[$;/=]/.test(cookies);
        console.log(`   Специальные символы: ${hasSpecialChars ? 'найдены' : 'не найдены'}`);
        
        // Тестируем K2ThinkDialog с реальными cookies
        console.log('\n🤖 Тест K2ThinkDialog:');
        const dialog = new K2ThinkDialog(cookies);
        console.log('   ✅ Dialog создан успешно');
        console.log(`   Cookies закодированы: ${dialog.cookies !== cookies}`);
        
        if (dialog.cookies !== cookies) {
            console.log('   ✅ Специальные символы были закодированы');
        }
        
        // Тестируем CustomAPIBuilder
        console.log('\n🔧 Тест CustomAPIBuilder:');
        const builder = new CustomAPIBuilder();
        const initialized = await builder.init();
        
        console.log(`   Инициализация: ${initialized ? 'успешна' : 'не удалась'}`);
        console.log(`   AI функции: ${builder.isAIEnabled() ? 'включены' : 'отключены'}`);
        
        if (builder.isAIEnabled()) {
            console.log('   ✅ Библиотека готова к работе с AI функциями');
            
            // Пробуем создать метод (без реального запроса)
            const analyzer = builder.createFromTemplate('textAnalyzer');
            console.log('   ✅ JSON метод создан успешно');
            console.log('   📝 Название:', analyzer.name);
            console.log('   📋 Описание:', analyzer.description);
        }
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Запуск теста
if (require.main === module) {
    testWithRealCookies().catch(console.error);
}

module.exports = { testWithRealCookies };
