import React, { useState } from 'react';
import { buscarInformacoesMaterial } from '../services/api';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import SearchBar from '../components/SearchBar';
import CategoryList from '../components/CategoryList';
import RetroGuide from '../components/RetroGuide';
import MaterialDetail from '../components/MaterialDetail';
import CollectionPoints from '../components/CollectionPoints';
import EcoTips from '../components/EcoTips';

const ATALHOS_COMUNS = [
  'Vidro Incolor',
  'Vidro Colorido',
  'Madeira Maciça',
  'MDF / Móveis',
  'Entulho',
  'Óleo',
  'Pneus',
  'Celular'
];

// Barra de atalhos rápidos para materiais frequentes
function AtalhosFrequentes({ onBuscar }) {
  return (
    <div className="painel-atalhos-editorial">
      <span className="atalhos-rotulo">Consultas em destaque:</span>
      <div className="atalhos-lista">
        {ATALHOS_COMUNS.map((item) => (
          <button key={item} type="button" className="btn-atalho-tag" onClick={() => onBuscar(item, 'Americana')}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

// Bloco com os dados do material e locais de entrega encontrados
function PainelConsulta({ dados }) {
  return (
    <div className="painel-resultados-editorial">
      <MaterialDetail material={dados.material} orientacao={dados.orientacao} />
      <CollectionPoints pontos={dados.pontosColeta} />
      <EcoTips dicas={dados.dicas} />
    </div>
  );
}

// Tela principal do portal GiroVerde
export default function HomePage() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Executa a requisição de busca para a API
  async function executarPesquisa(termo, cidade = 'Americana') {
    setCarregando(true);
    setErro(null);
    try {
      const res = await buscarInformacoesMaterial(termo, cidade);
      setDados(res);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err) {
      setErro(err.message || 'Material não encontrado no cadastro municipal.');
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pagina-principal-editorial">
      <Navbar />
      <HeroSection />
      <main className="container-miolo">
        <SearchBar onBuscar={executarPesquisa} />
        <AtalhosFrequentes onBuscar={executarPesquisa} />
        {carregando && <div className="aviso-status carregando">Consultando unidades e regras de triagem...</div>}
        {erro && <div className="aviso-status erro">{erro}</div>}
        {dados && <PainelConsulta dados={dados} />}
        <RetroGuide />
        <CategoryList onSelecionarCategoria={(cat) => executarPesquisa(cat, 'Americana')} />
      </main>
    </div>
  );
}
