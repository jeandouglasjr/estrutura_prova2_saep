require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const estoqueRoutes = require("./routes/estoque.routes");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

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
