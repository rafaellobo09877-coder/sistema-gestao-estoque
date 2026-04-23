import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// ⚠️ temporário (depois vai pro banco)
const users = [];

// registro
router.post("/register", async (req, res) => {
  const { email, senha } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  users.push({ email, senha: hash });

  res.json({ msg: "Usuário criado" });
});

// login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });

  const ok = await bcrypt.compare(senha, user.senha);

  if (!ok) return res.status(401).json({ erro: "Senha inválida" });

  const token = jwt.sign({ email }, "SEGREDO", {
    expiresIn: "1d"
  });

  res.json({ token });
});

export default router;