import { pool, isPostgresConnected } from '../config/database.js';
import { dicasIniciais } from '../data/seedData.js';

// Busca dicas no banco de dados PostgreSQL
async function buscarDicasNoBanco(categoriaId) {
  const sql = `
    SELECT id, titulo, conteudo, tema
    FROM dicas_reciclagem
    WHERE publicado = TRUE AND (categoria_id = $1 OR categoria_id IS NULL)
    LIMIT 3;
  `;
  const { rows } = await pool.query(sql, [categoriaId]);
  return rows;
}

// Filtra dicas em memória relacionadas à categoria
function buscarDicasEmMemoria(categoriaId) {
  const catNum = Number(categoriaId);
  return dicasIniciais.filter((d) => d.categoria_id === catNum || !d.categoria_id);
}

// Retorna dicas de reciclagem relevantes para a categoria (RF05)
export async function buscarDicasPorCategoriaId(categoriaId) {
  if (isPostgresConnected) {
    return buscarDicasNoBanco(categoriaId);
  }
  return buscarDicasEmMemoria(categoriaId);
}

// Lista todas as dicas cadastradas
export async function listarTodasDicas() {
  return dicasIniciais;
}

