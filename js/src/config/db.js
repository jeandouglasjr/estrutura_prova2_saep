const { Pool } = require('pg');

// Força a leitura do .env caso ele ainda não tenha sido carregado
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  // A correção crucial: garantir que NUNCA seja undefined ou nulo
  password: String(process.env.DB_PASSWORD || ""), 
  database: process.env.DB_NAME || 'empresa',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  max: 10,
};

console.log(`[DB] Tentando conectar em: ${dbConfig.host}:${dbConfig.port} com usuário: ${dbConfig.user}`);

const pool = new Pool(dbConfig);

// Teste de conexão imediato
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ ERRO CRÍTICO NO BANCO:', err.message);
  } else {
    console.log('✅ BANCO CONECTADO COM SUCESSO!');
  }
});

module.exports = pool;