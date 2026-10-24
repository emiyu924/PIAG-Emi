import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

// Campos de entrada de material e cidade
function CamposBusca({ termo, setTermo, cidade, setCidade }) {
  return (
    <div className="busca-campos">
      <div className="campo-item principal">
        <Search size={18} className="campo-icone" />
        <input
          type="text"
          placeholder="Ex: entulho de obra, óleo de cozinha, sofá velho, pneus, vidros..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
      </div>
      <div className="campo-item cidade">
        <MapPin size={18} className="campo-icone" />
        <input
          type="text"
          placeholder="Cidade (padrão: Americana)"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />
      </div>
    </div>
  );
}

// Formulário de busca de materiais com validação de entrada
export default function SearchBar({ onBuscar }) {
  const [termo, setTermo] = useState('');
  const [cidade, setCidade] = useState('');

  // Envia a busca garantindo termo preenchido
  function disparar(e) {
    e.preventDefault();
    if (!termo.trim()) return;
    onBuscar(termo.trim(), cidade.trim() || 'Americana');
  }

  return (
    <form id="busca" className="busca-formulario" onSubmit={disparar}>
      <CamposBusca termo={termo} setTermo={setTermo} cidade={cidade} setCidade={setCidade} />
      <button type="submit" className="btn-consultar">
        Consultar Destino
      </button>
    </form>
  );
}
