import React from 'react';
import { MapPin, Clock, Phone, ExternalLink, AlertCircle } from 'lucide-react';

// Selo de identificação do ponto de coleta
function SeloPonto({ nome }) {
  const isEco = nome.toLowerCase().includes('ecoponto');
  const isCoop = nome.toLowerCase().includes('cooper');
  const texto = isEco ? 'Ecoponto Municipal • SOSU' : isCoop ? 'Cooperativa Municipal' : 'Polo Especializado';
  const classe = isEco ? 'selo-ecoponto' : isCoop ? 'selo-cooperativa' : 'selo-polo';
  return <span className={`selo-tipo-ponto ${classe}`}>{texto}</span>;
}

// Card de ponto de coleta compatível com link para mapas
function PontoCard({ ponto }) {
  const queryMapa = encodeURIComponent(`${ponto.nome}, ${ponto.logradouro}, Americana SP`);
  const linkMapa = `https://www.google.com/maps/search/?api=1&query=${queryMapa}`;
  return (
    <article className="card-ponto-editorial">
      <div className="card-ponto-topo">
        <SeloPonto nome={ponto.nome} />
        <h3>{ponto.nome}</h3>
      </div>
      <p className="dado-linha"><MapPin size={15} /> {ponto.logradouro}, {ponto.numero} - {ponto.bairro}</p>
      {ponto.horario_funcionamento && (
        <p className="dado-linha"><Clock size={15} /> {ponto.horario_funcionamento}</p>
      )}
      {ponto.condicoes_recebimento && (
        <div className="box-condicao-recebimento">
          <strong>Condições:</strong> {ponto.condicoes_recebimento}
        </div>
      )}
      <a href={linkMapa} target="_blank" rel="noopener noreferrer" className="btn-rota-mapa">
        <span>Abrir rota no mapa</span>
        <ExternalLink size={13} />
      </a>
    </article>
  );
}

// Lista os pontos de entrega compatíveis com o material
export default function CollectionPoints({ pontos }) {
  const semPontos = !pontos || pontos.length === 0;
  return (
    <section id="ecopontos" className="secao-pontos-editorial">
      <div className="secao-cabecalho-limpo">
        <h2>Locais de Entrega Compatíveis ({semPontos ? 0 : pontos.length})</h2>
        <p>Unidades em Americana cadastradas para o recebimento deste material</p>
      </div>
      {semPontos ? (
        <div className="aviso-sem-pontos">
          <AlertCircle size={20} />
          <p>Nenhuma unidade cadastrada aceita este resíduo no município selecionado.</p>
        </div>
      ) : (
        <div className="grade-pontos-editorial">
          {pontos.map((p) => <PontoCard key={p.id} ponto={p} />)}
        </div>
      )}
    </section>
  );
}
