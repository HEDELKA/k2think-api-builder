# Universal Dialog Mode

Универсальный диалоговый режим, поддерживающий различные AI API и форматы сообщений.

## Возможности

- **Мульти-провайдер**: K2Think.ai, OpenAI, Anthropic, кастомные API
- **Универсальный формат**: Стандартизированная структура запросов/ответов
- **Потоковая обработка**: Поддержка stream для реального времени
- **История диалога**: Автоматическое сохранение контекста
- **Гибкая конфигурация**: JSON config или переменные окружения

## Использование

### 1. Базовый запуск

```bash
npm run universal
```

### 2. Конфигурация

Создайте `config.json`:

```json
{
  "provider": "k2think",
  "model": "MBZUAI-IFM/K2-Think",
  "systemPrompt": "Ты - полезный AI ассистент",
  "temperature": 0.7,
  "maxTokens": 1024,
  "stream": true
}
```

### 3. Разные провайдеры

#### K2Think.ai
```json
{
  "provider": "k2think",
  "cookies": "ваши_cookies",
  "model": "MBZUAI-IFM/K2-Think"
}
```

#### OpenAI
```json
{
  "provider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4",
  "baseUrl": "https://api.openai.com/v1"
}
```

#### Anthropic
```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "model": "claude-3-sonnet-20240229"
}
```

#### Кастомный API
```json
{
  "provider": "custom",
  "baseUrl": "https://your-api.com",
  "endpoint": "/v1/chat/completions",
  "apiKey": "your-key",
  "customHeaders": {
    "X-Custom-Header": "value"
  }
}
```

## Универсальный формат

Библиотека конвертирует все запросы в универсальный формат:

```javascript
{
  "model": "gpt-4.1",
  "input": [
    {
      "role": "system",
      "content": [
        {
          "type": "input_text",
          "text": "системный промпт"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "сообщение пользователя"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "ответ ассистента"
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

## Программное использование

```javascript
const UniversalDialog = require('./src/universal-dialog');

const config = {
  provider: 'k2think',
  model: 'MBZUAI-IFM/K2-Think',
  systemPrompt: 'Ты - эксперт по программированию'
};

const dialog = new UniversalDialog(config);

// Отправить сообщение
const response = await dialog.sendMessage('Как работает async/await?');
console.log(response.content);

// Получить историю
const history = dialog.getHistory();

// Сохранить историю
dialog.saveHistory('my-conversation.json');
```

## Переменные окружения

- `K2THINK_COOKIES` - cookies для K2Think.ai
- `API_KEY` - API ключ для OpenAI/Anthropic/других

## Сравнение с оригинальным режимом

| Характеристика | Оригинальный диалог | Универсальный диалог |
|---------------|-------------------|-------------------|
| Провайдеры | Только K2Think.ai | Мульти-провайдер |
| Формат | K2Think специфичный | Универсальный |
| Конфигурация | Hardcoded | Гибкая JSON |
| История | Базовая | Расширенная |
| Расширяемость | Ограничена | Полная |

## Преимущества универсального подхода

1. **Единый интерфейс** для разных AI API
2. **Стандартизированный формат** запросов/ответов
3. **Легкое переключение** между провайдерами
4. **Расширяемость** для новых API
5. **Сохранение контекста** в универсальном формате
6. **Гибкая настройка** параметров модели

Запустите `npm run universal` чтобы начать работу!
