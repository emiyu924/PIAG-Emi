import { processarConsultaMaterial } from '../services/search.service.js';

// Retorna o status HTTP de acordo com a mensagem de erro
function obterStatusErro(mensagem) {
  if (mensagem.includes('obrigatório')) return 400;
  if (mensagem.includes('Nenhum material')) return 404;
  return 500;
}

// Trata a requisição de consulta de materiais e orientações
export async function consultarMaterial(req, res) {
  try {
    const { termo, cidade } = req.query;
    const resultado = await processarConsultaMaterial(termo, cidade);
    return res.status(200).json(resultado);
  } catch (erro) {
    const status = obterStatusErro(erro.message);
    return res.status(status).json({ mensagem: erro.message });
  }
}

