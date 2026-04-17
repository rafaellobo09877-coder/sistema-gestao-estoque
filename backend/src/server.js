import express from 'express';
import routes from './routes/index.js';

const app = express();

app.use(express.json());

// 🔥 GARANTE QUE FUNCIONA
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', routes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});