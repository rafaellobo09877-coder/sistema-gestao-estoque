import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// 🔥 resolve erro CORS
app.use(cors());

// 🔥 permite JSON
app.use(express.json());

// 🔥 usa suas rotas do sistema
app.use(routes);

// rota teste
app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, '0.0.0.0', () => {
    console.log('Servidor rodando na porta ' + PORT);
});