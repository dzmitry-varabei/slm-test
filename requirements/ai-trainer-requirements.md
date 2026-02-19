# Технические требования к демонстрационному приложению «AI-Тренер»

**Версия:** 2.0
**Дата обновления:** 2026-02-19

---

## 1. Цель проекта

Создать интерактивное веб-приложение для демонстрации возможностей Малых языковых моделей (SLM) в задачах проверки текстовых ответов. Приложение демонстрирует:

- Разницу между облачным (Groq API) и локальным (Ollama) инференсом SLM
- Механизм двойной оценки: SLM + LLM (Claude) как арбитр
- Feedback loop: коррекция преподавателем → few-shot обучение SLM
- Debug-режим для прозрачности работы модели

---

## 2. Основные действующие лица (Роли)

| Роль | Описание |
|------|----------|
| **Студент** | Читает вопросы и пишет ответы своими словами. Видит только вердикт SLM |
| **Преподаватель** | Использует Debug Mode. Видит оценки обеих моделей, эталонный ответ, может корректировать вердикт |
| **Ассистент-стажёр (SLM)** | Малая модель (LLaMA 3.1 8B через Groq или Ollama). Первичная оценка ответа |
| **Главный экзаменатор (Claude)** | Большая модель через Claude CLI. Даёт развёрнутую оценку с объяснением |
| **Система (Backend)** | Express-сервер. Оркестрирует оценку, хранит данные, управляет feedback loop |

---

## 3. База знаний и контент

- **80 пар «Вопрос — Эталонный ответ»** из транскриптов подкастов об ИИ
- **Источники:** Dario Amodei / Dwarkesh, Lex Fridman AI SOTA 2026, Lex Fridman / Peter Steinberger
- **Несколько допустимых ответов** на вопрос — основной эталон + альтернативные варианты (таблица `flashcard_answers`)
- При оценке SLM и Claude получают все допустимые ответы

---

## 4. Два режима работы

### 4.1. Student Mode (по умолчанию)

1. Система показывает случайный вопрос
2. Студент вводит ответ
3. SLM оценивает ответ: **correct / partially_correct / incorrect** + комментарий
4. Студент видит вердикт, комментарий и время ответа модели
5. Лог сохраняется в БД

### 4.2. Debug Mode (переключатель в хедере)

Всё что в Student Mode, плюс:

1. **Параллельная оценка Claude** — verdict + comment + explanation (подробное объяснение)
2. **Полный промпт SLM** — весь system prompt + user prompt, включая few-shot примеры
3. **Raw ответ SLM** — неформатированный JSON-ответ модели
4. **Счётчик токенов** — prompt_tokens / completion_tokens
5. **Эталонный ответ** — все допустимые варианты
6. **Teacher Override** — кнопки для коррекции вердикта

---

## 5. Feedback Loop (Обратная связь)

### Принцип работы

1. Преподаватель видит оценку SLM и Claude в Debug Mode
2. Если SLM ошиблась — нажимает кнопку с правильным вердиктом (Teacher Override)
3. Система автоматически создаёт **few-shot пример** в таблице `prompt_examples`
4. Все последующие оценки SLM включают этот пример в system prompt
5. SLM «учится» на ошибках без переобучения — только через промпт

### Ограничения

- Лимит: **10 последних активных примеров** (чтобы не перегружать контекст SLM)
- Few-shot — подсказка, не гарантия: SLM может проигнорировать пример
- Примеры можно деактивировать (поле `active`)

---

## 6. Технические требования

### 6.1. SLM-слой

| Провайдер | Тип | Модель по умолчанию | Переключение |
|-----------|-----|---------------------|-------------|
| **Groq** | Облако | llama-3.1-8b-instant | через UI |
| **Ollama** | Локально | llama3.1 | через UI |

- OpenAI-совместимый API (`/chat/completions`)
- Temperature: 0.3, max_tokens: 256
- System prompt с few-shot примерами + user prompt
- Формат ответа: JSON `{"verdict": "...", "comment": "..."}`

### 6.2. LLM-слой (Claude)

- Вызов через **Claude CLI** (`claude -p ... --output-format text --max-turns 1`)
- Запуск как child_process (spawn) с stdin для передачи промпта
- Таймаут: 30 секунд
- Расширенный формат: verdict + comment + **explanation**
- Запускается только в Debug Mode, параллельно с SLM

### 6.3. База данных

- **SQLite** через sql.js (WASM)
- Файл: `ai-trainer.db` в корне проекта
- 6 таблиц: flashcards, flashcard_answers, sessions, interactions, prompt_examples, provider_config

### 6.4. Стек

| Компонент | Технология |
|-----------|-----------|
| Frontend | React 19, Vite, TypeScript |
| Backend | Express 4, TypeScript, tsx (dev) |
| DB | SQLite (sql.js) |
| SLM | Groq API / Ollama (OpenAI-compatible) |
| LLM | Claude CLI (без API-ключа) |
| Monorepo | npm workspaces |

---

## 7. API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/flashcards` | Все карточки (без ответа) |
| GET | `/api/flashcards/random` | Случайная карточка |
| GET | `/api/flashcards/:id` | Карточка с ответом |
| POST | `/api/sessions` | Создать сессию |
| GET | `/api/sessions` | Все сессии |
| GET | `/api/sessions/:id` | Сессия с interactions |
| POST | `/api/quiz/evaluate` | Оценить ответ (body: session_id, flashcard_id, user_answer, debug) |
| POST | `/api/quiz/:id/override` | Teacher override (body: verdict) |
| GET | `/api/settings/provider` | Текущий провайдер |
| PUT | `/api/settings/provider` | Сменить провайдер |
| POST | `/api/settings/test` | Тест соединения |
| GET | `/api/logs/export` | Экспорт логов (JSON/CSV) |

---

## 8. Запуск

```bash
# Установка зависимостей
npm install

# Инициализация БД
npm run seed -w server

# Запуск (сервер + клиент)
npm run dev

# Клиент: http://localhost:5173
# Сервер: http://localhost:3001
```

### Переменные окружения (.env)

```
GROQ_API_KEY=gsk_...
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.1-8b-instant
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.1
PORT=3001
```
