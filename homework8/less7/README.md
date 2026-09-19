# Каталог Фільмів (Movie Catalog REST API)

Повнофункціональний REST API веб-додаток на **Node.js / Express** із використанням локального JSON-сховища та Vanilla JavaScript веб-інтерфейсу. Додаток підтримує повний цикл CRUD-операцій, безпечне одночасне читання/запис файлу, валідацію даних, статистику, персоналізовані рекомендації та інтеграцію із зовнішнім TVMaze API.

---

## 📁 Структура папок проєкту

```
less7/
├── data/
│   └── data.json              # Локальне JSON-сховище (автоматично створюється при відсутності)
├── repositories/
│   └── jsonRepository.js      # Шар доступу до файлу JSON із захистом потокобезпечності (Queue Mutex)
├── services/
│   └── service.js             # Шар бізнес-логіки, обчислення статистики, рекомендацій та роботи з API
├── utils/
│   └── validation.js          # Модуль перевірки та валідації даних головної сутності
├── routes/
│   └── routes.js              # Маршрутизація Express (обробка HTTP-запитів)
├── public/
│   ├── index.html             # Веб-інтерфейс користувача
│   ├── style.css              # Стилі веб-інтерфейсу
│   └── script.js              # Клієнтські скрипти (взаємодія з REST API)
├── server.js                  # Точка входу в додаток (Express сервер, Error Handler, Static)
├── package.json               # Залежності та конфігурація Node.js проєкту
└── README.md                  # Документація проєкту
```

---

## 📄 Формат даних

### 1. Головна сутність (Movie Entity)
Кожен об'єкт сутності у `data/data.json` має сувору структуру:

```json
{
  "id": "776497bf-64ad-4da5-b31e-8aaee577a015",
  "name": "Under the Dome",
  "genres": ["Drama", "Science-Fiction", "Thriller"],
  "rating": 6.6,
  "year": 2013,
  "status": "watched"
}
```

* **`id`** (`string`, UUID v4): Унікальний ідентифікатор (генерується через `crypto.randomUUID()`).
* **`name`** (`string`): Назва фільму/серіалу (не порожній рядок).
* **`genres`** (`array` з `string`): Масив жанрів (не порожній).
* **`rating`** (`number`): Оцінка від `0` до `10`.
* **`year`** (`number`): Рік випуску від `1888` до `2100`.
* **`status`** (`string`): Статус перегляду (`'plan'` або `'watched'`).

### 2. Формат відповіді сервера (Standard Response Envelope)

#### Успішна відповідь:
```json
{
  "success": true,
  "data": { ... } // або [ ... ]
}
```

#### Помилка:
```json
{
  "success": false,
  "error": "Опис помилки для користувача"
}
```

---

## 🌐 Маршрути API (Endpoints) та коди статусів

Всі маршрути API доступні за префіксом `/api/movies` або `/api/items`.

| Метод | Маршрут | Опис | Код успіху | Коди помилок |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/items` | Отримання всіх об'єктів (з фільтрацією `search`, `genre`, `status`) | `200 OK` | `500` |
| **GET** | `/api/items/stats` | Статистика (кількість, переглянуті, середній рейтинг) | `200 OK` | `500` |
| **GET** | `/api/items/recommendations` | Рекомендації непереглянутих фільмів улюбленого жанру користувача | `200 OK` | `500` |
| **GET** | `/api/items/external` | Пошук/завантаження популярного з зовнішнього TVMaze API | `200 OK` | `502`, `504` |
| **GET** | `/api/items/:id` | Отримання одного об'єкта за `id` | `200 OK` | `400`, `404`, `500` |
| **POST** | `/api/items` | Створення нового об'єкта (з повною валідацією) | `201 Created` | `400`, `500` |
| **PUT** | `/api/items/:id` | Повна заміна об'єкта (вимагає всі обов'язкові поля, `id` незмінний) | `200 OK` | `400`, `404`, `500` |
| **PATCH** | `/api/items/:id` | Часткове оновлення об'єкта (збереження непереданих полів) | `200 OK` | `400`, `404`, `500` |
| **DELETE** | `/api/items/:id` | Видалення об'єкта за `id` | `204 No Content` | `400`, `404`, `500` |

---

## 💻 Приклади запитів

### 1. Отримання всіх об’єктів
```bash
curl -X GET http://localhost:3000/api/items
```

### 2. Отримання рекомендацій улюбленого жанру
```bash
curl -X GET http://localhost:3000/api/items/recommendations
```

### 3. Створення нового фільму (POST)
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Interstellar",
    "genres": ["Adventure", "Drama", "Sci-Fi"],
    "rating": 8.7,
    "year": 2014,
    "status": "watched"
  }'
```

### 4. Часткове оновлення (PATCH)
```bash
curl -X PATCH http://localhost:3000/api/items/776497bf-64ad-4da5-b31e-8aaee577a015 \
  -H "Content-Type: application/json" \
  -d '{ "rating": 9.5 }'
```

### 5. Повна заміна (PUT)
```bash
curl -X PUT http://localhost:3000/api/items/776497bf-64ad-4da5-b31e-8aaee577a015 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Under the Dome (Updated)",
    "genres": ["Drama", "Sci-Fi"],
    "rating": 7.0,
    "year": 2013,
    "status": "plan"
  }'
```

### 6. Видалення (DELETE)
```bash
curl -X DELETE http://localhost:3000/api/items/776497bf-64ad-4da5-b31e-8aaee577a015
```

---

## 🚀 Спосіб запуску

1. Перевірте наявність **Node.js** (версія 18 або вище).
2. Встановіть залежності проєкту:
   ```bash
   npm install
   ```
3. Запустіть сервер:
   ```bash
   npm start
   ```
4. Відкрийте веб-інтерфейс у браузері:
   ```
   http://localhost:3000
   ```

---

## ✅ Перевірка системних вимог (Verification Checklist)

* [x] **Автостворення файлу**: Якщо `data/data.json` відсутній, repository створює папку `data/` та файл `data.json` із вмістом `{"movies":[],"favourites":[]}`.
* [x] **Захист від пошкодженого JSON**: Якщо файл існує, але містить пошкоджений JSON, сервер повертає статус `500` і **НЕ перезаписує** файл.
* [x] **Потокобезпечність (Promise Mutex Queue)**: Всі операції читання/запису виконуються послідовно через чергу `runInQueue`, що запобігає втраті даних при паралельних запитах.
* [x] **Валідація**: Модуль `utils/validation.js` перевіряє обов'язкові поля, типи даних, обмеження рейтингу (0–10), року (1888–2100) та статусів (`plan`/`watched`).
* [x] **Рекомендації**: Маршрут `/api/items/recommendations` визначає найпопулярніший жанр серед переглянутих фільмів (`status: 'watched'`) і повертає непереглянуті фільми (`status: 'plan'`) цього жанру.
* [x] **Статистика**: Маршрут `/api/items/stats` оголошено **перед** `/:id`, обчислення виконуються у service-шарі.
* [x] **Зовнішнє API (TVMaze)**: Окрема функція `fetchFromExternalApi` перевіряє статус, `Content-Type: application/json`, структуру даних та має таймаут (5 сек). Помилки повертають статус `502`/`504` без падіння сервера.
* [x] **Невідомі маршрути**: Неіснуючі URL повертають статус `404` із повідомленням `{"success": false, "error": "Route не знайдено"}`.
