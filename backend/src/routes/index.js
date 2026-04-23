import { Router } from "express";
import authRoutes from "./auth.js";
import { authMiddleware } from "../middlewares/auth.js";

import { getProducts } from "../controllers/productsController.js";
import { getMovements } from "../controllers/movementController.js";
import { getDashboard } from "../controllers/dashboardController.js";
import { getStock } from "../controllers/stockController.js";

const router = Router();

// públicas
router.use("/auth", authRoutes);

// protegidas
router.get("/products", authMiddleware, getProducts);
router.get("/movements", authMiddleware, getMovements);
router.get("/dashboard", authMiddleware, getDashboard);
router.get("/stock/current", authMiddleware, getStock);

export default router;