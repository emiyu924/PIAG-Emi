import React from 'react';
import { Info } from 'lucide-react';

// Card informativo de sustentabilidade e saúde pública
function DicaEditorialCard({ dica }) {
  return (
    <article className="card-dica-editorial">
      <div className="dica-topo-meta">
        <span className="dica-tema-tag">{dica.tema}</span>
        <Info size={15} className="dica-icone-info" />
      </div>
      <h4>{dica.titulo}</h4>
      <p>{dica.conteudo}</p>
    </article>
  );
}

// Seção de orientações de utilidade pública
export default function EcoTips({ dicas }) {
  if (!dicas || dicas.length === 0) return null;
  return (
    <section className="secao-dicas-editorial">
      <div className="secao-cabecalho-limpo">
        <h2>Orientações Ambientais e de Saúde Pública</h2>
        <p>Recomendações técnicas para a conservação da bacia hidrográfica e apoio à triagem</p>
      </div>
      <div className="grade-dicas-editorial">
        {dicas.map((d) => <DicaEditorialCard key={d.id} dica={d} />)}
      </div>
    </section>
  );
}
