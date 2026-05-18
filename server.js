const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const routes = require("./api/routes");

const app = express();

// 🔥 Middlewares
app.use(cors({
  origin: "*" // libera acesso do seu site
}));

app.use(express.json());

// 🔥 Rota raiz (teste da API)
app.get("/", (req, res) => {
  res.send("API Rede Social funcionando 🚀");
});

// 🔥 Rota de status
app.get("/status", (req, res) => {
  res.json({
    status: "online",
    mensagem: "API rodando normalmente 🚀"
  });
});

// 🔥 Swagger config
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Rede Social",
      version: "1.0.0",
      description: "API de login e cadastro",
    },
    servers: [
      {
        url: "https://ultrabuscax-1.onrender.com",
      },
      {
        url: "http://localhost:3000",
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: [path.join(__dirname, "api", "*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =======================================================
   🔐 SISTEMA DE LIBERAÇÃO DE ACESSO
======================================================= */

let codigosLiberados = [];

// 🔓 Liberar acesso
app.post("/api/liberar-acesso", (req, res) => {

  const { email, codigo } = req.body;

  if (!email || !codigo) {

    return res.status(400).json({
      liberado: false,
      mensagem: "Email e código obrigatórios"
    });

  }

  codigosLiberados.push({
    email,
    codigo: codigo.toUpperCase()
  });

  console.log("✅ Código liberado:", codigo);

  res.json({
    liberado: true,
    mensagem: "Acesso liberado com sucesso!"
  });

});

// 🔎 Verificar código
app.get("/api/verificar-codigo/:codigo", (req, res) => {

  const codigo = req.params.codigo.toUpperCase();

  const encontrado = codigosLiberados.find(
    item => item.codigo === codigo
  );

  if (encontrado) {

    return res.json({
      liberado: true,
      email: encontrado.email
    });

  }

  res.json({
    liberado: false
  });

});

/* =======================================================
   🔥 ROTAS PRINCIPAIS
======================================================= */

app.use("/api", routes);

// 🔥 Rota 404
app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada"
  });
});

// 🔥 Start servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});