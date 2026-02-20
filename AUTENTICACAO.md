# 📚 Documentação - Sistema de Autenticação e Controle de Usuários

## 🔐 Autenticação com JWT

Este projeto implementa um sistema completo de autenticação usando JWT (JSON Web Tokens) e controle de acesso baseado em níveis de permissão.

---

## 🛠️ Funcionalidades Implementadas

### 1. **Middleware de Autenticação** (`middleware/auth.js`)
- `verificarToken`: Valida o JWT fornecido no header `Authorization: Bearer <token>`
- `verificarAdmin`: Verifica se o usuário tem nível de acesso de administrador
- `gerarToken`: Gera um token JWT válido por 24 horas

### 2. **Controle de Usuários** (`controllers/User.js`)
- Registro de novos usuários
- Login com email e senha
- Gerenciamento de usuários (criar, listar, editar, deletar) - ADMIN ONLY
- Hash seguro de senhas com bcryptjs
- Validação de email e força de senha

### 3. **Rotas de Autenticação** (`routes/user.routes.js`)
- Rotas públicas: registro e login
- Rotas protegidas: gerenciamento de usuários (apenas admin)

---

## 📊 Estrutura do Banco de Dados

### Tabela `usuario`
```sql
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso INT NOT NULL DEFAULT 0 COMMENT '0=usuario, 1=administrador',
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);
```

### Níveis de Acesso
- **0**: Usuário comum (pode apenas fazer login)
- **1**: Administrador (acesso total a gerenciamento de usuários)

---

## 🚀 Como Usar

