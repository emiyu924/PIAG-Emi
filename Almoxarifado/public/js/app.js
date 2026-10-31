const CATEGORIAS_BASE = [
  'EPI',
  'Anestésicos',
  'Instrumental',
  'Descartáveis',
  'Brocas',
  'Materiais Restauradores',
  'Cirúrgicos',
  'Curativos',
  'Radiologia',
  'Esterilização',
  'Endodontia',
  'Higiene',
];

const state = {
  materiais: [],
  movimentacoes: [],
  configuracoes: {},
  view: 'painel',
  busca: '',
  categoria: 'todas',
  status: 'todos',
  ordem: 'nome',
  buscaMov: '',
  tipoMov: 'todos',
  selecionadoId: null,
  editando: false,
  destaqueId: null,
  carregando: true,
  erro: '',
};

let versao = 0;

const $ = (sel) => document.querySelector(sel);

function esc(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function num(valor) {
  return new Intl.NumberFormat('pt-BR').format(Number(valor) || 0);
}

function formatarData(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '—';
  const [ano, mes, dia] = isoDate.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(iso) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

function classificar(material) {
  const qtd = material.quantidade;
  const min = material.quantidadeMinima;
  if (qtd <= 0) return { id: 'esgotado', grupo: 'repor', rotulo: 'Esgotado' };
  if (min > 0 && qtd <= min / 2) return { id: 'critico', grupo: 'repor', rotulo: 'Crítico' };
  if (qtd <= min) return { id: 'atencao', grupo: 'repor', rotulo: 'Atenção' };
  return { id: 'adequado', grupo: 'ok', rotulo: 'Adequado' };
}

function passaStatus(material) {
  const info = classificar(material);
  if (state.status === 'todos') return true;
  if (state.status === 'repor') return info.grupo === 'repor';
  return info.id === state.status;
}

function criticidade(material) {
  if (material.quantidade <= 0) return -1;
  if (material.quantidadeMinima <= 0) return Number.POSITIVE_INFINITY;
  return material.quantidade / material.quantidadeMinima;
}

function materiaisFiltrados() {
  const q = state.busca.trim().toLocaleLowerCase('pt-BR');
  const lista = state.materiais.filter((material) => {
    if (state.categoria !== 'todas' && material.categoria !== state.categoria) return false;
    if (!passaStatus(material)) return false;
    if (!q) return true;
    const alvo = [material.nome, material.categoria, material.fornecedor, material.localizacao, material.descricao, material.unidade]
      .join(' ')
      .toLocaleLowerCase('pt-BR');
    return alvo.includes(q);
  });
  const collator = new Intl.Collator('pt-BR');
  if (state.ordem === 'nome') lista.sort((a, b) => collator.compare(a.nome, b.nome));
  if (state.ordem === 'local') {
    lista.sort((a, b) => collator.compare(a.localizacao, b.localizacao) || collator.compare(a.nome, b.nome));
  }
  if (state.ordem === 'maior') lista.sort((a, b) => b.quantidade - a.quantidade || collator.compare(a.nome, b.nome));
  if (state.ordem === 'prioridade') {
    lista.sort((a, b) => criticidade(a) - criticidade(b) || collator.compare(a.nome, b.nome));
  }
  return lista;
}

function movimentosFiltrados() {
  const q = state.buscaMov.trim().toLocaleLowerCase('pt-BR');
  return state.movimentacoes.filter((mov) => {
    if (state.tipoMov !== 'todos' && mov.tipo !== state.tipoMov) return false;
    if (!q) return true;
    const nome = nomeDoMovimento(mov);
    return [nome, mov.motivo, mov.responsavel, mov.tipo].join(' ').toLocaleLowerCase('pt-BR').includes(q);
  });
}

function nomeDoMovimento(mov) {
  const atual = state.materiais.find((item) => item.id === mov.materialId);
  return atual ? atual.nome : mov.materialNome;
}

function categorias() {
  return [...new Set([...CATEGORIAS_BASE, ...state.materiais.map((item) => item.categoria)])].sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
}

function operador() {
  const valor = $('#operador').value.trim();
  return valor || state.configuracoes.responsavel || 'Responsável pelo Almoxarifado';
}

function textoSaldo(material) {
  const diff = material.quantidade - material.quantidadeMinima;
  if (material.quantidade <= 0) return 'Sem saldo disponível';
  if (diff > 0) return `${num(diff)} ${material.unidade} acima do mínimo`;
  if (diff === 0) return 'No limite do estoque mínimo';
  return `Abaixo do mínimo em ${num(Math.abs(diff))} ${material.unidade}`;
}

function htmlMedidor(material) {
  const info = classificar(material);
  const alvo = Math.max(material.quantidadeMinima * 2, 1);
  const pct = Math.max(0, Math.min(100, (material.quantidade / alvo) * 100));
  return `<div class="medidor" role="img" aria-label="${esc(info.rotulo)}"><i class="${info.id}" style="width:${pct}%"></i></div>`;
}

function htmlAjuste(material, comMotivo) {
  const motivo = comMotivo
    ? '<label class="largo">Motivo<input name="motivo" maxlength="160" placeholder="Compra, uso em atendimento, perda..."></label>'
    : '';
  return `
    <div class="ajuste-box">
      <form class="ajuste" data-id="${material.id}">
        ${motivo}
        <button type="button" data-tipo="saida" aria-label="Remover quantidade">−</button>
        <input name="quantidade" inputmode="numeric" value="1" aria-label="Quantidade a movimentar" required>
        <button type="button" data-tipo="entrada" aria-label="Adicionar quantidade">+</button>
      </form>
      ${comMotivo ? '<p class="meta">O número é a quantidade. − registra a saída e + registra a entrada.</p>' : ''}
    </div>`;
}

function htmlCard(material) {
  const info = classificar(material);
  const pulso = material.id === state.destaqueId ? ' pulso' : '';
  return `
    <article class="card${pulso}" data-abrir="${material.id}">
      <div class="card-topo">
        <span class="selo">${esc(material.categoria)}</span>
        <span class="selo ${info.id}">${esc(info.rotulo)}</span>
      </div>
      <h2>${esc(material.nome)}</h2>
      <p>${esc(material.descricao || 'Sem descrição')}</p>
      <div class="qtd-linha">
        <strong>${num(material.quantidade)}</strong>
        <span>${esc(material.unidade)}</span>
      </div>
      ${htmlMedidor(material)}
      <p>${esc(textoSaldo(material))} · ${esc(material.localizacao || 'Local não informado')}</p>
      <div class="acoes">${htmlAjuste(material, false)}</div>
    </article>`;
}

function htmlResultados() {
  const lista = materiaisFiltrados();
  if (!state.materiais.length) {
    return `<div class="vazio"><strong>Nenhum material cadastrado</strong><p>Inclua o primeiro item do almoxarifado.</p></div>`;
  }
  if (!lista.length) {
    return `<div class="vazio"><strong>Nada encontrado</strong><p>Ajuste a busca ou os filtros para ver outros materiais.</p></div>`;
  }
  const rotulo = lista.length === 1 ? '1 material' : `${lista.length} materiais`;
  return `<p class="contagem">${rotulo}</p><div class="grade">${lista.map(htmlCard).join('')}</div>`;
}

function resumoCategorias() {
  const mapa = new Map();
  state.materiais.forEach((material) => {
    if (!mapa.has(material.categoria)) mapa.set(material.categoria, { categoria: material.categoria, itens: 0, alertas: 0 });
    const linha = mapa.get(material.categoria);
    linha.itens += 1;
    if (classificar(material).grupo === 'repor') linha.alertas += 1;
  });
  return [...mapa.values()].sort((a, b) => a.categoria.localeCompare(b.categoria, 'pt-BR'));
}

function htmlPainel() {
  if (state.carregando) return `<div class="vazio"><strong>Carregando almoxarifado…</strong></div>`;
  if (state.erro && !state.materiais.length) {
    return `<div class="vazio"><strong>Não foi possível carregar</strong><p>${esc(state.erro)}</p><button type="button" class="btn primario" data-recarregar>Tentar de novo</button></div>`;
  }

  const total = state.materiais.length;
  const categoriasQtd = new Set(state.materiais.map((item) => item.categoria)).size;
  const repor = state.materiais.filter((item) => classificar(item).grupo === 'repor');
  const esgotados = state.materiais.filter((item) => item.quantidade <= 0).length;
  const alertas = [...repor].sort((a, b) => criticidade(a) - criticidade(b)).slice(0, 6);
  const recentes = state.movimentacoes.slice(0, 5);
  const maiorCategoria = Math.max(1, ...resumoCategorias().map((item) => item.itens));

  const blocoAlertas = alertas.length
    ? alertas
        .map((material) => {
          const info = classificar(material);
          return `
            <button type="button" class="linha-alerta" data-abrir="${material.id}">
              <strong>${esc(material.nome)}</strong>
              <span class="selo ${info.id}">${esc(info.rotulo)}</span>
              <span>${num(material.quantidade)} ${esc(material.unidade)} · mínimo ${num(material.quantidadeMinima)}</span>
              <span>${esc(material.localizacao || '')}</span>
            </button>`;
        })
        .join('')
    : `<div class="vazio"><strong>Estoque dentro do mínimo</strong><p>Nenhum material está abaixo da quantidade mínima.</p></div>`;

  const blocoRecentes = recentes.length
    ? recentes
        .map((mov) => {
          const sinal = mov.tipo === 'entrada' ? '+' : '−';
          return `
            <button type="button" class="mov" data-abrir="${mov.materialId}">
              <span class="selo ${esc(mov.tipo)}">${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span>
              <div>
                <strong>${esc(nomeDoMovimento(mov))}</strong>
                <span>${esc(mov.motivo)} · ${esc(mov.responsavel)}</span>
              </div>
              <div>
                <em>${sinal}${num(mov.quantidade)}</em>
                <span>${formatarDataHora(mov.data)}</span>
              </div>
            </button>`;
        })
        .join('')
    : `<div class="vazio"><strong>Sem movimentações</strong><p>As entradas e saídas feitas no estoque aparecem aqui.</p></div>`;

  return `
    <section class="stats">
      <button type="button" class="stat" data-ir-status="todos"><span>Itens cadastrados</span><strong>${num(total)}</strong></button>
      <div class="stat"><span>Categorias</span><strong>${num(categoriasQtd)}</strong></div>
      <button type="button" class="stat ${repor.length ? 'alerta' : ''}" data-ir-status="repor"><span>Para repor</span><strong>${num(repor.length)}</strong></button>
      <button type="button" class="stat ${esgotados ? 'alerta' : ''}" data-ir-status="esgotado"><span>Esgotados</span><strong>${num(esgotados)}</strong></button>
    </section>
    <section class="layout">
      <article class="cartao">
        <header><h2>Reposição</h2><button type="button" data-ir-status="repor">Ver estoque</button></header>
        <div class="lista-alerta">${blocoAlertas}</div>
      </article>
      <article class="cartao">
        <header><h2>Últimas movimentações</h2><button type="button" data-nav="movimentos">Ver histórico</button></header>
        <div class="lista-mov">${blocoRecentes}</div>
      </article>
    </section>
    <section class="cartao painel-baixo">
      <header><h2>Categorias</h2></header>
      <div class="categorias">
        ${resumoCategorias()
          .map((linha) => {
            const largura = Math.round((linha.itens / maiorCategoria) * 100);
            const aviso = linha.alertas ? ` · ${linha.alertas} em reposição` : '';
            return `
              <button type="button" class="categoria" data-ir-categoria="${esc(linha.categoria)}">
                <b>${esc(linha.categoria)}</b>
                <div class="trilho"><i style="width:${largura}%"></i></div>
                <small>${linha.itens} ${linha.itens === 1 ? 'item' : 'itens'}${aviso}</small>
              </button>`;
          })
          .join('')}
      </div>
    </section>
    <section class="cartao painel-baixo">
      <header><h2>Dados da clínica</h2></header>
      <form id="form-clinica" class="clinica-form">
        <label>Nome da clínica<input name="clinica" maxlength="80" required value="${esc(state.configuracoes.clinica || '')}"></label>
        <label>Responsável padrão<input name="responsavel" maxlength="80" required value="${esc(state.configuracoes.responsavel || '')}"></label>
        <div class="largo"><button type="submit" class="btn primario">Salvar dados</button></div>
      </form>
      <p class="nota">Atualizado em ${esc(formatarData(state.configuracoes.ultimaAtualizacao))}. O cadastro vive em <strong>data/materiais.json</strong>.</p>
    </section>`;
}

function htmlMovimentos() {
  const lista = movimentosFiltrados();
  if (!state.movimentacoes.length) {
    return `<div class="vazio"><strong>Nenhuma movimentação ainda</strong><p>Registre uma entrada ou saída no estoque para criar o histórico.</p></div>`;
  }
  if (!lista.length) {
    return `<div class="vazio"><strong>Nada encontrado</strong><p>Nenhuma movimentação corresponde a essa busca.</p></div>`;
  }
  return `<div class="lista-mov">${lista
    .map((mov) => {
      const sinal = mov.tipo === 'entrada' ? '+' : '−';
      return `
        <button type="button" class="mov" data-abrir="${mov.materialId}">
          <span class="selo ${esc(mov.tipo)}">${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span>
          <div>
            <strong>${esc(nomeDoMovimento(mov))}</strong>
            <span>${esc(mov.motivo)} · ${esc(mov.responsavel)} · saldo ${num(mov.saldoAnterior)} → ${num(mov.saldoAtual)}</span>
          </div>
          <div>
            <em>${sinal}${num(mov.quantidade)}</em>
            <span>${formatarDataHora(mov.data)}</span>
          </div>
        </button>`;
    })
    .join('')}</div>`;
}

function htmlDrawer(material) {
  const info = classificar(material);
  const falta = Math.max(0, material.quantidadeMinima - material.quantidade);
  const historico = state.movimentacoes.filter((mov) => mov.materialId === material.id).slice(0, 6);
  const opcoes = categorias()
    .map((cat) => `<option value="${esc(cat)}" ${cat === material.categoria ? 'selected' : ''}>${esc(cat)}</option>`)
    .join('');
  const edicao = state.editando
    ? `
      <form id="form-editar" class="grade-form bloco">
        <label class="largo">Nome<input name="nome" maxlength="80" required value="${esc(material.nome)}"></label>
        <label>Categoria<select name="categoria">${opcoes}</select></label>
        <label>Unidade<input name="unidade" maxlength="30" required value="${esc(material.unidade)}"></label>
        <label>Quantidade mínima<input name="quantidadeMinima" inputmode="numeric" required value="${esc(material.quantidadeMinima)}"></label>
        <label>Fornecedor<input name="fornecedor" maxlength="80" value="${esc(material.fornecedor || '')}"></label>
        <label class="largo">Localização<input name="localizacao" maxlength="40" value="${esc(material.localizacao || '')}"></label>
        <label class="largo">Descrição<textarea name="descricao" maxlength="240">${esc(material.descricao || '')}</textarea></label>
        <div class="largo acoes-linha">
          <button type="submit" class="btn primario">Salvar cadastro</button>
          <button type="button" class="btn fantasma" data-cancelar-edicao>Cancelar</button>
        </div>
      </form>`
    : '';

  const listaHistorico = historico.length
    ? historico
        .map(
          (mov) => `
          <div class="mini-mov">
            <strong>${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${num(mov.quantidade)} ${esc(material.unidade)}</strong>
            ${esc(mov.motivo)} · ${esc(mov.responsavel)} · ${formatarDataHora(mov.data)}
          </div>`
        )
        .join('')
    : `<p class="meta">Este item ainda não tem movimentações.</p>`;

  return `
    <div class="backdrop" data-backdrop>
      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-titulo">
        <div class="drawer-topo">
          <div>
            <span class="selo">${esc(material.categoria)}</span>
            <h2 id="drawer-titulo">${esc(material.nome)}</h2>
          </div>
          <button type="button" class="fechar" data-fechar-drawer aria-label="Fechar detalhes">×</button>
        </div>
        <p><span class="selo ${info.id}">${esc(info.rotulo)}</span></p>
        <p>${esc(material.descricao || 'Sem descrição cadastrada.')}</p>
        <p class="hero-qtd"><strong>${num(material.quantidade)}</strong><span>${esc(material.unidade)}</span></p>
        ${htmlMedidor(material)}
        <p>${esc(textoSaldo(material))}</p>
        ${htmlAjuste(material, true)}
        <div class="acoes-linha">
          ${falta > 0 ? `<button type="button" class="btn primario" data-repor="${material.id}">Repor ${num(falta)} até o mínimo</button>` : ''}
          <button type="button" class="btn fantasma" data-editar>Editar cadastro</button>
          <button type="button" class="btn perigo" data-excluir="${material.id}">Remover</button>
        </div>
        ${edicao}
        <div class="ficha">
          <div><span>Fornecedor</span><strong>${esc(material.fornecedor || '—')}</strong></div>
          <div><span>Localização</span><strong>${esc(material.localizacao || '—')}</strong></div>
          <div><span>Mínimo</span><strong>${num(material.quantidadeMinima)} ${esc(material.unidade)}</strong></div>
          <div><span>Atualizado</span><strong>${esc(formatarData(material.dataUltimaAtualizacao))}</strong></div>
        </div>
        <div class="bloco">
          <h3>Histórico deste item</h3>
          ${listaHistorico}
        </div>
      </aside>
    </div>`;
}

function htmlModalNovo() {
  const opcoes = categorias().map((cat) => `<option value="${esc(cat)}">${esc(cat)}</option>`).join('');
  const unidades = [...new Set(state.materiais.map((item) => item.unidade).filter(Boolean))];
  const locais = [...new Set(state.materiais.map((item) => item.localizacao).filter(Boolean))];
  return `
    <div class="backdrop central" data-backdrop>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div class="modal-topo">
          <h2 id="modal-titulo">Novo material</h2>
          <button type="button" class="fechar" data-fechar-modal aria-label="Fechar">×</button>
        </div>
        <form id="form-novo" class="grade-form">
          <label class="largo">Nome<input name="nome" maxlength="80" required placeholder="Ex.: Sugador descartável"></label>
          <label>Categoria
            <select name="categoria" id="novo-categoria">
              ${opcoes}
              <option value="__nova">Nova categoria...</option>
            </select>
          </label>
          <label id="campo-nova" hidden>Nova categoria<input name="categoriaNova" maxlength="40" placeholder="Nome da categoria"></label>
          <label>Quantidade inicial<input name="quantidade" inputmode="numeric" required value="0"></label>
          <label>Unidade<input name="unidade" maxlength="30" required list="lista-unidades" placeholder="unidades"></label>
          <label>Quantidade mínima<input name="quantidadeMinima" inputmode="numeric" required value="0"></label>
          <label>Fornecedor<input name="fornecedor" maxlength="80" placeholder="Fornecedor"></label>
          <label class="largo">Localização<input name="localizacao" maxlength="40" list="lista-locais" placeholder="Prateleira ou armário"></label>
          <label class="largo">Descrição<textarea name="descricao" maxlength="240" placeholder="Uso do material na clínica"></textarea></label>
          <datalist id="lista-unidades">${unidades.map((item) => `<option value="${esc(item)}"></option>`).join('')}</datalist>
          <datalist id="lista-locais">${locais.map((item) => `<option value="${esc(item)}"></option>`).join('')}</datalist>
          <div class="largo acoes-linha">
            <button type="submit" class="btn primario">Cadastrar material</button>
            <button type="button" class="btn fantasma" data-fechar-modal>Cancelar</button>
          </div>
        </form>
      </div>
    </div>`;
}

function htmlModalExcluir(material) {
  return `
    <div class="backdrop central" data-backdrop>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div class="modal-topo">
          <h2 id="modal-titulo">Remover material</h2>
          <button type="button" class="fechar" data-fechar-modal aria-label="Fechar">×</button>
        </div>
        <p>Remover <strong>${esc(material.nome)}</strong> do almoxarifado? O histórico de movimentações permanece.</p>
        <div class="acoes-linha">
          <button type="button" class="btn perigo" data-confirmar-exclusao="${material.id}">Remover</button>
          <button type="button" class="btn fantasma" data-fechar-modal>Cancelar</button>
        </div>
      </div>
    </div>`;
}

function toast(mensagem, tipo = 'ok') {
  const caixa = $('#toasts');
  caixa.replaceChildren();
  const el = document.createElement('div');
  el.className = `toast ${tipo === 'erro' ? 'erro' : 'ok'}`;
  el.setAttribute('role', 'status');
  el.textContent = mensagem;
  caixa.appendChild(el);
  setTimeout(() => {
    if (el.isConnected) el.remove();
  }, 3600);
}

async function api(url, options = {}) {
  let resposta;
  try {
    resposta = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Sem conexão com o servidor.');
  }
  const data = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(data.erro || 'Não foi possível concluir a operação.');
  return data;
}

function mensagemSucesso(tipo, material) {
  if (tipo === 'entrada') return `Entrada registrada. Saldo: ${num(material.quantidade)} ${material.unidade}.`;
  if (material.quantidade <= 0) return 'Saída registrada. O item ficou esgotado.';
  if (material.quantidade <= material.quantidadeMinima) return 'Saída registrada. O item ficou no limite ou abaixo do mínimo.';
  return `Saída registrada. Saldo: ${num(material.quantidade)} ${material.unidade}.`;
}

async function carregar() {
  const minha = ++versao;
  try {
    const data = await api('/api/estado');
    if (minha !== versao) return;
    state.materiais = data.materiais || [];
    state.movimentacoes = data.movimentacoes || [];
    state.configuracoes = data.configuracoes || {};
    state.erro = '';
    if (!state.operadorPronto) {
      state.operadorPronto = true;
      if (!$('#operador').value.trim() && state.configuracoes.responsavel) {
        $('#operador').value = state.configuracoes.responsavel;
      }
    }
    if (state.selecionadoId && !state.materiais.some((item) => item.id === state.selecionadoId)) {
      state.selecionadoId = null;
      state.editando = false;
    }
  } catch (err) {
    if (minha !== versao) return;
    state.erro = err.message;
    if (state.materiais.length) toast(err.message, 'erro');
  } finally {
    if (minha === versao) {
      state.carregando = false;
      pintar();
    }
  }
}

function pintarMenu() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    const ativo = btn.dataset.nav === state.view;
    btn.classList.toggle('ativo', ativo);
    btn.setAttribute('aria-current', ativo ? 'page' : 'false');
  });
  const titulos = {
    painel: ['Visão geral', 'Painel do almoxarifado'],
    estoque: ['Materiais', 'Estoque'],
    movimentos: ['Histórico', 'Movimentações'],
  };
  $('#eyebrow').textContent = titulos[state.view][0];
  $('#titulo').textContent = titulos[state.view][1];
  $('#filtros-estoque').hidden = state.view !== 'estoque';
  $('#filtros-mov').hidden = state.view !== 'movimentos';
  $('#top-actions').innerHTML =
    state.view === 'estoque' ? '<button type="button" class="btn primario" data-abrir-modal="novo">Novo material</button>' : '';
  $('#nome-clinica').textContent = state.configuracoes.clinica || 'Clínica Odontológica';
  document.title = `${state.configuracoes.clinica || 'Clínica Odontológica'} · Almoxarifado`;

  document.querySelectorAll('[data-status]').forEach((btn) => {
    btn.classList.toggle('ativo', btn.dataset.status === state.status);
  });
  const busca = $('#busca');
  if (busca && document.activeElement !== busca) busca.value = state.busca;
  $('#ordem').value = state.ordem;
  const buscaMov = $('#busca-mov');
  if (buscaMov && document.activeElement !== buscaMov) buscaMov.value = state.buscaMov;
  $('#tipo-mov').value = state.tipoMov;
}

