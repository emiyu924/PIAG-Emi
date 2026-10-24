import React, { useEffect, useState } from 'react';
import { obterCategorias } from '../services/api';

// Card de categoria individual
function CategoriaBotao({ categoria, onSelect }) {
  return (
    <button
      type="button"
      className="categoria-item-btn"
      onClick={() => onSelect(categoria.nome)}
    >
      <span className="categoria-nome">{categoria.nome}</span>
      <span className="categoria-desc">{categoria.descricao}</span>
    </button>
  );
}

// Seção de navegação por categorias de materiais
export default function CategoryList({ onSelecionarCategoria }) {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    obterCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  return (
    <section id="categorias" className="secao-categorias-editorial">
      <div className="secao-cabecalho-limpo">
        <h2>Catálogo de Resíduos</h2>
        <p>Selecione o grupo do material para ver orientações e locais de entrega</p>
      </div>
      <div className="grade-categorias">
        {categorias.map((cat) => (
          <CategoriaBotao key={cat.id} categoria={cat} onSelect={onSelecionarCategoria} />
        ))}
      </div>
    </section>
  );
}
