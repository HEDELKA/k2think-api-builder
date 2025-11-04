# 🎨 Создание кастомных JSON API на основе K2Think.ai

## 📋 Обзор

Custom API Builder позволяет создавать **структурированные JSON API** на основе K2Think.ai. Каждый API метод возвращает валидированный JSON с предопределенной схемой.

### ✨ Возможности:
- 🎯 **JSON схемы** - строгая структура ответов
- 🔍 **Валидация** данных по схеме
- 📊 **Структурированные ответы** без лишнего текста
- 🚀 **Готовые шаблоны** для常见 задач
- 🎨 **Кастомные схемы** для любых задач

---

## 🚀 Быстрый старт

### 1. Базовое использование

```javascript
const CustomAPIBuilder = require('./api-builder');

// Создаем билдер
const builder = new CustomAPIBuilder();
await builder.init();

// Используем готовый шаблон
const analyzer = builder.createFromTemplate('textAnalyzer');
const result = await analyzer.execute('Отличный продукт!');

// Результат - структурированный JSON:
console.log(result);
// {
//   "sentiment": "позитивный",
//   "themes": ["отзывы", "рекомендации"],
//   "keywords": ["отличный", "рекомендую"],
//   "summary": "Пользователь положительно оценивает продукт",
//   "confidence": 0.9
// }
```

### 2. Создание кастомного JSON API

```javascript
// Создаем свой метод с JSON схемой
const productAPI = builder.createJSONMethod('productAnalyzer', {
    description: 'Анализ продуктов',
    systemPrompt: 'Проанализируй продукт и верни детальную информацию',
    
    jsonSchema: {
        type: "object",
        required: ["name", "category", "rating"],
        properties: {
            name: { type: "string" },
            category: { type: "string" },
            rating: { type: "number", minimum: 1, maximum: 5 },
            features: { type: "array", items: { type: "string" } },
            price_range: { type: "string" }
        }
    }
});

// Используем API
const analysis = await productAPI.execute({
    text: "iPhone 15 Pro Max с титановым корпусом, камера 48Мп, цена от 150000 руб"
});
```

---

## 📊 Доступные шаблоны JSON API

### 1. textAnalyzer - Анализ текста

```javascript
const analyzer = builder.createFromTemplate('textAnalyzer');
const result = await analyzer.execute('Текст для анализа');
```

**JSON схема:**
```json
{
  "type": "object",
  "required": ["sentiment", "themes", "keywords", "summary"],
  "properties": {
    "sentiment": { "type": "string", "enum": ["позитивный", "негативный", "нейтральный"] },
    "themes": { "type": "array", "items": { "type": "string" } },
    "keywords": { "type": "array", "items": { "type": "string" } },
    "summary": { "type": "string" },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
  }
}
```

**Пример ответа:**
```json
{
  "sentiment": "позитивный",
  "themes": ["отзывы", "качество"],
  "keywords": ["отличный", "качественный", "рекомендую"],
  "summary": "Пользователь доволен качеством продукта",
  "confidence": 0.95
}
```

### 2. contentGenerator - Генерация контента

```javascript
const generator = builder.createFromTemplate('contentGenerator');
const content = await generator.execute({
    topic: "искусственный интеллект",
    style: "технический",
    length: "короткий"
});
```

**JSON схема:**
```json
{
  "type": "object",
  "required": ["title", "content", "tags"],
  "properties": {
    "title": { "type": "string" },
    "content": { "type": "string" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "category": { "type": "string" },
    "word_count": { "type": "number" }
  }
}
```

### 3. classifier - Классификация

```javascript
const classifier = builder.createFromTemplate('classifier');
const result = await classifier.execute('Tesla Model S');
```

**JSON схема:**
```json
{
  "type": "object",
  "required": ["category", "confidence"],
  "properties": {
    "category": { "type": "string" },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "subcategories": { "type": "array", "items": { "type": "string" } },
    "reasoning": { "type": "string" }
  }
}
```

### 4. translator - Переводчик

```javascript
const translator = builder.createFromTemplate('translator');
const result = await translator.execute({
    text: "Hello world",
    from: "en",
    to: "ru"
});
```

**JSON схема:**
```json
{
  "type": "object",
  "required": ["original_text", "translated_text", "source_language", "target_language"],
  "properties": {
    "original_text": { "type": "string" },
    "translated_text": { "type": "string" },
    "source_language": { "type": "string" },
    "target_language": { "type": "string" },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
  }
}
```

### 5. sentimentAnalyzer - Детальный анализ тональности

```javascript
const sentimentAnalyzer = builder.createFromTemplate('sentimentAnalyzer');
const result = await sentimentAnalyzer.execute('Текст для анализа');
```

