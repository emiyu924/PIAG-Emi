import React from 'react';
import HomePage from './pages/HomePage';
import './styles/App.css';

// Lista de contatos úteis dos órgãos municipais de Americana
function RodapeContatos() {
  return (
    <div className="rodape-col-links">
      <span>Canais de Atendimento:</span>
      <ul>
        <li>SOSU Americana: (19) 3475-9000</li>
        <li>Cooperlírios: R. das Seriemas, 550-B</li>
        <li>DAE Americana: 0800 012 3737</li>
      </ul>
    </div>
  );
}

// Rodapé institucional com informações públicas de Americana
function RodapeInstitucional() {
  return (
    <footer className="rodape-editorial">
      <div className="rodape-limite">
        <div className="rodape-col-principal">
          <h4>GiroVerde Americana</h4>
          <p>Guia de orientação para destinação correta de resíduos sólidos urbanos (Lei 12.305/2010).</p>
        </div>
        <RodapeContatos />
      </div>
      <div className="rodape-creditos">
        <span>GiroVerde © 2026 • Apoio à conservação ambiental e reciclagem em Americana - SP</span>
      </div>
    </footer>
  );
}

// Componente raiz
export default function App() {
  return (
    <div className="layout-raiz-editorial">
      <HomePage />
      <RodapeInstitucional />
    </div>
  );
}
