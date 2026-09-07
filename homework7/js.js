const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const FILE = './data/data.json';

function readData() {
    try {
        return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    } catch {
        return { exercises: [], favorites: [], importCount: 0 };
    }
}

function writeData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ==========================================
// Завдання 1. Випадкова вправа
// ==========================================
app.get('/api/exercises/random', (req, res) => {
    const data = readData();
    const list = data.exercises || [];

    if (list.length === 0) {
        return res.status(404).json({ error: 'Вправ не знайдено' });
    }

    const randomExercise = list[Math.floor(Math.random() * list.length)];
    res.status(200).json(randomExercise);
});

// ==========================================
// Завдання 2. Перевірка назви та створення вправи
// ==========================================
app.post('/api/exercises', (req, res) => {
    const { name, muscle, level } = req.body || {};

    if (!name || name.trim().length < 3) {
        return res.status(400).json({
            error: 'Назва вправи повинна містити щонайменше 3 символи'
        });
    }

    const data = readData();
    const newExercise = {
        id: name.trim().replace(/\s+/g, '_'),
        name: name.trim(),
        muscle: muscle || 'general',
        level: level || 'beginner'
    };

    data.exercises.push(newExercise);
    writeData(data);

    res.status(201).json(newExercise);
});

// ==========================================
// Завдання 3. Лічильник імпорту
// ==========================================
app.post('/api/exercises/import', (req, res) => {
    const data = readData();

    data.importCount = (data.importCount || 0) + 1;
    writeData(data);

    res.status(200).json({ importCount: data.importCount });
});

// ==========================================
// Завдання 4. Статистика імпорту
// ==========================================
app.get('/api/exercises/stats', (req, res) => {
    const data = readData();

    res.status(200).json({
        total: (data.exercises || []).length,
        favorites: (data.favorites || []).length,
        importCount: data.importCount || 0,
        byMuscle: {},
        byLevel: {}
    });
});

// ==========================================
// Додаткове завдання. Загальна кількість вправ
// ==========================================
app.get('/api/exercises/count', (req, res) => {
    const data = readData();
    res.status(200).json({
        count: (data.exercises || []).length
    });
});

app.listen(3000, () => {
    console.log('Сервер запущено: http://localhost:3000');
});
