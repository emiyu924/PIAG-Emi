import React from 'react';
import { ShieldCheck, MapPin, Scale } from 'lucide-react';

// Pilares informativos de credibilidade do serviço municipal
function PilaresInformativos() {
  return (
    <div className="hero-pilares">
      <div className="pilar-item">
        <MapPin size={16} />
        <span>8 Ecopontos Municipais</span>
      </div>
      <div className="pilar-item">
        <Scale size={16} />
        <span>Até 1m³ gratuito por dia</span>
      </div>
      <div className="pilar-item">
        <ShieldCheck size={16} />
        <span>SOSU & Cooperlírios</span>
      </div>
    </div>
  );
}

// Apresentação inicial do portal com tipografia editorial retrô
export default function HeroSection() {
  return (
    <section className="hero-editorial">
      <div className="hero-faixa-cores" aria-hidden="true"></div>
      <div className="hero-container">
        <span className="hero-chapeu">Serviço de Orientação Ambiental</span>
        <h1 className="hero-titulo">
          Onde e como descartar resíduos em Americana
        </h1>
        <p className="hero-descricao">
          Consulte regras de separação, cuidados de segurança e encontre a unidade
          municipal ou cooperativa mais próxima para entregar seus materiais.
        </p>
        <PilaresInformativos />
      </div>
    </section>
  );
}
