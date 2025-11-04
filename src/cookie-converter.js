#!/usr/bin/env node

/**
 * Конвертер cookies из формата JSON в строку для HTTP запросов
 * 
 * Использование:
 * node cookie-converter.js - конвертировать Cookie.json в cookies.txt
 */

const fs = require('fs');

class CookieConverter {
    constructor() {
        this.cookieJsonPath = './Cookie.json';
        this.cookieTxtPath = './cookies.txt';
    }

    /**
     * Загрузка cookies из JSON файла
     */
    loadCookiesFromJson() {
        try {
            if (!fs.existsSync(this.cookieJsonPath)) {
                console.error('❌ Файл Cookie.json не найден');
                return null;
            }

            const content = fs.readFileSync(this.cookieJsonPath, 'utf8');
            const cookies = content.split('\n').map(line => {
                const cookieMatch = line.match(/^([^=]+)=(.*)$/);
                if (cookieMatch) {
                    return {
                        name: cookieMatch[1].trim(),
                        value: cookieMatch[2].trim()
                    };
                } else {
                    console.warn(`⚠️  Пропуск строки без формата name=value: ${line}`);
                    return null;
                }
            }).filter(cookie => cookie !== null);
            
            console.log(`✅ Загружено ${cookies.length} cookies из Cookie.json`);
            return cookies;
        } catch (error) {
            console.error('❌ Ошибка загрузки Cookie.json:', error.message);
            return null;
        }
    }

    /**
     * Конвертация cookies в строку формата с валидацией
     */
    convertCookiesToString(cookies) {
        if (!Array.isArray(cookies)) {
            console.error('❌ Неверный формат cookies - ожидается массив');
            return null;
        }

        const cookiePairs = cookies.map(cookie => {
            if (!cookie.name || !cookie.value) {
                console.warn(`⚠️  Пропуск cookie без name или value: ${JSON.stringify(cookie)}`);
                return null;
            }
            
            // Валидация имени cookie
            if (!this.validateCookieName(cookie.name)) {
                console.warn(`⚠️  Невалидное имя cookie: ${cookie.name}`);
                return null;
            }
            
            // Валидация и кодирование значения cookie
            const encodedValue = this.encodeCookieValue(cookie.value);
            return `${cookie.name}=${encodedValue}`;
        }).filter(pair => pair !== null);

        const cookieString = cookiePairs.join('; ');
        console.log(`✅ Сконвертировано ${cookiePairs.length} cookies в строку`);
        
        return cookieString;
    }
    
