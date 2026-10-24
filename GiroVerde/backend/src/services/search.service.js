import * as materialRepo from '../repositories/material.repository.js';
import * as pontoRepo from '../repositories/ponto.repository.js';
import * as dicaRepo from '../repositories/dica.repository.js';

// Localiza e valida o material solicitado pelo usuário (RF01, RF09)
async function obterMaterialValidado(termo) {
  const material = await materialRepo.buscarPorNomeOuTermo(termo);
  if (!material) {
    throw new Error('Nenhum material cadastrado encontrado para a busca.');
  }
  return material;
}

// Carrega em paralelo orientações, pontos de coleta e dicas
async function obterDadosComplementares(material, cidade) {
  const [orientacao, pontosColeta, dicas] = await Promise.all([
    materialRepo.buscarOrientacaoPorMaterialId(material.id),
    pontoRepo.buscarPontosCompativeis(material.id, cidade),
    dicaRepo.buscarDicasPorCategoriaId(material.categoria_id)
  ]);
  return { orientacao, pontosColeta, dicas };
}

// Formata o objeto consolidado com todas as informações requeridas
function formatarRespostaConsulta(material, dados) {
  return {
    material: {
      id: material.id,
      nome: material.nome,
      categoria: material.categoria_nome
    },
    orientacao: dados.orientacao,
    pontosColeta: dados.pontosColeta,
    dicas: dados.dicas
  };
}

// Processa a pesquisa completa de material aplicando as regras de negócio
export async function processarConsultaMaterial(termo, cidade = '') {
  if (!termo || termo.trim().length === 0) {
    throw new Error('O termo de pesquisa é obrigatório.');
  }
  const material = await obterMaterialValidado(termo.trim());
  const dados = await obterDadosComplementares(material, cidade);
  return formatarRespostaConsulta(material, dados);
}

