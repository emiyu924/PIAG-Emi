import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';

// Informação técnica sobre a importância de separar vidros por cor
function DestaqueVidroCores({ ehVidro }) {
  if (!ehVidro) return null;
  return (
    <div className="painel-destaque-tecnico vidro">
      <strong>Regra Crítica: Separação do Vidro por Cor</strong>
      <p>
        A cor não desaparece no forno. Misturar verde ou âmbar com vidro incolor contamina
        a fundição e impede novas embalagens transparentes, desvalorizando a Cooperlírios.
      </p>
      <div className="tags-cores-vidro">
        <span className="tag-vidro incolor">Incolor (Transparente)</span>
        <span className="tag-vidro verde">Verde (Vinho / Azeite)</span>
        <span className="tag-vidro ambar">Âmbar (Cerveja / Remédio)</span>
      </div>
    </div>
  );
}

// Diferenciação essencial entre madeira maciça natural e derivados resinados
function DestaqueMadeiras({ ehMadeira }) {
  if (!ehMadeira) return null;
  return (
    <div className="painel-destaque-tecnico madeira">
      <strong>Classificação Obrigatória de Madeiras</strong>
      <p>
        <strong>Madeira Pura (Maciça, paletes, caixotes):</strong> Vai para trituração,
        compostagem e forração verde nos ecopontos da SOSU.
      </p>
      <p>
        <strong>Derivados (MDF, MDP, compensados):</strong> Contêm cola sintética e resinas;
        não servem para compostagem. Entregar desmontados e sem ferragens expostas.
      </p>
    </div>
  );
}

// Bloco de aviso para substâncias perigosas ou restrições legais
function AlertaCuidados({ texto }) {
  if (!texto) return null;
  return (
    <div className="painel-alerta-cuidados">
      <AlertTriangle size={18} className="alerta-icone" />
      <div>
        <strong>Restrições e Cuidados de Segurança:</strong>
        <p>{texto}</p>
      </div>
    </div>
  );
}

// Bloco com orientações práticas de preparo ou destino
function BlocoOrientacao({ titulo, conteudo }) {
  return (
    <div className="bloco-guia-item">
      <h4>{titulo}</h4>
      <p>{conteudo}</p>
    </div>
  );
}

// Ficha técnica com orientações detalhadas de descarte
export default function MaterialDetail({ material, orientacao }) {
  if (!material || !orientacao) return null;
  const ehVidro = material.categoria.toLowerCase().includes('vidro');
  const ehMadeira = material.categoria.toLowerCase().includes('madeira');
  return (
    <section className="ficha-material-editorial">
      <header className="ficha-topo">
        <span className="categoria-tag-retro">{material.categoria}</span>
        <h2>{material.nome}</h2>
      </header>
      <DestaqueVidroCores ehVidro={ehVidro} />
      <DestaqueMadeiras ehMadeira={ehMadeira} />
      <div className="ficha-colunas">
        <BlocoOrientacao titulo="Como Preparar" conteudo={orientacao.instrucoes_preparo} />
        <BlocoOrientacao titulo="Destino Recomendado" conteudo={orientacao.destino_recomendado} />
      </div>
      <AlertaCuidados texto={orientacao.cuidados_seguranca} />
      <footer className="ficha-rodape-norma">
        <FileText size={14} /> Base técnica e regulamentação: {orientacao.fonte}
      </footer>
    </section>
  );
}
