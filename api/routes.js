const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const users = require("./users");

// 🔐 segredo (use variável no Render depois)
const SECRET = process.env.JWT_SECRET || "segredo_super";

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
 * 🔥 REGISTRO
 */
router.post("/register", async (req, res) => {
  try {
    let { nome, email, password } = req.body;

    // 🔥 limpeza básica
    nome = nome?.trim();
    email = email?.trim().toLowerCase();

    if (!nome || !email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Senha deve ter no mínimo 6 caracteres" });
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

    console.log("USUÁRIOS:", users);

    return res.status(201).json({
      message: "Usuário criado com sucesso"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Erro interno no servidor"
    });
  }
});

/**
 * 🔥 LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

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

    const token = jwt.sign(
      { id: user.id },
      SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Erro interno no servidor"
    });
  }
});

/**
 * 🔥 PERFIL (PROTEGIDO)
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
 * 🔥 LISTAR USUÁRIOS
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
