const express = require('express');
const path = require('path');
const routes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use('/api', routes);

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route не знайдено' });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: 'Некоректний JSON у тілі запиту',
    });
    return;
  }

  console.error(error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Внутрішня помилка сервера при читанні файлу',
  });
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`🚀 Сервер успішно запущено: http://localhost:${port}`);
    console.log(`========================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Порт ${port} зайнятий іншою програмою.`);
      console.warn(`🔄 Пробуємо запустити на наступному порту: ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Помилка сервера:', err);
    }
  });
}

startServer(Number(PORT));
