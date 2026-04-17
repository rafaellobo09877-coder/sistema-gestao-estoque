import { Router } from 'express';
import multer from 'multer';

import { currentStock, dashboard, listProducts } from '../controllers/stockController.js';
import { createMovement, listMovements } from '../controllers/movementController.js';
import { importMonthly } from '../controllers/importController.js';

const router = Router();
const upload = multer();

// rotas
router.get('/health', (req, res) => res.json({ ok: true }));

router.get('/dashboard', dashboard);
router.get('/stock/current', currentStock);
router.get('/products', listProducts);

router.post('/imports/monthly', upload.single('file'), importMonthly);

router.get('/movements', listMovements);
router.post('/movements', createMovement);

export default router;