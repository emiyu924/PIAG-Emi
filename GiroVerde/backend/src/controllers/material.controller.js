import * as materialRepo from '../repositories/material.repository.js';

// Retorna a listagem de materiais, permitindo filtro por categoria
export async function listarMateriais(req, res) {
  try {
    const { categoriaId } = req.query;
    const materiais = await materialRepo.listarMateriais(categoriaId);
    return res.status(200).json(materiais);
  } catch (erro) {
    return res.status(500).json({ mensagem: 'Erro ao listar materiais.' });
  }
}