    /**
     * Валидация имени cookie
     */
    validateCookieName(name) {
        if (!name || typeof name !== 'string') {
            return false;
        }
        
        // Имя cookie не должно содержать специальные символы
        const invalidChars = /[\s()<>@,;:"/[\]?={}]/;
        if (invalidChars.test(name)) {
            return false;
        }
        
        return name.length > 0 && name.length <= 4096;
    }
    
    /**
     * Кодирование значения cookie для безопасной передачи
     */
    encodeCookieValue(value) {
        if (!value || typeof value !== 'string') {
            return '';
        }
        
        try {
            // Кодируем специальные символы для HTTP заголовков
            return encodeURIComponent(value)
                .replace(/[!'()*]/g, function(c) {
                    return '%' + c.charCodeAt(0).toString(16);
                });
        } catch (error) {
            console.warn('⚠️  Ошибка кодирования значения cookie:', error.message);
            return value;
        }
    }

    /**
     * Сохранение cookies в файл
     */
    saveCookiesToFile(cookieString) {
        try {
            fs.writeFileSync(this.cookieTxtPath, cookieString, 'utf8');
            console.log(`✅ Cookies сохранены в файл: ${this.cookieTxtPath}`);
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения cookies:', error.message);
            return false;
        }
    }

    /**
     * Установка переменной окружения
     */
    setEnvironmentVariable(cookieString) {
        try {
            // Создаем скрипт для установки переменной окружения
            const scriptContent = `#!/bin/bash
# K2Think.ai Cookies Setup Script
# Сгенерировано из Cookie.json

export K2THINK_COOKIES="${cookieString}"

echo "✅ K2THINK_COOKIES установлена!"
echo "Теперь можно запустить: npm start"
echo "Для проверки: echo $K2THINK_COOKIES"
`;

            const scriptPath = './set-cookies.sh';
            fs.writeFileSync(scriptPath, scriptContent, 'utf8');
            fs.chmodSync(scriptPath, '755');
            
            console.log(`✅ Скрипт установки создан: ${scriptPath}`);
            console.log('💡 Запустите: source set-cookies.sh или ./set-cookies.sh');
            
            return scriptPath;
        } catch (error) {
            console.error('❌ Ошибка создания скрипта:', error.message);
            return null;
        }
    }

    /**
     * Получение cookies из файла с улучшенной обработкой ошибок
     */
    getCookiesFromFile() {
        try {
            if (!fs.existsSync(this.cookieTxtPath)) {
                // Не выводим ошибку, просто возвращаем null
                return null;
            }

            const cookieString = fs.readFileSync(this.cookieTxtPath, 'utf8').trim();
            
            // Проверяем валидность cookies
            if (!this.validateCookieString(cookieString)) {
                console.warn('⚠️  Невалидные cookies в файле');
                return null;
            }
            
            return cookieString;
        } catch (error) {
            console.warn('⚠️  Ошибка чтения cookies.txt:', error.message);
            return null;
        }
    }
    
    /**
     * Валидация строки cookies
     */
    validateCookieString(cookieString) {
        if (!cookieString || typeof cookieString !== 'string') {
            return false;
        }
        
        // Проверяем наличие базовой структуры
        const hasNameValuePair = cookieString.includes('=');
        if (!hasNameValuePair) {
            return false;
        }
        
        // Проверяем на недопустимые символы для HTTP заголовков
        // eslint-disable-next-line no-control-regex
        const invalidChars = /[\x00-\x1F\x7F]/; // Control characters
        if (invalidChars.test(cookieString)) {
            return false;
        }
        
        return true;
    }

    /**
     * Основной процесс конвертации
     */
    convert() {
        console.log('🔄 Конвертация Cookie.json в cookies...\n');

        // Загружаем JSON
        const cookies = this.loadCookiesFromJson();
        if (!cookies) return;

        // Конвертируем в строку
        const cookieString = this.convertCookiesToString(cookies);
        if (!cookieString) return;

        // Сохраняем в файл
        if (this.saveCookiesToFile(cookieString)) {
            // Создаем скрипт для установки
            this.setEnvironmentVariable(cookieString);
            
            console.log('\n🎉 Готово!');
            console.log('📁 Файлы созданы:');
            console.log(`  - cookies.txt (строка cookies)`);
            console.log(`  - set-cookies.sh (скрипт установки)`);
            
            console.log('\n🚀 Следующие шаги:');
            console.log('1. source set-cookies.sh  # или ./set-cookies.sh');
            console.log('2. npm start              # запуск диалога');
        }
    }

    /**
     * Показать текущие cookies
     */
    showCookies() {
        const cookies = this.getCookiesFromFile();
        if (cookies) {
            console.log('\n🍪 Текущие cookies:');
            console.log(cookies.substring(0, 100) + '...');
            
            // Проверяем наличие токена
            if (cookies.includes('token=')) {
                console.log('✅ Токен авторизации найден');
            } else {
                console.log('❌ Токен авторизации НЕ найден');
            }
        }
    }
}

// Запуск
if (require.main === module) {
    const converter = new CookieConverter();
    const command = process.argv[2];

    switch (command) {
        case 'show':
            converter.showCookies();
            break;
        case 'help':
        case '--help':
        case '-h':
            console.log(`
🍪 Cookie Converter для K2Think.ai

Использование:
  node cookie-converter.js     # конвертировать Cookie.json в cookies.txt
  node cookie-converter.js show # показать текущие cookies
  node cookie-converter.js help # показать справку

Файлы:
  - Cookie.json  # исходный файл с cookies в формате JSON
  - cookies.txt  # результат конвертации в строку
  - set-cookies.sh # скрипт для установки переменной окружения
            `);
            break;
        default:
            converter.convert();
    }
}

module.exports = CookieConverter;
