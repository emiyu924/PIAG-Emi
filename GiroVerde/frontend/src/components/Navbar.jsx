import React from 'react';
import { PhoneCall, ExternalLink } from 'lucide-react';

// Selo informativo com contato da SOSU Americana
function ContatoRapido() {
  return (
    <div className="nav-atendimento">
      <PhoneCall size={14} className="icone-telefone" />
      <span>SOSU Americana: (19) 3475-9000</span>
    </div>
  );
}

// Menu de navegação por âncoras da página
function MenuLinks() {
  return (
    <nav className="nav-menu">
      <a href="#busca">Pesquisar</a>
      <a href="#categorias">Categorias</a>
      <a href="#ecopontos">Ecopontos</a>
      <a href="#orientacoes">Como Funciona</a>
    </nav>
  );
}

// Barra de navegação com identidade editorial retrô
export default function Navbar() {
  return (
    <header className="navbar-topo">
      <div className="nav-conteudo">
        <div className="nav-marca">
          <span className="marca-logo">GiroVerde</span>
          <span className="marca-cidade">Americana • SP</span>
        </div>
        <div className="nav-direita">
          <ContatoRapido />
          <MenuLinks />
        </div>
      </div>
    </header>
  );
}
