const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "sua_chave_secreta_super_segura_aqui_2024";

/**
 * Middleware para verificar token JWT
 * Extrai o token do header Authorization (Bearer token)
 * Valida e decodifica o token
 */
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      mensagem: "Acesso negado! Token não fornecido." 
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      mensagem: "Token inválido ou expirado!", 
      erro: error.message 
    });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 * Deve ser usado APÓS o middleware verificarToken
 */
const verificarAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ 
      mensagem: "Usuário não autenticado." 
    });
  }

  if (req.usuario.nivel_acesso !== 1) {
    return res.status(403).json({ 
      mensagem: "Acesso negado! Apenas administradores podem acessar este recurso." 
    });
  }

  next();
};

/**
 * Gera um token JWT válido por 24 horas
 * @param {Object} usuario - Dados do usuário
 * @returns {string} Token JWT
 */
const gerarToken = (usuario) => {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      nivel_acesso: usuario.nivel_acesso,
    },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
};

module.exports = {
  verificarToken,
  verificarAdmin,
  gerarToken,
  SECRET_KEY,
};
