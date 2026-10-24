// Endereço base da API backend
const API_BASE_URL = 'http://localhost:3001/api';

// Busca orientações, pontos de coleta e dicas com base no termo e cidade (RF01, RF03)
export async function buscarInformacoesMaterial(termo, cidade = '') {
  const params = new URLSearchParams({ termo, cidade });
  const resposta = await fetch(`${API_BASE_URL}/consultas?${params}`);
  if (!resposta.ok) {
    const erroJson = await resposta.json().catch(() => ({}));
    throw new Error(erroJson.mensagem || 'Falha ao buscar material.');
  }
  return resposta.json();
}

// Carrega as categorias de resíduos cadastradas (RF01)
export async function obterCategorias() {
  const resposta = await fetch(`${API_BASE_URL}/categorias`);
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar as categorias.');
  }
  return resposta.json();
}

