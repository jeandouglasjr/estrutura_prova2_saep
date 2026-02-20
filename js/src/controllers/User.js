const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { gerarToken } = require("../middleware/auth");

/**
 * Registra um novo usuário
 */
const registrar = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(422).json({ 
      mensagem: "Email e senha são obrigatórios!" 
    });
  }

  // Validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(422).json({ 
      mensagem: "Email inválido!" 
    });
  }

  // Validação de senha (mínimo 6 caracteres)
  if (senha.length < 6) {
    return res.status(422).json({ 
      mensagem: "Senha deve ter no mínimo 6 caracteres!" 
    });
  }

  try {
    // Verifica se o email já existe
    const checkEmail = await pool.query(
      "SELECT id_usuario FROM usuario WHERE email = $1",
      [email]
    );

    if (checkEmail.rowCount > 0) {
      return res.status(422).json({ 
        mensagem: "Email já cadastrado!" 
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir novo usuário com nível 0 (usuário comum)
    const result = await pool.query(
      `INSERT INTO usuario (email, senha, nivel_acesso) 
       VALUES ($1, $2, $3) 
       RETURNING id_usuario, email, nivel_acesso`,
      [email, senhaHash, 0]
    );

    const usuario = result.rows[0];
    const token = gerarToken(usuario);

    return res.status(201).json({
      mensagem: "Usuário registrado com sucesso!",
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
      },
      token,
    });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    return res.status(500).json({ 
      mensagem: "Erro ao registrar usuário.",
      erro: error.message 
    });
  }
};

/**
 * Login de usuário
 */
const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(422).json({ 
      mensagem: "Email e senha são obrigatórios!" 
    });
  }

  try {
    // Busca o usuário pelo email
    const result = await pool.query(
      "SELECT id_usuario, email, senha, nivel_acesso, ativo FROM usuario WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ 
        mensagem: "Email ou senha incorretos!" 
      });
    }

    const usuario = result.rows[0];

    // Verifica se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(403).json({ 
        mensagem: "Usuário inativo!" 
      });
    }

    // Compara a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ 
        mensagem: "Email ou senha incorretos!" 
      });
    }

    // Gera o token
    const token = gerarToken(usuario);

    return res.json({
      mensagem: "Login realizado com sucesso!",
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
      },
      token,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ 
      mensagem: "Erro ao fazer login.",
      erro: error.message 
    });
  }
};

/**
 * Listar todos os usuários (ADMIN ONLY)
 */
const listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_usuario, email, nivel_acesso, data_cadastro, ativo 
       FROM usuario 
       ORDER BY data_cadastro DESC`
    );

    return res.json({
      total: result.rowCount,
      usuarios: result.rows,
    });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return res.status(500).json({ 
      mensagem: "Erro ao listar usuários.",
      erro: error.message 
    });
  }
};

/**
 * Obter dados de um usuário específico (ADMIN ONLY)
 */
const obterUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id_usuario, email, nivel_acesso, data_cadastro, ativo 
       FROM usuario 
       WHERE id_usuario = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        mensagem: "Usuário não encontrado!" 
      });
    }

    return res.json({
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    return res.status(500).json({ 
      mensagem: "Erro ao obter usuário.",
      erro: error.message 
    });
  }
};

/**
 * Criar novo usuário (ADMIN ONLY)
 */
const criarUsuario = async (req, res) => {
  const { email, senha, nivel_acesso } = req.body;

  if (!email || !senha) {
    return res.status(422).json({ 
      mensagem: "Email e senha são obrigatórios!" 
    });
  }

  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(422).json({ 
      mensagem: "Email inválido!" 
    });
  }

  // Validação de senha
  if (senha.length < 6) {
    return res.status(422).json({ 
      mensagem: "Senha deve ter no mínimo 6 caracteres!" 
    });
  }

  // Validação de nível de acesso
  if (nivel_acesso !== undefined && ![0, 1].includes(nivel_acesso)) {
    return res.status(422).json({ 
      mensagem: "Nível de acesso inválido! Use 0 (usuário) ou 1 (admin)" 
    });
  }

  try {
    // Verifica se o email já existe
    const checkEmail = await pool.query(
      "SELECT id_usuario FROM usuario WHERE email = $1",
      [email]
    );

    if (checkEmail.rowCount > 0) {
      return res.status(422).json({ 
        mensagem: "Email já cadastrado!" 
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere o novo usuário
    const result = await pool.query(
      `INSERT INTO usuario (email, senha, nivel_acesso) 
       VALUES ($1, $2, $3) 
       RETURNING id_usuario, email, nivel_acesso, data_cadastro, ativo`,
      [email, senhaHash, nivel_acesso || 0]
    );

    return res.status(201).json({
      mensagem: "Usuário criado com sucesso!",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ 
      mensagem: "Erro ao criar usuário.",
      erro: error.message 
    });
  }
};

/**
 * Editar usuário (ADMIN ONLY)
 */
const editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { email, senha, nivel_acesso, ativo } = req.body;

  try {
    // Verifica se o usuário existe
    const checkUsuario = await pool.query(
      "SELECT id_usuario FROM usuario WHERE id_usuario = $1",
      [id]
    );

    if (checkUsuario.rowCount === 0) {
      return res.status(404).json({ 
        mensagem: "Usuário não encontrado!" 
      });
    }

    // Monta a query de atualização dinamicamente
    const updates = [];
    const params = [];
    let paramCounter = 1;

    if (email !== undefined) {
      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(422).json({ 
          mensagem: "Email inválido!" 
        });
      }

      // Verifica se o email já existe (em outro usuário)
      const checkEmail = await pool.query(
        "SELECT id_usuario FROM usuario WHERE email = $1 AND id_usuario != $2",
        [email, id]
      );

      if (checkEmail.rowCount > 0) {
        return res.status(422).json({ 
          mensagem: "Email já cadastrado!" 
        });
      }

      updates.push(`email = $${paramCounter}`);
      params.push(email);
      paramCounter++;
    }

    if (senha !== undefined) {
      if (senha.length < 6) {
        return res.status(422).json({ 
          mensagem: "Senha deve ter no mínimo 6 caracteres!" 
        });
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      updates.push(`senha = $${paramCounter}`);
      params.push(senhaHash);
      paramCounter++;
    }

    if (nivel_acesso !== undefined) {
      if (![0, 1].includes(nivel_acesso)) {
        return res.status(422).json({ 
          mensagem: "Nível de acesso inválido! Use 0 (usuário) ou 1 (admin)" 
        });
      }

      updates.push(`nivel_acesso = $${paramCounter}`);
      params.push(nivel_acesso);
      paramCounter++;
    }

    if (ativo !== undefined) {
      updates.push(`ativo = $${paramCounter}`);
      params.push(ativo);
      paramCounter++;
    }

    if (updates.length === 0) {
      return res.status(422).json({ 
        mensagem: "Nenhum campo para atualizar!" 
      });
    }

    params.push(id);

    const query = `UPDATE usuario SET ${updates.join(", ")} 
                   WHERE id_usuario = $${paramCounter}
                   RETURNING id_usuario, email, nivel_acesso, data_cadastro, ativo`;

    const result = await pool.query(query, params);

    return res.json({
      mensagem: "Usuário atualizado com sucesso!",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    return res.status(500).json({ 
      mensagem: "Erro ao editar usuário.",
      erro: error.message 
    });
  }
};

/**
 * Deletar usuário (ADMIN ONLY)
 */
const deletarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    // Impede que o admin delete a si mesmo
    if (req.usuario.id_usuario === parseInt(id)) {
      return res.status(422).json({ 
        mensagem: "Você não pode deletar sua própria conta!" 
      });
    }

    // Verifica se o usuário existe
    const checkUsuario = await pool.query(
      "SELECT id_usuario, email FROM usuario WHERE id_usuario = $1",
      [id]
    );

    if (checkUsuario.rowCount === 0) {
      return res.status(404).json({ 
        mensagem: "Usuário não encontrado!" 
      });
    }

    // Deleta o usuário
    await pool.query("DELETE FROM usuario WHERE id_usuario = $1", [id]);

    return res.json({
      mensagem: "Usuário deletado com sucesso!",
      usuarioDeletado: checkUsuario.rows[0],
    });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return res.status(500).json({ 
      mensagem: "Erro ao deletar usuário.",
      erro: error.message 
    });
  }
};

module.exports = {
  registrar,
  login,
  listarUsuarios,
  obterUsuario,
  criarUsuario,
  editarUsuario,
  deletarUsuario,
};
