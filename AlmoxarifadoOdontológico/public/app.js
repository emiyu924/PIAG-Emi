// ============================================
// API
// ============================================
const API = {
  base: 'http://localhost:3000/api',

  async get(endpoint) {
    const res = await fetch(`${this.base}${endpoint}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(endpoint, dados) {
    const res = await fetch(`${this.base}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao criar');
    }
    return res.json();
  },

  async put(endpoint, dados) {
    const res = await fetch(`${this.base}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao atualizar');
    }
    return res.json();
  },

  async patch(endpoint, dados) {
    const res = await fetch(`${this.base}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao ajustar');
    }
    return res.json();
  },

  async delete(endpoint) {
    const res = await fetch(`${this.base}${endpoint}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao remover');
    }
    return res.json();
  }
};

// ============================================
// TOAST
// ============================================
function showToast(msg, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `<span class="toast-icon">${icons[tipo] || '•'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 280);
  }, 3000);
}

// ============================================
// CONFIRM DIALOG
// ============================================
function showConfirm(mensagem) {
  return new Promise(resolve => {
    const modal = document.getElementById('modal-confirm');
    document.getElementById('confirm-message').textContent = mensagem;
    modal.classList.add('open');

    const ok = document.getElementById('btn-confirm-ok');
    const cancel = document.getElementById('btn-confirm-cancel');

    // Remove listeners antigos
    const okClone = ok.cloneNode(true);
    const cancelClone = cancel.cloneNode(true);
    ok.parentNode.replaceChild(okClone, ok);
    cancel.parentNode.replaceChild(cancelClone, cancel);

    okClone.addEventListener('click', () => {
      modal.classList.remove('open');
      resolve(true);
    });
    cancelClone.addEventListener('click', () => {
      modal.classList.remove('open');
      resolve(false);
    });
  });
}

// ============================================
// NAVEGAÇÃO
// ============================================
const paginas = {
  dashboard: { title: 'Dashboard', el: 'page-dashboard' },
  materiais: { title: 'Materiais', el: 'page-materiais' },
  movimentacoes: { title: 'Movimentações', el: 'page-movimentacoes' },
  'estoque-baixo': { title: 'Estoque Baixo', el: 'page-estoque-baixo' }
};

let paginaAtual = 'dashboard';

