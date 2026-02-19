# Gerenciador de estoque (Node + Express)

Versao do projeto original reescrita com Node.js + Express + MySQL.

## Requisitos

- Node.js 18+
- MySQL em execucao
- Banco `empresa` criado com o script `js/config/bd.sql`

## Instalacao

```bash
cd js
npm install
cp .env.example .env
```

Configure as variaveis no `.env` se necessario.

Para criar o banco:

```bash
mysql -u root -p < config/bd.sql
```

## Executar

```bash
npm run dev
```

ou

```bash
npm start
```

## Endpoints

### Cadastrar novo produto
- **URI**: `POST /add_produto`
- **body**:
```json
{
  "nome": "Detergente",
  "valor": 18.9,
  "entrada": "2026-02-19",
  "quantidade": 25,
  "minimo": 5,
  "maximo": 100
}
```

### Listar valor de um produto
- **URI**: `GET /listar_produto/:nome`

### Listar valor de todos os produtos
- **URI**: `GET /listar_produtos`

### Verificar estoque proximo do limite
- **URI**: `GET /verificar_estoque`

### Listar saidas
- **URI**: `GET /listar_saidas`

### Entrada de produtos
- **URI**: `POST /movimentar_produto`
- **body**:
```json
{
  "tipo": "ENTRADA",
  "quantidade": 10,
  "id_produto": 1
}
```

### Deletar produto
- **URI**: `DELETE /deletar_produto`
- **body**:
```json
{
  "id_produto": 1
}
```

### Deletar movimentacao
- **URI**: `DELETE /deletar_movimentacao`
- **body**:
```json
{
  "id_movimentacao": 1
}
```