**JSON схема:**
```json
{
  "type": "object",
  "required": ["overall_sentiment", "sentiment_score", "emotions"],
  "properties": {
    "overall_sentiment": { 
      "type": "string", 
      "enum": ["позитивный", "негативный", "нейтральный"] 
    },
    "sentiment_score": { "type": "number", "minimum": -1, "maximum": 1 },
    "emotions": { "type": "array", "items": { "type": "string" } },
    "key_points": { "type": "array", "items": { "type": "string" } },
    "recommendation": { 
      "type": "string", 
      "enum": ["рекомендует", "не рекомендует", "нейтрально"] 
    },
    "intensity": { 
      "type": "string", 
      "enum": ["слабая", "умеренная", "сильная"] 
    }
  }
}
```

### 6. productDescriber - Генератор описаний продуктов

```javascript
const productDescriber = builder.createFromTemplate('productDescriber');
const result = await productDescriber.execute({
    name: "Смартфон Nova Pro",
    category: "электроника",
    features: ["камера 50Мп", "быстрая зарядка", "5G"]
});
```

**JSON схема:**
```json
{
  "type": "object",
  "required": ["title", "description", "features", "call_to_action"],
  "properties": {
    "title": { "type": "string" },
    "description": { "type": "string" },
    "features": { "type": "array", "items": { "type": "string" } },
    "call_to_action": { "type": "string" },
    "benefits": { "type": "array", "items": { "type": "string" } },
    "target_audience": { "type": "string" }
  }
}
```

---

## 🎨 Создание кастомных JSON API

### Базовый синтаксис

```javascript
const customAPI = builder.createJSONMethod('methodName', {
    description: 'Описание метода',
    systemPrompt: 'Системный промпт для ИИ',
    
    jsonSchema: {
        type: "object",
        required: ["field1", "field2"],
        properties: {
            field1: { type: "string" },
            field2: { type: "number" },
            optionalField: { type: "array", items: { "type": "string" } }
        }
    },
    
    validateInput: (input) => {
        // Кастомная валидация входных данных
        return typeof input === 'string' && input.length > 0;
    }
});
```

### Продвинутый пример

```javascript
// API для анализа финансовой отчетности
const financialAnalyzer = builder.createJSONMethod('financialAnalyzer', {
    description: 'Анализ финансовых показателей',
    systemPrompt: 'Ты - финансовый аналитик. Проанализируй финансовые данные и верни структурированный отчет.',
    
    jsonSchema: {
        type: "object",
        required: ["revenue", "profit", "growth_rate", "recommendation"],
        properties: {
            revenue: { 
                type: "object",
                properties: {
                    current: { type: "number" },
                    previous: { type: "number" },
                    change_percent: { type: "number" }
                }
            },
            profit: { 
                type: "object",
                properties: {
                    net_profit: { type: "number" },
                    gross_profit: { type: "number" },
                    margin: { type: "number" }
                }
            },
            growth_rate: { type: "number", minimum: -1, maximum: 10 },
            recommendation: { 
                type: "string", 
                enum: ["покупать", "держать", "продавать"] 
            },
            risks: { 
                type: "array", 
                items: { type: "string" } 
            },
            opportunities: { 
                type: "array", 
                items: { type: "string" } 
            }
        }
    },
    
    validateInput: (input) => {
        return input.revenue && input.profit && input.period;
    }
});

// Использование
const analysis = await financialAnalyzer.execute({
    text: "Выручка компании выросла на 15% до 100 млн руб, чистая прибыль составила 20 млн руб",
    period: "2023"
});
```

---

## 🔧 Валидация и обработка ошибок

### Автоматическая валидация JSON

```javascript
// Если JSON не найден в ответе
{
  "error": "JSON не найден в ответе",
  "raw_response": "Текст ответа без JSON",
  "suggestion": "Попробуйте улучшить системный промпт для получения структурированного ответа"
}

// Если JSON невалидный
{
  "error": "Ошибка парсинга JSON",
  "details": "Unexpected token } in JSON at position 123",
  "raw_response": "Невалидный JSON текст"
}
```

### Валидация схемы

```javascript
// Если обязательные поля отсутствуют
{
  "sentiment": "позитивный",
  "themes": ["отзывы"],
  // отсутствуют: keywords, summary
  "_validation_errors": [
    "Отсутствует обязательное поле: keywords",
    "Отсутствует обязательное поле: summary"
  ]
}
```

---

## 🚀 Продвинутые возможности

### 1. Динамические схемы

```javascript
const dynamicAPI = builder.createJSONMethod('dynamicAnalyzer', {
    description: 'API с динамической схемой',
    systemPrompt: 'Анализируй данные по запросу',
    
    jsonSchema: null, // Будет определена динамически
    
    execute: async function(input, options = {}) {
        // Динамическое определение схемы
        const dynamicSchema = options.schema || this.getDefaultSchema();
        this.jsonSchema = dynamicSchema;
        
        return await this.originalExecute(input, options);
    }
});
```

### 2. Пост-обработка результатов

