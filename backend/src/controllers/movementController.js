import { prisma } from '../lib.js';

export async function createMovement(req, res) {
  try {
    const { productId, referenceMonth, referenceYear, type, quantity, movementDate, note } = req.body;
    if (!productId || !referenceMonth || !referenceYear || !type || !quantity || !movementDate) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    const movement = await prisma.movement.create({
      data: {
        productId: Number(productId),
        referenceMonth: Number(referenceMonth),
        referenceYear: Number(referenceYear),
        type,
        quantity: Number(quantity),
        movementDate: new Date(movementDate),
        note: note || null,
      },
    });

    return res.json(movement);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function listMovements(req, res) {
  const where = {};
  if (req.query.month) where.referenceMonth = Number(req.query.month);
  if (req.query.year) where.referenceYear = Number(req.query.year);

  const movements = await prisma.movement.findMany({
    where,
    include: { product: true },
    orderBy: { movementDate: 'desc' },
  });

  return res.json(movements);
}
