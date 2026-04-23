import { prisma } from '../lib.js';

export async function createMovement(req, res) {
  try {
    const { productId, type, quantity, note } = req.body;

    // validação simples
    if (!productId || !type || !quantity) {
      return res.status(400).json({
        error: 'Preencha os campos obrigatórios'
      });
    }

    // 🔥 DATA AUTOMÁTICA
    const now = new Date();

    const movement = await prisma.movement.create({
      data: {
        productId: Number(productId),
        type,
        quantity: Number(quantity),
        note: note || null,

        // 🔥 AUTOMÁTICO
        movementDate: now,
        referenceMonth: now.getMonth() + 1,
        referenceYear: now.getFullYear()
      },
    });

    return res.json(movement);

  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}