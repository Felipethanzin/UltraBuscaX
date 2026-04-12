const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const routes = require("./api/routes");

const app = express();

// 🔥 Middlewares
app.use(cors());
app.use(express.json()); // substitui body-parser

// 🔥 Rota raiz
app.get("/", (req, res) => {
  res.send("API Rede Social funcionando 🚀");
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
  apis: [path.join(__dirname, "api", "*.js")], // 🔥 corrigido
};

const swaggerSpec = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🔥 Rotas
app.use("/api", routes);

// 🔥 Start servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
