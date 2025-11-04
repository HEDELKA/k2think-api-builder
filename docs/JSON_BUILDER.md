# K2Think JSON Builder

Построение кастомных JSON запросов для K2Think.ai API с полным контролем над структурой.

## Возможности

- **Полный контроль** над JSON структурой запроса
- **Гибкое построение** диалогов и сообщений
- **Поддержка всех параметров** K2Think API
- **Сохранение/загрузка** JSON запросов
- **Потоковая обработка** ответов

## Использование

### 1. Базовый запуск

```bash
npm run json
```

### 2. Программное использование

```javascript
const K2ThinkJsonBuilder = require('./src/k2think-json-builder');

const builder = new K2ThinkJsonBuilder(cookies);

// Создать базовый запрос
let request = builder.createBaseRequest();

// Добавить сообщения
request = builder.addSystemMessage(request, 'Ты - эксперт');
request = builder.addUserMessage(request, 'Вопрос пользователя');

// Отправить запрос
const response = await builder.sendRequest(request);
```

## Структура JSON запроса

### Базовая структура

```javascript
{
  "model": "MBZUAI-IFM/K2-Think",
  "input": [
    {
      "role": "system",
      "content": [
        {
          "type": "input_text",
          "text": "Системный промпт"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Сообщение пользователя"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Ответ ассистента"
        }
      ]
    }
  ],
  "text": {
    "format": {
      "type": "text"
    }
  },
  "reasoning": {},
  "tools": [],
  "temperature": 1,
  "max_output_tokens": 2048,
  "top_p": 1,
  "store": true,
  "include": ["web_search_call.action.sources"]
}
```

### Примеры JSON структур

#### 1. Простое сообщение

```javascript
{
  "model": "MBZUAI-IFM/K2-Think",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Привет! Как дела?"
        }
      ]
    }
  ],
  "text": {
    "format": {
      "type": "text"
    }
  },
  "reasoning": {},
  "tools": [],
  "temperature": 1,
  "max_output_tokens": 2048,
  "top_p": 1,
  "store": true,
  "include": []
}
```

#### 2. Диалог с контекстом

```javascript
{
  "model": "MBZUAI-IFM/K2-Think",
  "input": [
    {
      "role": "system",
      "content": [
        {
          "type": "input_text",
          "text": "Ты - эксперт по программированию на JavaScript"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Что такое замыкания в JavaScript?"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Замыкание - это функция вместе с лексическим окружением..."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Можешь привести практический пример?"
        }
      ]
    }
  ],
  "text": {
    "format": {
      "type": "text"
    }
  },
  "reasoning": {},
  "tools": [],
  "temperature": 0.7,
  "max_output_tokens": 1024,
  "top_p": 1,
  "store": true,
  "include": []
}
```

#### 3. Запрос с веб-поиском

```javascript
{
  "model": "MBZUAI-IFM/K2-Think",
  "input": [
    {
      "role": "system",
      "content": [
        {
          "type": "input_text",
          "text": "Ты - AI ассистент с доступом к веб-поиску"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Найди последние новости об искусственном интеллекте"
        }
      ]
    }
  ],
  "text": {
    "format": {
      "type": "text"
    }
  },
  "reasoning": {},
  "tools": [],
  "temperature": 0.5,
  "max_output_tokens": 2048,
  "top_p": 1,
  "store": true,
  "include": [
    "web_search_call.action.sources"
  ]
}
```

#### 4. Креативный запрос

```javascript
{
  "model": "MBZUAI-IFM/K2-Think",
  "input": [
    {
      "role": "system",
      "content": [
        {
          "type": "input_text",
          "text": "Ты - креативный писатель. Пиши в стиле научной фантастики."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Напиши короткий рассказ о первом контакте с инопланетной цивилизацией"
        }
      ]
    }
  ],
  "text": {
    "format": {
      "type": "text"
    }
  },
  "reasoning": {},
  "tools": [],
  "temperature": 1.2,
  "max_output_tokens": 1500,
  "top_p": 0.9,
  "store": true,
  "include": []
}
```

#### 5. Аналитический запрос

```javascript
{
  "model": "MBZUAI-IFM/K2-Think",
  "input": [
    {
      "role": "system",
      "content": [
        {
          "type": "input_text",
          "text": "Ты - бизнес-аналитик. Проводи детальный анализ и давай конкретные рекомендации."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Проанализируй рынок мобильных приложений в 2024 году и выдели ключевые тренды"
        }
      ]
    }
  ],
  "text": {
    "format": {
      "type": "text"
    }
  },
  "reasoning": {},
  "tools": [],
  "temperature": 0.3,
  "max_output_tokens": 2500,
  "top_p": 0.8,
  "store": true,
  "include": []
}
```

## API методы

### Создание запросов

```javascript
// Базовый запрос
const request = builder.createBaseRequest(model);

// Добавление сообщений
builder.addSystemMessage(request, content);
builder.addUserMessage(request, content);
builder.addAssistantMessage(request, content);

// Из истории
const request = builder.createDialogFromHistory(history);
```

### Параметры модели

```javascript
builder.setModelParams(request, {
    temperature: 0.7,        // 0-2, креативность
    max_tokens: 1024,        // макс длина ответа
    top_p: 0.9,             // 0-1, разнообразие
    store: true             // сохранение в истории
});
```

### Инструменты и функции

```javascript
// Добавить инструменты
builder.addTools(request, tools);

// Установить include
builder.setInclude(request, [
    'web_search_call.action.sources',
    'reasoning_chain'
]);
```

### Работа с файлами

```javascript
// Сохранить запрос
builder.saveRequest(request, 'my-request.json');

// Загрузить запрос
const request = builder.loadRequest('my-request.json');
```

## Параметры запроса

| Параметр | Тип | Описание | Пример |
|----------|-----|----------|--------|
| `model` | string | Модель K2Think | `"MBZUAI-IFM/K2-Think"` |
| `input` | array | Массив сообщений | `[{"role": "user", "content": [...]}]` |
| `temperature` | number | Креативность (0-2) | `0.7` |
| `max_output_tokens` | number | Макс длина ответа | `2048` |
| `top_p` | number | Разнообразие (0-1) | `0.9` |
| `store` | boolean | Сохранять в историю | `true` |
| `include` | array | Доп. функции | `["web_search_call.action.sources"]` |
| `tools` | array | Инструменты | `[]` |
| `reasoning` | object | Параметры мышления | `{}` |

## Типы контента

### input_text
```javascript
{
  "type": "input_text",
  "text": "Текст сообщения"
}
```

### output_text
```javascript
{
  "type": "output_text", 
  "text": "Ответ ассистента"
}
```

## Роли

- `system` - системный промпт
- `user` - сообщение пользователя  
- `assistant` - ответ ассистента

## Преимущества

1. **Полный контроль** над JSON структурой
2. **Гибкость** в построении запросов
3. **Поддержка всех функций** K2Think API
4. **Переиспользование** JSON запросов
5. **Отладка** через сохранение запросов

Используйте `npm run json` для начала работы с JSON Builder!