function pintarChips() {
  const botoes = [`<button type="button" class="chip ${state.categoria === 'todas' ? 'ativo' : ''}" data-categoria="todas">Todas</button>`];
  const presentes = [...new Set(state.materiais.map((item) => item.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  presentes.forEach((cat) => {
    botoes.push(`<button type="button" class="chip ${state.categoria === cat ? 'ativo' : ''}" data-categoria="${esc(cat)}">${esc(cat)}</button>`);
  });
  $('#chips').innerHTML = botoes.join('');
}

function pintarConteudo() {
  const root = $('#conteudo');
  if (state.view === 'estoque') {
    if (root.dataset.view !== 'estoque') {
      root.dataset.view = 'estoque';
      root.innerHTML = '<div id="resultados"></div>';
    }
    $('#resultados').innerHTML = state.carregando ? '<div class="vazio"><strong>Carregando almoxarifado…</strong></div>' : htmlResultados();
    return;
  }
  root.dataset.view = state.view;
  root.innerHTML = state.view === 'painel' ? htmlPainel() : htmlMovimentos();
}

function pintarDrawer(focar = false) {
  const root = $('#drawer-root');
  const material = state.materiais.find((item) => item.id === state.selecionadoId);
  if (!material) {
    root.innerHTML = '';
    return;
  }
  const mesmoItem = Number(root.querySelector('.drawer .ajuste')?.dataset.id) === material.id;
  const motivo = mesmoItem ? root.querySelector('input[name="motivo"]')?.value : undefined;
  const quantidade = mesmoItem ? root.querySelector('.drawer input[name="quantidade"]')?.value : undefined;
  root.innerHTML = htmlDrawer(material);
  if (motivo != null) {
    const campo = root.querySelector('input[name="motivo"]');
    if (campo) campo.value = motivo;
  }
  if (quantidade) {
    const campo = root.querySelector('.drawer input[name="quantidade"]');
    if (campo) campo.value = quantidade;
  }
  if (focar) root.querySelector('.fechar')?.focus();
}

function pintar() {
  pintarMenu();
  pintarChips();
  pintarConteudo();
  pintarDrawer(false);
}

function irEstoque(parcial) {
  state.view = 'estoque';
  state.status = parcial.status ?? state.status;
  state.categoria = parcial.categoria ?? state.categoria;
  if (parcial.busca != null) state.busca = parcial.busca;
  pintar();
  $('#conteudo').focus();
}

function abrirDrawer(id) {
  if (!state.materiais.some((item) => item.id === id)) {
    toast('Esse material não está mais no almoxarifado.', 'erro');
    return;
  }
  if (state.selecionadoId !== id) state.editando = false;
  state.selecionadoId = id;
  pintarDrawer(true);
}

function fecharDrawer() {
  state.selecionadoId = null;
  state.editando = false;
  $('#drawer-root').innerHTML = '';
}

function abrirModalNovo() {
  $('#modal-root').innerHTML = htmlModalNovo();
  $('#modal-root').querySelector('input[name="nome"]')?.focus();
}

function abrirModalExcluir(id) {
  const material = state.materiais.find((item) => item.id === id);
  if (!material) return;
  $('#modal-root').innerHTML = htmlModalExcluir(material);
  $('#modal-root').querySelector('[data-confirmar-exclusao]')?.focus();
}

function fecharModal() {
  $('#modal-root').innerHTML = '';
}

async function ajustar(id, tipo, quantidade, motivo) {
  const data = await api(`/api/materiais/${id}/${tipo}`, {
    method: 'POST',
    body: JSON.stringify({
      quantidade: String(quantidade).trim(),
      motivo,
      responsavel: operador(),
    }),
  });
  state.destaqueId = id;
  await carregar();
  toast(mensagemSucesso(tipo, data.material));
}

function ligarEventos() {
  $('#operador').addEventListener('change', () => {
    localStorage.setItem('almox-operador', $('#operador').value.trim());
  });

  $('#busca').addEventListener('input', () => {
    state.busca = $('#busca').value;
    if (state.view === 'estoque') pintarConteudo();
  });

  $('#ordem').addEventListener('change', () => {
    state.ordem = $('#ordem').value;
    if (state.view === 'estoque') pintarConteudo();
  });

  $('#busca-mov').addEventListener('input', () => {
    state.buscaMov = $('#busca-mov').value;
    if (state.view === 'movimentos') pintarConteudo();
  });

  $('#tipo-mov').addEventListener('change', () => {
    state.tipoMov = $('#tipo-mov').value;
    if (state.view === 'movimentos') pintarConteudo();
  });

  document.addEventListener('click', async (event) => {
    const nav = event.target.closest('[data-nav]');
    if (nav) {
      state.view = nav.dataset.nav;
      pintar();
      return;
    }

    const status = event.target.closest('[data-status]');
    if (status) {
      state.status = status.dataset.status;
      pintarMenu();
      pintarConteudo();
      return;
    }

    const chip = event.target.closest('[data-categoria]');
    if (chip) {
      state.categoria = chip.dataset.categoria;
      pintarChips();
      pintarConteudo();
      return;
    }

    const irStatus = event.target.closest('[data-ir-status]');
    if (irStatus) {
      irEstoque({ status: irStatus.dataset.irStatus, categoria: 'todas', busca: '' });
      return;
    }

    const irCategoria = event.target.closest('[data-ir-categoria]');
    if (irCategoria) {
      irEstoque({ categoria: irCategoria.dataset.irCategoria, status: 'todos', busca: '' });
      return;
    }

    if (event.target.closest('[data-abrir-modal="novo"]')) {
      abrirModalNovo();
      return;
    }

    if (event.target.closest('[data-fechar-modal]')) {
      fecharModal();
      return;
    }

    if (event.target.classList.contains('backdrop')) {
      if (event.target.closest('#modal-root')) fecharModal();
      else fecharDrawer();
      return;
    }

    if (event.target.closest('[data-fechar-drawer]')) {
      fecharDrawer();
      return;
    }

    if (event.target.closest('[data-recarregar]')) {
      state.carregando = true;
      pintarConteudo();
      carregar();
      return;
    }

    const tipoBtn = event.target.closest('[data-tipo]');
    if (tipoBtn) {
      const form = tipoBtn.closest('form');
      const id = Number(form.dataset.id);
      tipoBtn.disabled = true;
      try {
        await ajustar(id, tipoBtn.dataset.tipo, form.quantidade.value, form.motivo ? form.motivo.value : '');
      } catch (err) {
        toast(err.message, 'erro');
      } finally {
        if (tipoBtn.isConnected) tipoBtn.disabled = false;
      }
      return;
    }

    const repor = event.target.closest('[data-repor]');
    if (repor) {
      const material = state.materiais.find((item) => item.id === Number(repor.dataset.repor));
      if (!material) return;
      const falta = material.quantidadeMinima - material.quantidade;
      try {
        await ajustar(material.id, 'entrada', falta, 'Reposição até o mínimo');
      } catch (err) {
        toast(err.message, 'erro');
      }
      return;
    }

    if (event.target.closest('[data-editar]')) {
      state.editando = true;
      pintarDrawer(false);
      $('#form-editar')?.querySelector('input[name="nome"]')?.focus();
      return;
    }

    if (event.target.closest('[data-cancelar-edicao]')) {
      state.editando = false;
      pintarDrawer(false);
      return;
    }

    const excluir = event.target.closest('[data-excluir]');
    if (excluir) {
      abrirModalExcluir(Number(excluir.dataset.excluir));
      return;
    }

    const confirmar = event.target.closest('[data-confirmar-exclusao]');
    if (confirmar) {
      const id = Number(confirmar.dataset.confirmarExclusao);
      confirmar.disabled = true;
      try {
        await api(`/api/materiais/${id}`, { method: 'DELETE' });
        if (state.selecionadoId === id) fecharDrawer();
        fecharModal();
        await carregar();
        toast('Material removido do almoxarifado.');
      } catch (err) {
        toast(err.message, 'erro');
        confirmar.disabled = false;
      }
      return;
    }

    const abrir = event.target.closest('[data-abrir]');
    if (abrir && !event.target.closest('form')) {
      abrirDrawer(Number(abrir.dataset.abrir));
    }
  });

  document.addEventListener('submit', async (event) => {
    if (event.target.id === 'form-novo') {
      event.preventDefault();
      const form = event.target;
      const categoria = form.categoria.value === '__nova' ? form.categoriaNova.value : form.categoria.value;
      const botao = form.querySelector('[type="submit"]');
      botao.disabled = true;
      try {
        const criado = await api('/api/materiais', {
          method: 'POST',
          body: JSON.stringify({
            nome: form.nome.value,
            categoria,
            quantidade: form.quantidade.value.trim(),
            unidade: form.unidade.value,
            quantidadeMinima: form.quantidadeMinima.value.trim(),
            descricao: form.descricao.value,
            fornecedor: form.fornecedor.value,
            localizacao: form.localizacao.value,
            responsavel: operador(),
          }),
        });
        fecharModal();
        state.view = 'estoque';
        state.busca = '';
        state.categoria = 'todas';
        state.status = 'todos';
        state.selecionadoId = criado.material.id;
        state.editando = false;
        state.destaqueId = criado.material.id;
        await carregar();
        toast('Material cadastrado.');
      } catch (err) {
        toast(err.message, 'erro');
        botao.disabled = false;
      }
      return;
    }

    if (event.target.id === 'form-editar') {
      event.preventDefault();
      const form = event.target;
      const id = state.selecionadoId;
      try {
        await api(`/api/materiais/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nome: form.nome.value,
            categoria: form.categoria.value,
            unidade: form.unidade.value,
            quantidadeMinima: form.quantidadeMinima.value.trim(),
            descricao: form.descricao.value,
            fornecedor: form.fornecedor.value,
            localizacao: form.localizacao.value,
          }),
        });
        state.editando = false;
        await carregar();
        toast('Cadastro atualizado.');
      } catch (err) {
        toast(err.message, 'erro');
      }
      return;
    }

    if (event.target.id === 'form-clinica') {
      event.preventDefault();
      const form = event.target;
      try {
        await api('/api/configuracoes', {
          method: 'PUT',
          body: JSON.stringify({
            clinica: form.clinica.value,
            responsavel: form.responsavel.value,
          }),
        });
        await carregar();
        toast('Dados da clínica salvos.');
      } catch (err) {
        toast(err.message, 'erro');
      }
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'novo-categoria') {
      const nova = event.target.value === '__nova';
      $('#campo-nova').hidden = !nova;
      if (nova) event.target.form.categoriaNova.focus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if ($('#modal-root').innerHTML) fecharModal();
      else if (state.selecionadoId) fecharDrawer();
    }
    if (event.key === '/' && state.view === 'estoque' && !event.target.closest('input, textarea, select')) {
      event.preventDefault();
      $('#busca').focus();
    }
  });

  document.addEventListener('focusin', (event) => {
    if (event.target.name === 'quantidade') event.target.select();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const salvo = localStorage.getItem('almox-operador');
  if (salvo) $('#operador').value = salvo;
  ligarEventos();
  carregar();
});
