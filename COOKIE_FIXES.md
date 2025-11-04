# 🐛 Исправления проблем с cookies в k2think-api-builder

## ✅ Решенные проблемы

### 1. **Ошибка с cookies в HTTP заголовках**
- **Проблема:** `Invalid character in header content ["Cookie"]`
- **Решение:** Добавлено URL encoding для значений cookies
- **Файлы:** `src/k2think-dialog.js`, `src/cookie-converter.js`

### 2. **Обязательное наличие файла cookies.txt**
- **Проблема:** Библиотека падала при отсутствии cookies
- **Решение:** Добавлен graceful fallback - библиотека работает без AI функций
- **Файлы:** `src/api-builder.js`

### 3. **Отсутствие обработки ошибок**
- **Проблема:** Нет try-catch при загрузке cookies
- **Решение:** Добавлена обработка ошибок с warn сообщениями
- **Файлы:** Все файлы библиотеки

## 🔧 Новые возможности

### 1. **Опциональная загрузка cookies**
```javascript
// Работа без AI функций
const builder = new CustomAPIBuilder({ skipCookies: true });
await builder.init();

// Работа с AI функциями (требуются cookies)
const builder = new CustomAPIBuilder();
await builder.init();
```

### 2. **Проверка доступности AI функций**
```javascript
if (builder.isAIEnabled()) {
    // AI функции доступны
    const result = await method.execute(input);
} else {
    console.log('AI функции отключены');
}
```

### 3. **Автоматическое кодирование cookies**
```javascript
// Специальные символы кодируются автоматически
const cookies = 'token=value$with/special=chars';
const dialog = new K2ThinkDialog(cookies);
// $ -> %24, / -> %2F, = -> %3D
```

## 📝 Примеры использования

### Базовый пример с graceful fallback
```javascript
const CustomAPIBuilder = require('./src/api-builder');

async function example() {
    const builder = new CustomAPIBuilder();
    await builder.init();
    
    if (builder.isAIEnabled()) {
        console.log('✅ AI функции доступны');
        
        const analyzer = builder.createFromTemplate('textAnalyzer');
        const result = await analyzer.execute('Текст для анализа');
        console.log(result);
    } else {
        console.log('⚠️ AI функции недоступны');
        console.log('Настройте cookies для включения AI функций');
    }
}

example().catch(console.error);
```

### Явное отключение AI функций
```javascript
const builder = new CustomAPIBuilder({ skipCookies: true });
await builder.init();

console.log('Библиотека работает без AI функций');
```

### Работа с cookies напрямую
```javascript
const K2ThinkDialog = require('./src/k2think-dialog');

// Cookies с специальными символами
const cookies = 'session=abc123; ga_cookie=value$with/special=chars';

try {
    const dialog = new K2ThinkDialog(cookies);
    // Cookies автоматически закодированы для HTTP заголовков
    console.log('✅ Dialog создан с закодированными cookies');
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}
```

## 🧪 Тестирование

Запустите тесты для проверки всех исправлений:

```bash
node test-fixes.js
```

Тесты проверяют:
- ✅ Graceful fallback при отсутствии cookies
- ✅ Опциональное отключение cookies
- ✅ URL encoding специальных символов
- ✅ Валидацию символов в cookies
- ✅ Обработку ошибок

## 🔄 Обновленный API

### CustomAPIBuilder

#### Конструктор
```javascript
new CustomAPIBuilder(options)
```

**Options:**
- `skipCookies` (boolean) - пропустить загрузку cookies, по умолчанию `false`

#### Методы
- `await init()` - инициализация с graceful fallback
- `isAIEnabled()` - проверка доступности AI функций

### K2ThinkDialog

#### Конструктор
```javascript
new K2ThinkDialog(cookies, baseUrl, options)
```

**Options:**
- `skipCookies` (boolean) - для внутреннего использования

### CookieConverter

#### Новые методы
- `validateCookieString(cookieString)` - валидация строки cookies
- `validateCookieName(name)` - валидация имени cookie
- `encodeCookieValue(value)` - кодирование значения cookie

## 🚀 Миграция со старой версии

### Старый код (продолжает работать)
```javascript
const builder = new CustomAPIBuilder();
await builder.init();
```

### Новый код (рекомендуется)
```javascript
const builder = new CustomAPIBuilder();
await builder.init();

if (builder.isAIEnabled()) {
    // Используем AI функции
} else {
    // Обрабатываем отсутствие AI
}
```

## 📋 Совместимость

- ✅ Обратная совместимость сохранена
- ✅ Старый код продолжает работать
- ✅ Новые функции опциональны
- ✅ Node.js >= 14.0.0

## 🎯 Результат

Библиотека теперь:
1. **Не падает** при отсутствии cookies
2. **Корректно обрабатывает** специальные символы в cookies
3. **Предоставляет graceful fallback** для работы без AI
4. **Имеет улучшенную обработку ошибок**
5. **Сохраняет обратную совместимость**

Интеграция стала значительно проще и надежнее! 🔧✨
