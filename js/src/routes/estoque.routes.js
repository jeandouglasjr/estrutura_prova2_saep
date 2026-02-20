const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// ROTA SOLICITADA: Listar todos os produtos na raiz "/"
router.get("/", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM produto ORDER BY nome ASC");
    
    const produtos = result.rows.map((row) => ({
      nome: row.nome,
      valor: Number(row.valor_unitario),
      quantidade: row.quantidade_estoque,
      "valor total": Number(row.valor_unitario) * Number(row.quantidade_estoque)
    }));

    return res.json(produtos);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao listar produtos.", erro: error.message });
  }
});

// --- AJUSTES NAS OUTRAS ROTAS PARA POSTGRES ---

router.post("/add_produto", async (req, res) => {
  const { nome, valor, entrada, quantidade, minimo, maximo } = req.body;

  if (!nome || valor === undefined || !entrada || quantidade === undefined || minimo === undefined || maximo === undefined) {
    return res.status(422).json({ mensagem: "Preencha todos os campos!" });
  }

  try {
    // No Postgres usamos $1 e .query()
    const checkExist = await pool.query("SELECT id_produto FROM produto WHERE nome = $1", [nome]);

    if (checkExist.rowCount > 0) {
      return res.status(422).json({ mensagem: "Produto ja cadastrado!" });
    }

    await pool.query(
      `INSERT INTO produto 
      (nome, quantidade_estoque, valor_unitario, data_cadastro, minimo_estoque, maximo_estoque) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [nome, Number(quantidade), Number(valor), entrada, Number(minimo), Number(maximo)]
    );

    return res.status(201).json({ mensagem: "Produto cadastrado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao cadastrar produto.", erro: error.message });
  }
});

router.post("/movimentar_produto", async (req, res) => {
  const { tipo, quantidade, id_produto } = req.body;

  if (!tipo || quantidade === undefined || id_produto === undefined) {
    return res.status(422).json({ mensagem: "Preencha todos os campos!" });
  }

  // No Postgres, transações são feitas pegando um cliente do pool
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      "SELECT quantidade_estoque FROM produto WHERE id_produto = $1 FOR UPDATE",
      [id_produto]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: "Produto nao encontrado!" });
    }

    await client.query(
      "INSERT INTO movimentacao (tipo, quantidade, id_produto, datetime_movimentacao) VALUES ($1, $2, $3, NOW())",
      [tipo, Number(quantidade), Number(id_produto)]
    );

    const novaQuantidade = Number(result.rows[0].quantidade_estoque) + Number(quantidade);

    await client.query(
      "UPDATE produto SET quantidade_estoque = $1 WHERE id_produto = $2",
      [novaQuantidade, id_produto]
    );

    await client.query('COMMIT');
    return res.json({ mensagem: "Entrada executada com sucesso!" });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ mensagem: "Erro ao movimentar produto.", erro: error.message });
  } finally {
    client.release(); // Libera o cliente de volta para o pool
  }
});

router.delete("/deletar_produto", async (req, res) => {
  const { id_produto } = req.body;
  try {
    const result = await pool.query("DELETE FROM produto WHERE id_produto = $1", [Number(id_produto)]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: "Nao foi possivel encontrar o produto!" });
    }

    return res.json({ mensagem: "Produto removido com sucesso!" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao deletar produto.", erro: error.message });
  }
});

module.exports = router;