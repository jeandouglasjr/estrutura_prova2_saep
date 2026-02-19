const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.post("/add_produto", async (req, res) => {
  const { nome, valor, entrada, quantidade, minimo, maximo } = req.body;

  if (
    !nome ||
    valor === undefined ||
    !entrada ||
    quantidade === undefined ||
    minimo === undefined ||
    maximo === undefined
  ) {
    return res.status(422).json({ mensagem: "Preencha todos os campos!" });
  }

  try {
    const [produtoExistente] = await pool.execute(
      "SELECT id_produto FROM produto WHERE nome = ?",
      [nome]
    );

    if (produtoExistente.length > 0) {
      return res.status(422).json({ mensagem: "Produto ja cadastrado!" });
    }

    await pool.execute(
      `INSERT INTO produto
      (nome, quantidade_estoque, valor_unitario, data_cadastro, minimo_estoque, maximo_estoque)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, Number(quantidade), Number(valor), entrada, Number(minimo), Number(maximo)]
    );

    return res.status(201).json({ mensagem: "Produto cadastrado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao cadastrar produto.", erro: error.message });
  }
});

router.get("/listar_produto/:nome", async (req, res) => {
  const { nome } = req.params;

  try {
    const [rows] = await pool.execute("SELECT * FROM produto WHERE nome = ?", [nome]);

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Nenhum produto encontrado!" });
    }

    const produto = rows[0];
    const valorTotal = Number(produto.valor_unitario) * Number(produto.quantidade_estoque);

    return res.json({
      produto: produto.nome,
      valor: Number(produto.valor_unitario),
      quantidade: produto.quantidade_estoque,
      "valor total": valorTotal
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao listar produto.", erro: error.message });
  }
});

router.get("/listar_produtos", async (_req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM produto");

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Nenhum produto encontrado!" });
    }

    const produtos = rows.map((row) => ({
      nome: row.nome,
      valor: Number(row.valor_unitario),
      quantidade: row.quantidade_estoque,
      "valor total": Number(row.valor_unitario) * Number(row.quantidade_estoque)
    }));

    return res.json({ produtos });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao listar produtos.", erro: error.message });
  }
});

router.get("/verificar_estoque", async (_req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM produto");

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Nenhum produto encontrado!" });
    }

    const produtos = rows
      .filter(
        (row) =>
          row.quantidade_estoque <= row.minimo_estoque ||
          row.quantidade_estoque >= row.maximo_estoque
      )
      .map((row) => ({
        nome: row.nome,
        valor: Number(row.valor_unitario),
        quantidade: row.quantidade_estoque,
        minimo: row.minimo_estoque,
        maximo: row.maximo_estoque
      }));

    return res.json({
      mensagem: "Produtos com estoque proximo do limite.",
      produtos
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao verificar estoque.", erro: error.message });
  }
});

router.get("/listar_saidas", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.nome, m.quantidade, m.datetime_movimentacao
       FROM movimentacao m
       INNER JOIN produto p ON p.id_produto = m.id_produto
       WHERE m.tipo = 'SAIDA'
       ORDER BY m.datetime_movimentacao DESC`
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Nenhum produto teve saida!" });
    }

    return res.json({ saidas: rows });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao listar saidas.", erro: error.message });
  }
});

router.post("/movimentar_produto", async (req, res) => {
  const { tipo, quantidade, id_produto } = req.body;

  if (!tipo || quantidade === undefined || id_produto === undefined) {
    return res.status(422).json({ mensagem: "Preencha todos os campos!" });
  }

  if (tipo !== "ENTRADA") {
    return res.status(422).json({ mensagem: "Tipo nao aceito!" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [produtoRows] = await conn.execute(
      "SELECT quantidade_estoque FROM produto WHERE id_produto = ? FOR UPDATE",
      [id_produto]
    );

    if (produtoRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ mensagem: "Produto nao encontrado!" });
    }

    await conn.execute(
      "INSERT INTO movimentacao (tipo, quantidade, id_produto, datetime_movimentacao) VALUES (?, ?, ?, NOW())",
      [tipo, Number(quantidade), Number(id_produto)]
    );

    const quantidadeTotal = Number(produtoRows[0].quantidade_estoque) + Number(quantidade);

    await conn.execute(
      "UPDATE produto SET quantidade_estoque = ? WHERE id_produto = ?",
      [quantidadeTotal, Number(id_produto)]
    );

    await conn.commit();

    return res.json({ mensagem: "Entrada executada com sucesso!" });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ mensagem: "Erro ao movimentar produto.", erro: error.message });
  } finally {
    conn.release();
  }
});

router.delete("/deletar_produto", async (req, res) => {
  const { id_produto } = req.body;

  if (id_produto === undefined) {
    return res.status(422).json({ mensagem: "Informe id_produto." });
  }

  try {
    const [result] = await pool.execute("DELETE FROM produto WHERE id_produto = ?", [
      Number(id_produto)
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Nao foi possivel encontrar o produto!" });
    }

    return res.json({ mensagem: "Produto removido com sucesso!" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao deletar produto.", erro: error.message });
  }
});

router.delete("/deletar_movimentacao", async (req, res) => {
  const { id_movimentacao, id_produto } = req.body;
  const id = id_movimentacao ?? id_produto;

  if (id === undefined) {
    return res.status(422).json({ mensagem: "Informe id_movimentacao." });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM movimentacao WHERE id_movimentacao = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Nao foi possivel encontrar a movimentacao!" });
    }

    return res.json({ mensagem: "Movimentacao removida com sucesso!" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao deletar movimentacao.", erro: error.message });
  }
});

module.exports = router;
