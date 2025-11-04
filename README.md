# K2Think API Builder

[![npm version](https://badge.fury.io/js/k2think-api-builder.svg)](https://badge.fury.io/js/k2think-api-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

🚀 **Мощная библиотека для создания кастомных JSON API на основе K2Think.ai**

Создавайте структурированные API с валидацией JSON схем, готовыми шаблонами и полной кастомизацией для ваших проектов.

## ✨ Возможности

- 🎯 **Готовые шаблоны** - 6 предустановленных JSON API для常见 задач
- 🔧 **Кастомные API** - Создавайте любые API с JSON схемами
- ✅ **Валидация схем** - Автоматическая проверка структуры ответов
- 📊 **Структурированные ответы** - Всегда валидный JSON с предсказуемой структурой
- 🚀 **Фабричный метод** - Быстрое создание и инициализация
- 📦 **Экспорт API** - Сохраняйте созданные методы в файлы
- 🧪 **Покрытие тестами** - Надежность и стабильность
- 📚 **Подробная документация** - Легко начать использовать

## 📦 Установка

```bash
npm install k2think-api-builder
```

## 🚀 Быстрый старт

### Базовое использование

```javascript
const { CustomAPIBuilder } = require('k2think-api-builder');

async function quickStart() {
    const builder = new CustomAPIBuilder();
    await builder.init();

    // Используем готовый шаблон
    const analyzer = builder.createFromTemplate('textAnalyzer');
    const result = await analyzer.execute('Этот продукт просто замечательный!');
    
    console.log(result);
    // Вывод:
    // {
    //   "sentiment": "позитивный",
    //   "themes": ["качество", "рекомендация"],
    //   "keywords": ["продукт", "замечательный"],
    //   "confidence": 0.95
    // }
}
```

### Фабричный метод

```javascript
const { create } = require('k2think-api-builder');

async function factoryExample() {
    const builder = await create(); // Автоматическая инициализация
    const api = builder.createFromTemplate('sentimentAnalyzer');
    const result = await api.execute('Отличный день!');
    
    console.log(result.sentiment); // "позитивный"
}
```

## 🎨 Создание кастомных API

```javascript
const { create } = require('k2think-api-builder');

async function customAPI() {
    const builder = await create();

    // Создаем свой API для анализа продуктов
    const productAnalyzer = builder.createJSONMethod('productAnalyzer', {
        description: 'Анализ продуктов из отзывов',
        systemPrompt: 'Проанализируй отзыв о продукте и верни детальную информацию.',
        
        jsonSchema: {
            type: "object",
            required: ["product_name", "rating", "sentiment"],
            properties: {
                product_name: { type: "string" },
                rating: { type: "number", minimum: 1, maximum: 5 },
                sentiment: { 
                    type: "string", 
                    enum: ["позитивный", "негативный", "нейтральный"] 
                },
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } }
            }
        }
    });

    const result = await productAnalyzer.execute(
        'iPhone 15 Pro Max - отличный телефон, камера супер!'
    );
    
    console.log(result);
}
```

## 📊 Доступные шаблоны

| Шаблон | Описание | Пример использования |
|--------|----------|----------------------|
| `textAnalyzer` | Анализ текста с тональностью | Анализ отзывов, комментариев |
| `contentGenerator` | Генерация контента | Создание статей, постов |
| `classifier` | Классификация текста | Категоризация документов |
| `translator` | Перевод текста | Многоязычная поддержка |
| `sentimentAnalyzer` | Детальный анализ тональности | Анализ эмоций |
| `productDescriber` | Генерация описаний продуктов | E-commerce, маркетинг |

## 🔧 API Reference

### CustomAPIBuilder

#### Методы

- `init()` - Инициализация билдера
- `createFromTemplate(templateName)` - Создание API из шаблона
- `createJSONMethod(name, config)` - Создание кастомного JSON API
- `parseJSONResponse(response)` - Извлечение JSON из ответа
- `validateJSON(data, schema)` - Валидация JSON по схеме
- `exportAPI(methods, filename)` - Экспорт API в файл

### Конфигурация JSON метода

```javascript
const config = {
    description: 'Описание API метода',
    systemPrompt: 'Системный промпт для модели',
    jsonSchema: {
        type: 'object',
        required: ['поле1', 'поле2'],
        properties: {
            поле1: { type: 'string' },
            поле2: { type: 'number' }
        }
    },
    validateInput: (input) => {
        // Кастомная валидация входных данных
        return true;
    },
    postProcess: (result) => {
        // Пост-обработка результата
        return result;
    }
};
```

## 📁 Структура проекта

```
k2think-api-builder/
├── src/
│   ├── index.js              # Главный файл библиотеки
│   ├── api-builder.js        # Основной класс CustomAPIBuilder
│   ├── k2think-dialog.js     # Диалог с K2Think
│   └── cookie-converter.js   # Конвертер cookies
├── examples/                 # Примеры использования
│   ├── basic-usage.js
│   ├── custom-api.js
│   ├── batch-processing.js
│   └── factory-method.js
├── tests/                    # Тесты
│   ├── api-builder.test.js
│   └── k2think-dialog.test.js
├── docs/                     # Документация
│   └── create-custom-api.md
├── package.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

## 🧪 Запуск тестов

```bash
# Установка зависимостей
npm install

# Запуск всех тестов
npm test

# Запуск в режиме watch
npm run test:watch

# Проверка кода
npm run lint

# Исправление кода
npm run lint:fix
```

## 📚 Примеры

### Запуск демо

```bash
# Базовый пример
npm run demo

# Примеры из папки examples
node examples/basic-usage.js
node examples/custom-api.js
node examples/batch-processing.js
node examples/factory-method.js
```

### Пакетная обработка

```javascript
const { create } = require('k2think-api-builder');

async function batchProcess() {
    const builder = await create();
    const analyzer = builder.createFromTemplate('sentimentAnalyzer');
    
    const texts = [
        'Отличный продукт!',
        'Ужасное качество...',
        'Нормальный товар.'
    ];
    
    for (const text of texts) {
        const result = await analyzer.execute(text);
        console.log(`${text} -> ${result.overall_sentiment}`);
    }
}
```

## 🔌 Интеграция

### Express.js

```javascript
const express = require('express');
const { create } = require('k2think-api-builder');

const app = express();
app.use(express.json());

let builder;

async function initServer() {
    builder = await create();
    
    app.post('/analyze', async (req, res) => {
        try {
            const analyzer = builder.createFromTemplate('textAnalyzer');
            const result = await analyzer.execute(req.body.text);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    app.listen(3000);
}

initServer();
```

### Next.js API Route

```javascript
// pages/api/analyze.js
import { create } from 'k2think-api-builder';

const builder = await create();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const analyzer = builder.createFromTemplate('textAnalyzer');
            const result = await analyzer.execute(req.body.text);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
```

## 🛠️ Разработка

### Сборка проекта

```bash
npm run build
```

### Генерация документации

```bash
npm run docs
```

## 📝 CHANGELOG

Смотрите [CHANGELOG.md](CHANGELOG.md) для информации об изменениях.

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл для деталей.

## 🤝 Вклад

Приветствуются pull requests и issues! Пожалуйста, ознакомьтесь с нашими правилами внесения вклада.

## 📞 Поддержка

- 📧 Email: support@k2think.ai
- 🐛 Issues: [GitHub Issues](https://github.com/k2think/k2think-api-builder/issues)
- 📖 Документация: [GitHub Wiki](https://github.com/k2think/k2think-api-builder/wiki)

## ⭐ Звезды

Если эта библиотека вам помогла, поставьте ⭐ на GitHub!

---

**Создано с ❤️ командой K2Think.ai**

## 📦 Установка

```bash
npm install
```

## 🔐 Настройка аутентификации

1. Зайдите на [https://www.k2think.ai](https://www.k2think.ai)
2. Авторизуйтесь
3. Откройте DevTools (F12) → Network
4. Отправьте любое сообщение в чате
5. Найдите запрос к API → Headers → Cookie
6. Скопируйте все cookie и установите переменную окружения:

```bash
export K2THINK_COOKIES="token=ваш_jwt; AWSALB=...; AWSALBCORS=...; _ga=...; _fbp=..."
```

## 🔐 Аутентификация

### Автоматическая (рекомендуется):

1. **Экспортируйте cookies** из браузера в формате JSON
2. **Сохраните** как `Cookie.json` в папке проекта
3. **Конвертируйте:** `npm run cookies`
4. **Установите:** `source set-cookies.sh`
5. **Запустите:** `npm start`

### Ручная:

```bash
export K2THINK_COOKIES="token=ваш_jwt; AWSALB=...; _ga=..."
npm start
```

## 🎯 Использование

### Запуск диалога:

```bash
npm start
# или
node k2think-dialog.js
```

### Создание кастомных API:

```bash
npm run api
# или
node api-builder.js
```

### Управление cookies:

```bash
npm run cookies              # конвертировать Cookie.json
node cookie-converter.js show # показать текущие cookies
```

### Анализ HAR файла:

```bash
npm run analyze
# или
node har-analyzer.js
```

### Программное использование:

```javascript
const K2ThinkDialog = require('./k2think-dialog');

const dialog = new K2ThinkDialog(cookies);

// Создание нового чата
const chat = await dialog.createNewChat('Привет! Меня зовут Алексей.');

// Отправка сообщения с потоковым ответом
console.log('🤖 Ответ: ');
const response = await dialog.sendMessage(chat.id, 'Расскажи о себе');
console.log(response);
```

## 📋 Пример диалога

```
👤 Пользователь: Привет! Меня зовут Алексей. Я разработчик из Москвы.
🤖 Ответ: Привет, Алексей! Я искусственный интеллект...

💬 Вопрос: Как меня зовут?
🤖 Ответ: Ваше имя — Алексей.

💬 Вопрос: Чем я занимаюсь?
🤖 Ответ: Вы разработчик...

💬 Вопрос: Откуда я?
🤖 Ответ: Вы из Москвы...
```

## 🏗️ Структура проекта

```
k2think-no-ofs/
├── k2think-dialog.js      # Основной класс для работы с API
├── api-builder.js         # 🎨 Конструктор кастомных API
├── cookie-converter.js    # Конвертер cookies из JSON в строку
├── har-analyzer.js        # Анализатор HAR файлов для извлечения данных
├── package.json           # Зависимости проекта
├── README.md             # Документация
├── create-custom-api.md  # 📚 Документация по созданию API
├── Cookie.json           # Cookies в формате JSON (ваш файл)
├── cookies.txt           # Cookies в строке (генерируется)
└── set-cookies.sh        # Скрипт установки (генерируется)
```

## 🔍 Анализ HAR файла

Если у вас есть HAR файл с записью запросов к K2Think.ai, вы можете:

1. **Разместить HAR файл** в папке проекта как `www.k2think.ai.har`
2. **Запустить анализ:** `npm run analyze` или `node har-analyzer.js`
3. **Получить данные:** cookies, headers, структура запросов

### Что извлекает анализатор:

- 🍪 **Cookies** для аутентификации
- 📡 **API эндпоинты** и методы
- 📝 **Структура запросов** и ответов
- 🔧 **Headers** для правильных запросов

## 🎨 Custom API Builder

Создавайте собственные API методы на основе K2Think.ai для любых задач:

### 📊 Готовые шаблоны:
- **textAnalyzer** - анализ тональности, тем, ключевых слов
- **contentGenerator** - генерация контента по параметрам  
- **classifier** - классификация объектов
- **translator** - перевод между языками
- **dataExtractor** - извлечение структурированных данных

### 🚹 Пример использования:

```javascript
const CustomAPIBuilder = require('./api-builder');
const builder = new CustomAPIBuilder();

// Анализ текста
const analyzer = builder.createFromTemplate('textAnalyzer');
const result = await analyzer.execute('Отличный продукт!');
// { sentiment: 'позитивный', themes: ['отзывы'], keywords: ['отличный'] }

// Кастомный метод
const customMethod = builder.createCustom('summarizer', {
    systemPrompt: 'Создай краткое содержание текста',
    parseResponse: (response) => response.trim()
});

const summary = await customMethod.execute('Длинный текст...');
```

### 📖 Подробнее:
См. `create-custom-api.md` для полной документации.

## ⚙️ API методы

- `createNewChat(message)` - Создание нового чата
- `sendMessage(chatId, message)` - Отправка сообщения с потоковым ответом
- `getChat(chatId)` - Получение информации о чате
- `getChatList(page)` - Получение списка чатов

## 📝 Особенности

- **Память диалога:** Модель помнит всю историю разговора
- **Потоковая передача:** Ответы приходят по частям через SSE
- **Контекст сохраняется:** Каждый новый запрос включает всю историю
- **Русский язык:** Полная поддержка русского языка

## 🔧 Требования

- Node.js 18+
- npm

## 📄 Лицензия

MIT
