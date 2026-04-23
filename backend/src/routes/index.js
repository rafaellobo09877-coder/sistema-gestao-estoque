import { Router } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';

// 🔐 IMPORTA LOGIN
import authRoutes from './auth.js';

// seus controllers
import { currentStock, dashboard, listProducts } from '../controllers/stockController.js';
import { createMovement, listMovements } from '../controllers/movementController.js';
import { importMonthly } from '../controllers/importController.js';

const router = Router();
const upload = multer();


// =======================
// 🔐 MIDDLEWARE DE AUTH
// =======================
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ erro: "Sem token" });

  try {
    const decoded = jwt.verify(token, "SEGREDO");
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido" });
  }
}


// =======================
// 🔓 ROTAS PÚBLICAS
// =======================

// health check (não protege)
router.get('/health', (req, res) => res.json({ ok: true }));

// login / registro
router.use('/auth', authRoutes);


// =======================
// 🔐 ROTAS PROTEGIDAS
// =======================

router.get('/dashboard', auth, dashboard);
router.get('/stock/current', auth, currentStock);
router.get('/products', auth, listProducts);

router.post('/imports/monthly', auth, upload.single('file'), importMonthly);

router.get('/movements', auth, listMovements);
router.post('/movements', auth, createMovement);


export default router;