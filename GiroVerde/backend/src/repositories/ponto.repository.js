import { pool, isPostgresConnected } from '../config/database.js';
import { pontosIniciais } from '../data/seedData.js';

// Executa a busca SQL de pontos compatíveis no PostgreSQL
async function buscarPontosNoBanco(materialId, cidade) {
  const sql = `
    SELECT p.id, p.nome, p.logradouro, p.numero, p.bairro, p.cidade, 
           p.horario_funcionamento, p.contato, mpc.condicoes_recebimento
    FROM pontos_coleta p
    INNER JOIN materiais_pontos_coleta mpc ON mpc.ponto_coleta_id = p.id
    WHERE mpc.material_id = $1 
      AND p.ativo = TRUE
      AND ($2 = '' OR p.cidade ILIKE $2);
  `;
  const { rows } = await pool.query(sql, [materialId, cidade ? `%${cidade}%` : '']);
  return rows;
}

// Filtra pontos compatíveis em memória (RN03 - Compatibilidade)
function buscarPontosEmMemoria(materialId, cidade) {
  const idNum = Number(materialId);
  const cidLower = cidade ? cidade.toLowerCase() : '';
  return pontosIniciais.filter((p) => {
    const aceita = p.ativo && p.materiais_aceitos.includes(idNum);
    const cidadeBate = !cidLower || p.cidade.toLowerCase().includes(cidLower);
    return aceita && cidadeBate;
  });
}

// Retorna pontos de coleta compatíveis com o material e local (RF03, RN03)
export async function buscarPontosCompativeis(materialId, cidade = '') {
  if (isPostgresConnected) {
    return buscarPontosNoBanco(materialId, cidade);
  }
  return buscarPontosEmMemoria(materialId, cidade);
}

// Lista todos os pontos de coleta cadastrados
export async function listarTodosPontos() {
  return pontosIniciais.filter((p) => p.ativo);
}

