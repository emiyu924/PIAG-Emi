import * as categoriaRepo from '../repositories/categoria.repository.js';

// Retorna a lista de todas as categorias cadastradas
export async function listarCategorias(req, res) {
  try {
    const categorias = await categoriaRepo.listarCategorias();
    return res.status(200).json(categorias);
  } catch (erro) {
    return res.status(500).json({ mensagem: 'Erro ao listar categorias.' });
  }
}

