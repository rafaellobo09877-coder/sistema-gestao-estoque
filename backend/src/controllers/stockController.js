import fs from 'fs';
import { prisma } from '../lib.js';
import { getDashboard, importMonthlyStock, listCurrentStock } from '../services/stockService.js';

export async function importStock(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Envie um arquivo Excel.' });
    const result = await importMonthlyStock(req.file.path, req.file.originalname);
    fs.unlinkSync(req.file.path);
    return res.json(result);
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: error.message });
  }
}

export async function dashboard(req, res) {
  const now = new Date();
  const month = Number(req.query.month || now.getMonth() + 1);
  const year = Number(req.query.year || now.getFullYear());
  const data = await getDashboard(month, year);
  return res.json(data);
}

export async function currentStock(req, res) {
  const now = new Date();
  const month = Number(req.query.month || now.getMonth() + 1);
  const year = Number(req.query.year || now.getFullYear());
  const data = await listCurrentStock(month, year);
  return res.json(data);
}

export async function listProducts(req, res) {
  const products = await prisma.product.findMany({ orderBy: { materialName: 'asc' } });
  return res.json(products);
}