function navegarPara(pagina) {
  // Esconde todas as páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Ativa a página alvo
  const config = paginas[pagina];
  if (!config) return;

  document.getElementById(config.el).classList.add('active');
  document.querySelector(`[data-page="${pagina}"]`).classList.add('active');
  document.getElementById('page-title').textContent = config.title;

  paginaAtual = pagina;

  // Carrega dados
  if (pagina === 'dashboard') carregarDashboard();
  if (pagina === 'materiais') carregarMateriais();
  if (pagina === 'movimentacoes') carregarMovimentacoes();
  if (pagina === 'estoque-baixo') carregarEstoqueBaixo();

  // Fecha sidebar no mobile
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ============================================
// DASHBOARD
// ============================================
async function carregarDashboard() {
  try {
    const [stats, movs] = await Promise.all([
      API.get('/dashboard'),
      API.get('/movimentacoes')
    ]);

    document.getElementById('stat-total-materiais').textContent = stats.totalMateriais;
    document.getElementById('stat-total-itens').textContent = stats.totalItens.toLocaleString('pt-BR');
    document.getElementById('stat-estoque-baixo').textContent = stats.estoqueBaixo;
    document.getElementById('stat-categorias').textContent = stats.categorias;

    // Badge
    const badge = document.getElementById('badge-estoque-baixo');
    badge.textContent = stats.estoqueBaixo;
    badge.style.display = stats.estoqueBaixo > 0 ? '' : 'none';

    document.getElementById('badge-alertas').textContent = stats.estoqueBaixo;

    // Alertas
    const alertList = document.getElementById('alert-list');
    if (stats.materiaisEstoqueBaixo.length === 0) {
      alertList.innerHTML = '<div class="empty-state">✅ Todos os materiais estão ok!</div>';
    } else {
      alertList.innerHTML = stats.materiaisEstoqueBaixo.map(m => {
        const zerado = m.quantidade === 0;
        const pct = m.quantidadeMinima > 0
          ? Math.round((m.quantidade / m.quantidadeMinima) * 100) : 0;
        return `
          <div class="alert-item">
            <div class="alert-item-left">
              <div class="alert-dot ${zerado ? '' : 'warning'}"></div>
              <div>
                <div class="alert-name">${m.nome}</div>
                <div class="alert-qty">${m.quantidade} / mín. ${m.quantidadeMinima}</div>
              </div>
            </div>
            <span class="alert-badge ${zerado ? '' : 'warning'}">
              ${zerado ? 'Zerado' : `${pct}%`}
            </span>
          </div>`;
      }).join('');
    }

    // Últimas movimentações
    const movList = document.getElementById('dashboard-movement-list');
    if (movs.length === 0) {
      movList.innerHTML = '<div class="empty-state">Nenhuma movimentação registrada</div>';
    } else {
      movList.innerHTML = movs.slice(0, 8).map(m => `
        <div class="movement-item">
          <div class="movement-icon ${m.operacao === 'adicionar' ? 'add' : 'remove'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              ${m.operacao === 'adicionar'
                ? '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
                : '<line x1="5" y1="12" x2="19" y2="12"/>'}
            </svg>
          </div>
          <div class="movement-info">
            <div class="movement-name">${m.materialNome}</div>
            <div class="movement-detail">${formatarData(m.data)}${m.motivo ? ' · ' + m.motivo : ''}</div>
          </div>
          <span class="movement-qty ${m.operacao === 'adicionar' ? 'add' : 'remove'}">
            ${m.operacao === 'adicionar' ? '+' : '−'}${m.valor}
          </span>
        </div>`).join('');
    }
  } catch (e) {
    showToast('Erro ao carregar dashboard', 'error');
  }
}

// ============================================
// MATERIAIS
// ============================================
let todosOsMateriais = [];
let categoriasDisponiveis = [];

async function carregarMateriais(params = {}) {
  const grid = document.getElementById('materiais-grid');
  grid.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <span>Carregando materiais...</span>
    </div>`;

  try {
    const busca = document.getElementById('input-busca').value;
    const categoria = document.getElementById('select-categoria').value;

    let query = '?';
    if (busca) query += `busca=${encodeURIComponent(busca)}&`;
    if (categoria && categoria !== 'todas') query += `categoria=${encodeURIComponent(categoria)}&`;

    const materiais = await API.get('/materiais' + query);
    todosOsMateriais = materiais;

    // Atualiza datalist de categorias no form
    await carregarCategorias();

    renderizarMateriais(materiais);
  } catch (e) {
    grid.innerHTML = `<div class="loading-state" style="color:var(--vermelho)">Erro ao carregar materiais</div>`;
  }
}

async function carregarCategorias() {
  try {
    const cats = await API.get('/categorias');
    categoriasDisponiveis = cats;

    const select = document.getElementById('select-categoria');
    const valorAtual = select.value;
    select.innerHTML = '<option value="todas">Todas as categorias</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      if (c === valorAtual) opt.selected = true;
      select.appendChild(opt);
    });

    const datalist = document.getElementById('lista-categorias');
    if (datalist) {
      datalist.innerHTML = cats.map(c => `<option value="${c}">`).join('');
    }
  } catch (e) {}
}

function renderizarMateriais(materiais) {
  const grid = document.getElementById('materiais-grid');

  if (materiais.length === 0) {
    grid.innerHTML = `
      <div class="loading-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;stroke:var(--cinza-300)">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        <span>Nenhum material encontrado</span>
      </div>`;
    return;
  }

  grid.innerHTML = materiais.map(m => criarCardMaterial(m)).join('');
}

function criarCardMaterial(m) {
  const pctEstoque = m.quantidadeMinima > 0
    ? Math.min(100, Math.round((m.quantidade / (m.quantidadeMinima * 3)) * 100))
    : 100;

  const nivelEstoque = m.quantidade === 0
    ? 'danger'
    : m.quantidade <= m.quantidadeMinima
      ? 'warning'
      : 'ok';

  const alertaBadge = nivelEstoque === 'danger'
    ? '<span class="badge badge-danger">Zerado</span>'
    : nivelEstoque === 'warning'
      ? '<span class="badge badge-warning">Crítico</span>'
      : '';

  return `
    <div class="material-card ${nivelEstoque !== 'ok' ? 'estoque-critico' : ''}" data-id="${m.id}">
      <div class="material-card-header">
        <div class="material-card-info">
          <div class="material-card-nome">${m.nome}</div>
          <span class="material-card-categoria">${m.categoria}</span>
          ${alertaBadge}
        </div>
        <div class="material-card-actions">
          <button class="btn-icon btn-view" title="Ver detalhes" onclick="abrirDetalhes(${m.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="btn-icon btn-edit" title="Editar" onclick="abrirEditarMaterial(${m.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon btn-delete" title="Excluir" onclick="excluirMaterial(${m.id}, '${m.nome.replace(/'/g, "\\'")}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="material-card-body">
        <div class="material-qty-display">
          <div class="qty-main">
            <span class="qty-number">${m.quantidade.toLocaleString('pt-BR')}</span>
            <span class="qty-unit">${m.unidade}</span>
          </div>
          <div class="qty-controls">
            <button class="qty-ctrl-btn remove" onclick="abrirAjusteRapido(${m.id}, 'remover')" title="Remover">−</button>
            <button class="qty-ctrl-btn add" onclick="abrirAjusteRapido(${m.id}, 'adicionar')" title="Adicionar">+</button>
          </div>
        </div>

        <div class="material-progress">
          <div class="progress-labels">
            <span>Estoque</span>
            <span>Mín: ${m.quantidadeMinima} ${m.unidade}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${nivelEstoque === 'warning' ? 'warning' : nivelEstoque === 'danger' ? 'danger' : ''}"
              style="width: ${pctEstoque}%"></div>
          </div>
        </div>

        <div class="material-meta">
          ${m.fornecedor ? `<span>🏭 ${m.fornecedor}</span>` : ''}
          ${m.localizacao ? `<span>📍 ${m.localizacao}</span>` : ''}
        </div>
      </div>
    </div>`;
}

// ============================================
// MODAL: NOVO / EDITAR MATERIAL
// ============================================
function abrirNovoMaterial() {
  document.getElementById('modal-material-title').textContent = 'Novo Material';
  document.getElementById('form-material').reset();
  document.getElementById('material-id').value = '';
  document.getElementById('modal-material').classList.add('open');
}

async function abrirEditarMaterial(id) {
  try {
    const m = await API.get(`/materiais/${id}`);
    document.getElementById('modal-material-title').textContent = 'Editar Material';
    document.getElementById('material-id').value = m.id;
    document.getElementById('material-nome').value = m.nome;
    document.getElementById('material-categoria').value = m.categoria;
    document.getElementById('material-quantidade').value = m.quantidade;
    document.getElementById('material-unidade').value = m.unidade;
    document.getElementById('material-qtdMinima').value = m.quantidadeMinima;
    document.getElementById('material-fornecedor').value = m.fornecedor;
    document.getElementById('material-localizacao').value = m.localizacao;
    document.getElementById('material-descricao').value = m.descricao;
    document.getElementById('modal-material').classList.add('open');
  } catch (e) {
    showToast('Erro ao carregar material', 'error');
  }
}

function fecharModalMaterial() {
  document.getElementById('modal-material').classList.remove('open');
}

async function salvarMaterial(e) {
  e.preventDefault();
  const id = document.getElementById('material-id').value;
  const dados = {
    nome: document.getElementById('material-nome').value.trim(),
    categoria: document.getElementById('material-categoria').value.trim(),
    quantidade: parseInt(document.getElementById('material-quantidade').value),
    unidade: document.getElementById('material-unidade').value.trim(),
    quantidadeMinima: parseInt(document.getElementById('material-qtdMinima').value) || 0,
    fornecedor: document.getElementById('material-fornecedor').value.trim(),
    localizacao: document.getElementById('material-localizacao').value.trim(),
    descricao: document.getElementById('material-descricao').value.trim()
  };

  try {
    if (id) {
      await API.put(`/materiais/${id}`, dados);
      showToast('Material atualizado com sucesso!');
    } else {
      await API.post('/materiais', dados);
      showToast('Material cadastrado com sucesso!');
    }
    fecharModalMaterial();
    carregarMateriais();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ============================================
// EXCLUSÃO
// ============================================
async function excluirMaterial(id, nome) {
  const ok = await showConfirm(`Deseja excluir "${nome}"? Esta ação não pode ser desfeita.`);
  if (!ok) return;
  try {
    await API.delete(`/materiais/${id}`);
    showToast('Material excluído com sucesso!');
    carregarMateriais();
    if (paginaAtual === 'dashboard') carregarDashboard();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ============================================
// MODAL: AJUSTE DE QUANTIDADE
// ============================================
let operacaoAtual = 'adicionar';

function abrirAjusteRapido(id, operacao = 'adicionar') {
  const m = todosOsMateriais.find(x => x.id === id);
  if (!m) return;

  document.getElementById('qtd-material-id').value = id;
  document.getElementById('qtd-valor').value = 1;
  document.getElementById('qtd-motivo').value = '';

  document.getElementById('material-info-box').innerHTML = `
    <div class="mat-name">${m.nome}</div>
    <div class="mat-qty">Estoque atual: <strong>${m.quantidade} ${m.unidade}</strong></div>`;

  document.getElementById('modal-qtd-title').textContent = 'Ajustar Quantidade';
  document.getElementById('modal-quantidade').classList.add('open');

  // Define aba
  setOperacao(operacao);
}

function setOperacao(op) {
  operacaoAtual = op;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.op === op);
  });

  const btn = document.getElementById('btn-confirmar-qtd');
  btn.textContent = op === 'adicionar' ? 'Adicionar' : 'Remover';
  btn.style.background = op === 'adicionar' ? 'var(--verde)' : 'var(--vermelho)';
}

async function confirmarAjusteQuantidade() {
  const id = document.getElementById('qtd-material-id').value;
  const valor = parseInt(document.getElementById('qtd-valor').value);
  const motivo = document.getElementById('qtd-motivo').value.trim();

  if (!valor || valor <= 0) {
    showToast('Informe uma quantidade válida', 'warning');
    return;
  }

  try {
    await API.patch(`/materiais/${id}/quantidade`, {
      operacao: operacaoAtual,
      valor,
      motivo
    });

    const acao = operacaoAtual === 'adicionar' ? 'adicionados' : 'removidos';
    showToast(`${valor} ${acao} com sucesso!`);
    document.getElementById('modal-quantidade').classList.remove('open');
    carregarMateriais();
    if (paginaAtual === 'dashboard') carregarDashboard();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ============================================
// MODAL: DETALHES
// ============================================
async function abrirDetalhes(id) {
  try {
    const m = await API.get(`/materiais/${id}`);
    document.getElementById('modal-detalhes-title').textContent = m.nome;

    const nivelEstoque = m.quantidade === 0 ? 'danger'
      : m.quantidade <= m.quantidadeMinima ? 'warning' : 'ok';

    const statusTexto = nivelEstoque === 'danger' ? '🔴 Zerado'
      : nivelEstoque === 'warning' ? '🟡 Crítico' : '🟢 OK';

    document.getElementById('modal-detalhes-body').innerHTML = `
      <div class="detail-qty-hero">
        <div class="qty-big">${m.quantidade.toLocaleString('pt-BR')}</div>
        <div class="qty-label">${m.unidade} em estoque • ${statusTexto}</div>
      </div>
      <div class="detail-grid">
        <div class="detail-item">
          <label>Categoria</label>
          <span>${m.categoria}</span>
        </div>
        <div class="detail-item">
          <label>Qtd. Mínima</label>
          <span>${m.quantidadeMinima} ${m.unidade}</span>
        </div>
        <div class="detail-item">
          <label>Fornecedor</label>
          <span>${m.fornecedor || '—'}</span>
        </div>
        <div class="detail-item">
          <label>Localização</label>
          <span>${m.localizacao || '—'}</span>
        </div>
        <div class="detail-item">
          <label>Última Atualização</label>
          <span>${m.dataUltimaAtualizacao || '—'}</span>
        </div>
        <div class="detail-item">
          <label>ID</label>
          <span>#${m.id}</span>
        </div>
      </div>
      ${m.descricao ? `
        <div class="detail-item" style="margin-bottom:20px">
          <label>Descrição</label>
          <span style="display:block;margin-top:4px;line-height:1.5;color:var(--cinza-700)">${m.descricao}</span>
        </div>` : ''}
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="abrirAjusteRapido(${m.id},'adicionar');document.getElementById('modal-detalhes').classList.remove('open')">
          + Adicionar
        </button>
        <button class="btn btn-danger" onclick="abrirAjusteRapido(${m.id},'remover');document.getElementById('modal-detalhes').classList.remove('open')">
          − Remover
        </button>
        <button class="btn btn-outline" onclick="abrirEditarMaterial(${m.id});document.getElementById('modal-detalhes').classList.remove('open')">
          ✏ Editar
        </button>
      </div>`;

    document.getElementById('modal-detalhes').classList.add('open');
  } catch (e) {
    showToast('Erro ao carregar detalhes', 'error');
  }
}

// ============================================
// MOVIMENTAÇÕES
// ============================================
async function carregarMovimentacoes() {
  try {
    const movs = await API.get('/movimentacoes');
    const tbody = document.getElementById('tbody-movimentacoes');

    if (movs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhuma movimentação registrada</td></tr>';
      return;
    }

    tbody.innerHTML = movs.map(m => `
      <tr>
        <td><strong>${m.materialNome}</strong></td>
        <td>
          <span class="badge ${m.operacao === 'adicionar' ? 'badge-add' : 'badge-remove'}">
            ${m.operacao === 'adicionar' ? '↑ Entrada' : '↓ Saída'}
          </span>
        </td>
        <td><strong>${m.valor}</strong></td>
        <td>${m.quantidadeAntes}</td>
        <td><strong>${m.quantidadeDepois}</strong></td>
        <td>${m.motivo || '—'}</td>
        <td>${formatarData(m.data)}</td>
      </tr>`).join('');
  } catch (e) {
    showToast('Erro ao carregar movimentações', 'error');
  }
}

// ============================================
// ESTOQUE BAIXO
// ============================================
async function carregarEstoqueBaixo() {
  try {
    const stats = await API.get('/dashboard');
    const tbody = document.getElementById('tbody-estoque-baixo');

    if (stats.materiaisEstoqueBaixo.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">✅ Nenhum material com estoque crítico!</td></tr>';
      return;
    }

    const todos = await API.get('/materiais');
    const criticos = todos.filter(m => m.quantidade <= m.quantidadeMinima);

    tbody.innerHTML = criticos.map(m => {
      const zerado = m.quantidade === 0;
      const pct = m.quantidadeMinima > 0
        ? Math.round((m.quantidade / m.quantidadeMinima) * 100) : 0;
      return `
        <tr>
          <td><strong>${m.nome}</strong><br><small style="color:var(--cinza-500)">${m.descricao}</small></td>
          <td>${m.categoria}</td>
          <td><strong>${m.quantidade}</strong> ${m.unidade}</td>
          <td>${m.quantidadeMinima} ${m.unidade}</td>
          <td>
            <span class="badge ${zerado ? 'badge-danger' : 'badge-warning'}">
              ${zerado ? 'Zerado' : `${pct}% do mínimo`}
            </span>
          </td>
          <td>
            <button class="btn btn-primary" style="padding:6px 12px;font-size:12px"
              onclick="navegarPara('materiais');setTimeout(()=>abrirAjusteRapido(${m.id},'adicionar'),500)">
              + Repor
            </button>
          </td>
        </tr>`;
    }).join('');
  } catch (e) {
    showToast('Erro ao carregar estoque crítico', 'error');
  }
}

// ============================================
// UTILITÁRIOS
// ============================================
function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function atualizarData() {
  const el = document.getElementById('current-date');
  const agora = new Date();
  el.textContent = agora.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Data
  atualizarData();

  // Sidebar overlay (mobile)
  const overlayEl = document.createElement('div');
  overlayEl.id = 'sidebar-overlay';
  overlayEl.className = 'sidebar-overlay';
  document.body.appendChild(overlayEl);

  overlayEl.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    overlayEl.classList.remove('open');
  });

  // Menu toggle
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    overlayEl.classList.toggle('open');
  });

  // Navegação
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navegarPara(item.dataset.page);
    });
  });

  // Botão novo material
  document.getElementById('btn-novo-material').addEventListener('click', abrirNovoMaterial);

  // Form material
  document.getElementById('form-material').addEventListener('submit', salvarMaterial);
  document.getElementById('modal-material-close').addEventListener('click', fecharModalMaterial);
  document.getElementById('btn-cancelar-material').addEventListener('click', fecharModalMaterial);

  // Modal quantidade
  document.getElementById('modal-quantidade-close').addEventListener('click', () => {
    document.getElementById('modal-quantidade').classList.remove('open');
  });
  document.getElementById('btn-cancelar-qtd').addEventListener('click', () => {
    document.getElementById('modal-quantidade').classList.remove('open');
  });
  document.getElementById('btn-confirmar-qtd').addEventListener('click', confirmarAjusteQuantidade);

  // Tabs de operação
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setOperacao(btn.dataset.op));
  });

  // Controles de quantidade
  document.getElementById('btn-increment').addEventListener('click', () => {
    const input = document.getElementById('qtd-valor');
    input.value = parseInt(input.value || 0) + 1;
  });
  document.getElementById('btn-decrement').addEventListener('click', () => {
    const input = document.getElementById('qtd-valor');
    const v = parseInt(input.value || 1);
    if (v > 1) input.value = v - 1;
  });

  // Modal detalhes
  document.getElementById('modal-detalhes-close').addEventListener('click', () => {
    document.getElementById('modal-detalhes').classList.remove('open');
  });

  // Fechar modais ao clicar fora
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Filtros
  let buscaTimer;
  document.getElementById('input-busca').addEventListener('input', () => {
    clearTimeout(buscaTimer);
    buscaTimer = setTimeout(carregarMateriais, 350);
  });

  document.getElementById('select-categoria').addEventListener('change', carregarMateriais);

  document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
    document.getElementById('input-busca').value = '';
    document.getElementById('select-categoria').value = 'todas';
    carregarMateriais();
  });

  // Carrega página inicial
  navegarPara('dashboard');
  carregarCategorias();
});

