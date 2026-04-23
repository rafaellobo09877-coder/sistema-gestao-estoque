import { prisma } from "../lib.js";

export const getDashboard = async (req, res) => {
  try {
    const { month, year } = req.query;

    const movements = await prisma.movement.findMany({
      where: {
        movementDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0)
        }
      }
    });

    res.json({
      totalSaidas: movements.length,
      movimentos: movements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};