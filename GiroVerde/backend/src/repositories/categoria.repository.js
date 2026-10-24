import { pool, isPostgresConnected } from '../config/database.js';
import { categoriasIniciais } from '../data/seedData.js';

// Busca lista de categorias no PostgreSQL
async function listarCategoriasNoBanco() {
  const sql = 'SELECT id, nome, descricao, icone FROM categorias ORDER BY nome ASC;';
  const { rows } = await pool.query(sql);
  return rows;
}

// Retorna todas as categorias disponíveis (RF01)
export async function listarCategorias() {
  if (isPostgresConnected) {
    return listarCategoriasNoBanco();
  }
  return categoriasIniciais;
}

