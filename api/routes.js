const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const users = require("./users");

const SECRET = "segredo_super";

/**
 * 🔐 Middleware de autenticação
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token.trim(), SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Cadastro de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 */
router.post("/register", async (req, res) => {
  const { nome, email, password } = req.body || {};

  if (!nome || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ message: "Email já cadastrado" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = {
    id: users.length + 1,
    nome,
    email,
    password: hash,
  };

  users.push(user);

  console.log("USUÁRIOS:", users); // debug

  res.json({ message: "Usuário criado com sucesso" });
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "Usuário não encontrado" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ message: "Senha inválida" });
  }

  const token = jwt.sign({ id: user.id }, SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Perfil do usuário
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get("/profile", authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  res.json({
    id: user.id,
    nome: user.nome,
    email: user.email
  });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get("/users", (req, res) => {
  const lista = users.map(user => ({
    id: user.id,
    nome: user.nome,
    email: user.email
  }));

  res.json(lista);
});

module.exports = router;