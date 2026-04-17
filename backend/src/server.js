import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});