const express = require("express");
const {
  registrar,
  login,
  listarUsuarios,
  obterUsuario,
  criarUsuario,
  editarUsuario,
  deletarUsuario,
} = require("../controllers/User");
const { verificarToken, verificarAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * ROTAS PÚBLICAS (sem autenticação)
 */

/**
 * POST /auth/registrar
 * Registra um novo usuário
 */
router.post("/auth/registrar", registrar);

/**
 * POST /auth/login
 * Faz login e retorna o token JWT
 */
router.post("/auth/login", login);

/**
 * ROTAS PROTEGIDAS (requerem autenticação)
 * Apenas usuários autenticados podem acessar
 */

/**
 * ROTAS DE ADMIN (requerem token + nível admin)
 * Apenas administradores podem acessar
 */

/**
 * GET /users
 * Lista todos os usuários
 * Requer: autenticação + nível admin
 */
router.get("/users", verificarToken, verificarAdmin, listarUsuarios);

/**
 * GET /users/:id
 * Obtém dados de um usuário específico
 * Requer: autenticação + nível admin
 */
router.get("/users/:id", verificarToken, verificarAdmin, obterUsuario);

/**
 * POST /users
 * Cria um novo usuário
 * Requer: autenticação + nível admin
 * Body: { email, senha, nivel_acesso (opcional, padrão 0) }
 */
router.post("/users", verificarToken, verificarAdmin, criarUsuario);

/**
 * PUT /users/:id
 * Edita um usuário existente
 * Requer: autenticação + nível admin
 * Body: { email (opcional), senha (opcional), nivel_acesso (opcional), ativo (opcional) }
 */
router.put("/users/:id", verificarToken, verificarAdmin, editarUsuario);

/**
 * DELETE /users/:id
 * Deleta um usuário
 * Requer: autenticação + nível admin
 */
router.delete("/users/:id", verificarToken, verificarAdmin, deletarUsuario);

module.exports = router;
