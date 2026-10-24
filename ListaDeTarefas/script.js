// Chave de armazenamento no LocalStorage
const STORAGE_KEY = 'meu_dia_tarefas_anos50';

// Recupera ou cria a estrutura de listas persistida
function obterEstadoInicial() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (!dados) {
    return { listaAtual: 'Meu Dia', listas: { 'Meu Dia': [] } };
  }
  try {
    const parsed = JSON.parse(dados);
    if (parsed.listas && parsed.listaAtual) return parsed;
    return { listaAtual: 'Meu Dia', listas: { 'Meu Dia': [] } };
  } catch {
    return { listaAtual: 'Meu Dia', listas: { 'Meu Dia': [] } };
  }
}

// Salva o estado atual das listas no LocalStorage
function salvarEstado(estado) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

// Retorna as tarefas pertencentes à lista selecionada
function obterTarefasDaListaAtiva(estado) {
  if (!estado.listas[estado.listaAtual]) {
    estado.listas[estado.listaAtual] = [];
  }
  return estado.listas[estado.listaAtual];
}

// Cria o checkbox de checklist com listener de alternância
function criarCheckboxTarefa(tarefa, indice) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = Boolean(tarefa.concluida);
  checkbox.addEventListener('change', () => alternarStatusTarefa(indice));
  return checkbox;
}

// Cria o botão vermelho de exclusão da tarefa
function criarBotaoExcluir(indice) {
  const botao = document.createElement('button');
  botao.textContent = 'Excluir';
  botao.className = 'btn btn-delete';
  botao.addEventListener('click', () => excluirTarefa(indice));
  return botao;
}

// Cria o item da lista contendo checkbox, texto e botão
function criarElementoTarefa(tarefa, indice) {
  const li = document.createElement('li');
  li.className = `task-item ${tarefa.concluida ? 'completed' : ''}`;

  const checkbox = criarCheckboxTarefa(tarefa, indice);
  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = tarefa.texto;
  const botaoExcluir = criarBotaoExcluir(indice);

  li.append(checkbox, span, botaoExcluir);
  return li;
}

// Renderiza todas as tarefas da lista atual na tela
function renderizarTarefas() {
  const taskList = document.getElementById('taskList');
  const estado = obterEstadoInicial();
  const tarefas = obterTarefasDaListaAtiva(estado);
  taskList.innerHTML = '';

  tarefas.forEach((tarefa, indice) => {
    const item = criarElementoTarefa(tarefa, indice);
    taskList.appendChild(item);
  });
}

// Atualiza o menu de opções com todas as listas salvas
function renderizarSeletorListas() {
  const select = document.getElementById('listSelect');
  const estado = obterEstadoInicial();
  select.innerHTML = '';

  Object.keys(estado.listas).forEach((nomeLista) => {
    const option = document.createElement('option');
    option.value = nomeLista;
    option.textContent = nomeLista;
    option.selected = nomeLista === estado.listaAtual;
    select.appendChild(option);
  });
}

// Adiciona uma nova tarefa à lista ativa
function adicionarTarefa() {
  const input = document.getElementById('taskInput');
  const texto = input.value.trim();
  if (!texto) {
    alert('Por favor, digite uma tarefa!');
    return;
  }
  const estado = obterEstadoInicial();
  obterTarefasDaListaAtiva(estado).push({ texto, concluida: false });
  salvarEstado(estado);
  input.value = '';
  input.focus();
  renderizarTarefas();
}

// Alterna o status concluído/pendente de uma tarefa
function alternarStatusTarefa(indice) {
  const estado = obterEstadoInicial();
  const tarefas = obterTarefasDaListaAtiva(estado);
  tarefas[indice].concluida = !tarefas[indice].concluida;
  salvarEstado(estado);
  renderizarTarefas();
}

// Remove uma tarefa da lista atual
function excluirTarefa(indice) {
  const estado = obterEstadoInicial();
  obterTarefasDaListaAtiva(estado).splice(indice, 1);
  salvarEstado(estado);
  renderizarTarefas();
}

// Cria e salva uma nova lista no LocalStorage
function criarNovaLista() {
  const nome = prompt('Digite o nome da nova lista:');
  if (!nome || !nome.trim()) return;
  const nomeLimpo = nome.trim();
  const estado = obterEstadoInicial();
  if (!estado.listas[nomeLimpo]) {
    estado.listas[nomeLimpo] = [];
  }
  estado.listaAtual = nomeLimpo;
  salvarEstado(estado);
  renderizarSeletorListas();
  renderizarTarefas();
}

// Altera a lista ativa ao selecionar no dropdown
function mudarListaAtiva(evento) {
  const novoNome = evento.target.value;
  const estado = obterEstadoInicial();
  estado.listaAtual = novoNome;
  salvarEstado(estado);
  renderizarTarefas();
}

// Registra todos os eventos da aplicação
function configurarEventos() {
  document.getElementById('addButton').addEventListener('click', adicionarTarefa);
  document.getElementById('newListButton').addEventListener('click', criarNovaLista);
  document.getElementById('listSelect').addEventListener('change', mudarListaAtiva);
  document.getElementById('taskInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') adicionarTarefa();
  });
}

// Inicializa a aplicação ao carregar
function inicializar() {
  configurarEventos();
  renderizarSeletorListas();
  renderizarTarefas();
}

document.addEventListener('DOMContentLoaded', inicializar);