### 1. **Preparação do Ambiente**

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Copiar .env.example para .env e atualizar as credenciais
cp .env.example .env
```

### 2. **Executar o Banco de Dados**

```bash
# Executar o script SQL para criar as tabelas
# Use seu cliente SQL (MySQL Workbench, pgAdmin, etc.)
# Executar: config/bd.sql
```

### 3. **Iniciar o Servidor**

```bash
npm run dev
```

---

## 📡 Endpoints da API

### 🔓 **Autenticação Pública**

#### 1. **Registrar Novo Usuário**
```http
POST /auth/registrar
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "senha": "senha123"
}
```

**Resposta (201):**
```json
{
  "mensagem": "Usuário registrado com sucesso!",
  "usuario": {
    "id_usuario": 1,
    "email": "usuario@empresa.com",
    "nivel_acesso": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 2. **Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "mensagem": "Login realizado com sucesso!",
  "usuario": {
    "id_usuario": 1,
    "email": "usuario@empresa.com",
    "nivel_acesso": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🔒 **Gerenciamento de Usuários (ADMIN ONLY)**

Todos os endpoints abaixo requerem:
- **Authorization**: `Bearer <token_jwt>`
- **Nível de Acesso**: Administrador (nivel_acesso = 1)

---

#### 3. **Listar Todos os Usuários**
```http
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200):**
```json
{
  "total": 3,
  "usuarios": [
    {
      "id_usuario": 1,
      "email": "admin@empresa.com",
      "nivel_acesso": 1,
      "data_cadastro": "2024-02-19T10:30:00.000Z",
      "ativo": true
    },
    {
      "id_usuario": 2,
      "email": "usuario@empresa.com",
      "nivel_acesso": 0,
      "data_cadastro": "2024-02-19T10:35:00.000Z",
      "ativo": true
    }
  ]
}
```

---

#### 4. **Obter Usuário Específico**
```http
GET /users/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200):**
```json
{
  "usuario": {
    "id_usuario": 2,
    "email": "usuario@empresa.com",
    "nivel_acesso": 0,
    "data_cadastro": "2024-02-19T10:35:00.000Z",
    "ativo": true
  }
}
```

---

#### 5. **Criar Novo Usuário**
```http
POST /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "novo.usuario@empresa.com",
  "senha": "senha123",
  "nivel_acesso": 0
}
```

**Resposta (201):**
```json
{
  "mensagem": "Usuário criado com sucesso!",
  "usuario": {
    "id_usuario": 4,
    "email": "novo.usuario@empresa.com",
    "nivel_acesso": 0,
    "data_cadastro": "2024-02-19T11:00:00.000Z",
    "ativo": true
  }
}
```

---

#### 6. **Editar Usuário**
```http
PUT /users/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "usuario.editado@empresa.com",
  "nivel_acesso": 1,
  "ativo": true
}
```

**Resposta (200):**
```json
{
  "mensagem": "Usuário atualizado com sucesso!",
  "usuario": {
    "id_usuario": 2,
    "email": "usuario.editado@empresa.com",
    "nivel_acesso": 1,
    "data_cadastro": "2024-02-19T10:35:00.000Z",
    "ativo": true
  }
}
```

---

#### 7. **Deletar Usuário**
```http
DELETE /users/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200):**
```json
{
  "mensagem": "Usuário deletado com sucesso!",
  "usuarioDeletado": {
    "id_usuario": 2,
    "email": "usuario@empresa.com"
  }
}
```

---

## ⚠️ Códigos de Erro

| Código | Mensagem | Causa |
|--------|----------|-------|
| 401 | "Acesso negado! Token não fornecido." | Token JWT não incluído no header |
| 403 | "Token inválido ou expirado!" | Token JWT inválido ou expirado |
| 403 | "Acesso negado! Apenas administradores..." | Usuário não tem permissão de admin |
| 404 | "Usuário não encontrado!" | ID do usuário não existe |
| 422 | "Email já cadastrado!" | Email já existe no banco |
| 422 | "Email inválido!" | Formato de email incorreto |
| 422 | "Senha deve ter no mínimo 6 caracteres!" | Senha muito curta |
| 500 | "Erro ao registrar usuário." | Erro interno do servidor |

---

## 🔒 Segurança

✅ **Implementações de Segurança:**
- Senhas hasheadas com bcryptjs (10 salts)
- Tokens JWT com expiração de 24 horas
- Validação de email e senha
- Proteção de rotas com middleware
- Controle de acesso por níveis de permissão
- Proteção contra deleção acidental do próprio usuário (admin)

---

## 📝 Exemplo Completo de Fluxo

### 1. **Registrar um novo usuário**
```bash
curl -X POST http://localhost:3000/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","senha":"password123"}'
```

### 2. **Fazer login e obter token**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","senha":"admin123"}'
```

### 3. **Usar o token para listar usuários (admin)**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. **Criar novo usuário (admin)**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"email":"novo@empresa.com","senha":"nova123","nivel_acesso":0}'
```

### 5. **Editar usuário (admin)**
```bash
curl -X PUT http://localhost:3000/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"nivel_acesso":1}'
```

### 6. **Deletar usuário (admin)**
```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🎯 Níveis de Acesso e Permissões

| Ação | Nível 0 (Usuário) | Nível 1 (Admin) |
|------|-------------------|-----------------|
| Registrar-se | ✅ | ✅ |
| Fazer login | ✅ | ✅ |
| Listar usuários | ❌ | ✅ |
| Obter usuário | ❌ | ✅ |
| Criar usuário | ❌ | ✅ |
| Editar usuário | ❌ | ✅ |
| Deletar usuário | ❌ | ✅ |
| Acessar produtos (estoque) | ⚠️ | ✅ |

---

## 🔧 Variáveis de Ambiente

Criar um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=empresa
DB_PORT=5433

# JWT Secret (customize para produção!)
JWT_SECRET=sua_chave_secreta_super_segura_aqui_2024

# Ambiente
NODE_ENV=development
```

---

## ✨ Próximas Funcionalidades (Opcional)

- [ ] Recuperação de senha via email
- [ ] Autenticação em dois fatores (2FA)
- [ ] Refresh tokens
- [ ] Auditoria de ações de usuários
- [ ] Controle de permissões granular por produto
- [ ] Rate limiting para login

---

**Desenvolvido com ❤️ | SAEP Node.js**
