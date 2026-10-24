import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Cria o pool com timeout curto para conexões com o PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 500
});

// Flag que indica se o PostgreSQL está conectado
export let isPostgresConnected = false;

// Conecta ao PostgreSQL de forma não bloqueante com fallback instantâneo
export async function testarConexaoBanco() {
  try {
    const client = await pool.connect();
    isPostgresConnected = true;
    client.release();
    console.log('[Banco] PostgreSQL conectado com sucesso.');
  } catch {
    isPostgresConnected = false;
    console.log('[Banco] PostgreSQL offline. Base de dados de Americana ativa em memória.');
  }
}