```javascript
const processedAPI = builder.createJSONMethod('processedAnalyzer', {
    description: 'API с пост-обработкой',
    systemPrompt: 'Анализ текста',
    jsonSchema: { /* схема */ },
    
    postProcess: (result) => {
        // Добавляем вычисляемые поля
        if (result.sentiment === 'позитивный') {
            result.is_positive = true;
            result.action_needed = false;
        } else if (result.sentiment === 'негативный') {
            result.is_positive = false;
            result.action_needed = true;
            result.priority = 'high';
        }
        
        return result;
    }
});
```

### 3. Batch обработка

```javascript
// Обработка массива данных
const batchResults = [];
const texts = [
    "Отличный продукт!",
    "Ужасное качество",
    "Нормально, можно купить"
];

for (const text of texts) {
    const result = await analyzer.execute(text);
    batchResults.push(result);
}

console.log('Batch результаты:', batchResults);
```

---

## 📦 Экспорт JSON API

```javascript
// Экспорт нескольких JSON методов
builder.exportAPI([
    builder.createFromTemplate('textAnalyzer'),
    builder.createFromTemplate('classifier'),
    builder.createJSONMethod('customMethod', { /* конфиг */ })
], 'my-json-api.js');
```

---

## 🎯 Практические примеры использования

### 1. Анализ отзывов

```javascript
const reviewAnalyzer = builder.createJSONMethod('reviewAnalyzer', {
    description: 'Анализ отзыва о продукте',
    systemPrompt: 'Проанализируй отзыв о продукте и верни детальный анализ',
    
    jsonSchema: {
        type: "object",
        required: ["overall_rating", "pros", "cons", "recommendation"],
        properties: {
            overall_rating: { type: "number", minimum: 1, maximum: 5 },
            pros: { type: "array", items: { type: "string" } },
            cons: { type: "array", items: { type: "string" } },
            recommendation: { type: "string", enum: ["да", "нет", "возможно"] },
            sentiment: { type: "string", enum: ["позитивный", "негативный", "нейтральный"] },
            key_aspects: {
                type: "object",
                properties: {
                    quality: { type: "number", minimum: 1, maximum: 5 },
                    price: { type: "number", minimum: 1, maximum: 5 },
                    service: { type: "number", minimum: 1, maximum: 5 }
                }
            }
        }
    }
});

const review = await reviewAnalyzer.execute(
    "Качество отличное, цена высокая, но обслуживание могло быть лучше. В целом рекомендую."
);
```

### 2. SEO анализ контента

```javascript
const seoAnalyzer = builder.createJSONMethod('seoAnalyzer', {
    description: 'SEO анализ текста',
    systemPrompt: 'Проанализируй текст с точки зрения SEO и верни рекомендации',
    
    jsonSchema: {
        type: "object",
        required: ["seo_score", "keywords", "recommendations"],
        properties: {
            seo_score: { type: "number", minimum: 0, maximum: 100 },
            keywords: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        keyword: { type: "string" },
                        density: { type: "number" },
                        position: { type: "string" }
                    }
                }
            },
            recommendations: { type: "array", items: { type: "string" } },
            readability_score: { type: "number", minimum: 0, maximum: 100 },
            word_count: { type: "number" },
            title_suggestions: { type: "array", items: { type: "string" } }
        }
    }
});
```

---

## 🛠️ Отладка и тестирование

### Тестирование JSON API

```javascript
// Тестовый запуск
async function testJSONAPI() {
    const builder = new CustomAPIBuilder();
    await builder.init();
    
    const analyzer = builder.createFromTemplate('textAnalyzer');
    
    // Тестовые данные
    const testCases = [
        { input: "Отличный продукт!", expected: { sentiment: "позитивный" } },
        { input: "Ужасно, не покупайте!", expected: { sentiment: "негативный" } },
        { input: "Нормально", expected: { sentiment: "нейтральный" } }
    ];
    
    for (const testCase of testCases) {
        const result = await analyzer.execute(testCase.input);
        console.log(`Input: ${testCase.input}`);
        console.log(`Result: ${JSON.stringify(result, null, 2)}`);
        console.log(`Expected sentiment: ${testCase.expected.sentiment}`);
        console.log(`✅ Test ${result.sentiment === testCase.expected.sentiment ? 'PASSED' : 'FAILED'}\n`);
    }
}
```

---

## 📝 Заключение

Custom API Builder с поддержкой JSON схем предоставляет мощный инструмент для создания структурированных API на основе K2Think.ai. Основные преимущества:

- ✅ **Структурированные ответы** - всегда валидный JSON
- ✅ **Валидация схем** - проверка обязательных полей
- ✅ **Готовые шаблоны** - быстрый старт для常见 задач
- ✅ **Кастомизация** - создание любых JSON API
- ✅ **Обработка ошибок** - информативные сообщения об ошибках
- ✅ **Экспорт** - сохранение созданных API

Используйте JSON схемы для создания надежных и предсказуемых API для ваших проектов! на основе мощной модели K2Think.ai!
