import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);

const port = Number(process.env.PORT || 3333);
app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
