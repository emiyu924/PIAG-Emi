import React from 'react';
import { Wine, Box, Hammer, Truck } from 'lucide-react';

const REGRAS_DESCARTE = [
  {
    num: '01',
    icone: <Wine size={20} />,
    titulo: 'Vidro: Separação por Cor',
    texto: 'Vidros incolores, verdes e âmbar não perdem a cor na fusão. Misturar cores contamina o lote e impede a fabricação de novas garrafas transparentes.'
  },
  {
    num: '02',
    icone: <Box size={20} />,
    titulo: 'Madeira Pura vs. MDF/MDP',
    texto: 'Madeira maciça (paletes/caixotes) vira compostagem e forração. Já MDF e aglomerados contêm resinas sintéticas e devem ser entregues sem ferragens.'
  },
  {
    num: '03',
    icone: <Hammer size={20} />,
    titulo: 'Entulho Limpo vs. Gesso',
    texto: 'Tijolo e concreto são reciclados como base de vias. O gesso sulfata o solo e é proibido nos ecopontos da SOSU. Mantenha-o sempre isolado.'
  },
  {
    num: '04',
    icone: <Truck size={20} />,
    titulo: 'Cota de 1m³ nos Ecopontos',
    texto: 'A Prefeitura de Americana disponibiliza 8 ecopontos com entrega gratuita de até 1m³ diário por morador para entulho, podas, móveis e pneus.'
  }
];

// Card de cada regra fundamental de triagem
function RegraCard({ regra }) {
  return (
    <div className="card-regra-editorial">
      <div className="regra-topo">
        <span className="regra-numero">{regra.num}</span>
        <span className="regra-icone-moldura">{regra.icone}</span>
      </div>
      <h3>{regra.titulo}</h3>
      <p>{regra.texto}</p>
    </div>
  );
}

// Guia de separação técnica com regras críticas de Americana
export default function RetroGuide() {
  return (
    <section id="orientacoes" className="secao-guia-editorial">
      <div className="secao-cabecalho-limpo">
        <h2>Regras Críticas de Separação em Americana</h2>
        <p>A correta separação evita a contaminação de lotes inteiros e viabiliza a reciclagem na cidade</p>
      </div>
      <div className="grade-regras-editorial">
        {REGRAS_DESCARTE.map((r) => <RegraCard key={r.num} regra={r} />)}
      </div>
    </section>
  );
}
