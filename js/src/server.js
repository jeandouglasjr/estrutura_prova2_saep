require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const estoqueRoutes = require("./routes/estoque.routes");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Apply a permissive Content Security Policy only in non-production environments
if (process.env.NODE_ENV !== 'production') {
  console.log('CSP middleware active (development): permissive CSP applied');

  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src * data:; style-src 'self' 'unsafe-inline'; font-src * data:;"
    );
    next();
  });
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", database: "connected" });
  } catch (error) {
    return res.status(500).json({ status: "error", database: error.message });
  }
});

app.use("/", estoqueRoutes);

app.listen(port, () => {
  console.log(`API Node rodando em http://localhost:${port}`);
});
