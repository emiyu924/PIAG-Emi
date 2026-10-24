import { pool, isPostgresConnected } from '../config/database.js';
import { materiaisIniciais, orientacoesIniciais } from '../data/seedData.js';

// Busca material por nome ou categoria no PostgreSQL
async function buscarMaterialNoBanco(termo) {
  const sql = `
    SELECT m.id, m.nome, m.categoria_id, c.nome AS categoria_nome
    FROM materiais m
    INNER JOIN categorias c ON c.id = m.categoria_id
    WHERE m.ativo = TRUE AND (m.nome ILIKE $1 OR c.nome ILIKE $1)
    LIMIT 1;
  `;
  const { rows } = await pool.query(sql, [`%${termo}%`]);
  return rows[0] || null;
}

// Busca material em memória por correspondência de palavras-chave
function buscarMaterialEmMemoria(termo) {
  const t = termo.toLowerCase().trim();
  if (t.includes('gesso')) return materiaisIniciais.find((m) => m.id === 7) || null;
  const palavras = t.split(/\s+/).filter((p) => p.length > 2);
  return materiaisIniciais.find((m) => {
    if (!m.ativo) return false;
    const texto = `${m.nome} ${m.categoria_nome || ''}`.toLowerCase();
    if (texto.includes(t) || t.includes(m.nome.toLowerCase())) return true;
    return palavras.length > 0 && palavras.every((p) => texto.includes(p));
  }) || null;
}

// Busca material por nome ou palavra-chave (RF01)
export async function buscarPorNomeOuTermo(termo) {
  if (isPostgresConnected) {
    return buscarMaterialNoBanco(termo);
  }
  return buscarMaterialEmMemoria(termo);
}

// Busca orientação de descarte no PostgreSQL
async function buscarOrientacaoNoBanco(materialId) {
  const sql = `
    SELECT destino_recomendado, instrucoes_preparo, cuidados_seguranca, fonte, data_revisao
    FROM orientacoes_descarte
    WHERE material_id = $1;
  `;
  const { rows } = await pool.query(sql, [materialId]);
  return rows[0] || null;
}

// Retorna as orientações de descarte do material (RF02)
export async function buscarOrientacaoPorMaterialId(materialId) {
  if (isPostgresConnected) {
    return buscarOrientacaoNoBanco(materialId);
  }
  return orientacoesIniciais.find((o) => o.material_id === Number(materialId)) || null;
}

// Lista todos os materiais ativos ou filtra por categoria
export async function listarMateriais(categoriaId = null) {
  if (!categoriaId) {
    return materiaisIniciais.filter((m) => m.ativo);
  }
  return materiaisIniciais.filter((m) => m.ativo && m.categoria_id === Number(categoriaId));
}
