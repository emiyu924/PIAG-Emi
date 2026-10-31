/**
 * app.js — Biblioteca Digital
 * Lógica de consumo da API, renderização e eventos.
 * Padrão: ES6+ Modules, async/await, Fetch API
 */

// =====================================================
// CONFIGURAÇÃO E ESTADO GLOBAL
// =====================================================

/** URL base do json-server */
const API_BASE = 'http://localhost:3000';

/**
 * Estado da aplicação — centraliza dados em memória
 * para evitar requisições redundantes.
 */
const state = {
  books: [],          // Lista completa de livros
  filteredBooks: [],  // Lista após aplicar filtros
  reservations: [],   // Lista de reservas
  activeBookId: null, // ID do livro com modal aberto
};

// =====================================================
// SELETORES DE ELEMENTOS (DOM)
// =====================================================

const el = {
  // Navegação
  btnTabCatalog:      document.getElementById('btn-tab-catalog'),
  btnTabReservations: document.getElementById('btn-tab-reservations'),
  sectionCatalog:     document.getElementById('section-catalog'),
  sectionReservations:document.getElementById('section-reservations'),
  reservationsBadge:  document.getElementById('reservations-badge'),

  // Filtros
  inputSearch:        document.getElementById('input-search'),
  selectGenre:        document.getElementById('select-genre'),

  // Grid de livros
  booksGrid:          document.getElementById('books-grid'),

  // Estados de feedback do catálogo
  catalogLoading:     document.getElementById('catalog-loading'),
  catalogError:       document.getElementById('catalog-error'),
  catalogErrorMsg:    document.getElementById('catalog-error-msg'),
  catalogEmpty:       document.getElementById('catalog-empty'),
  btnRetry:           document.getElementById('btn-retry'),

  // Modal de detalhes
  modalDetails:       document.getElementById('modal-details'),
  modalOverlay:       document.getElementById('modal-overlay'),
  btnModalClose:      document.getElementById('btn-modal-close'),
  modalCover:         document.getElementById('modal-book-cover'),
  modalTitle:         document.getElementById('modal-book-title'),
  modalAuthor:        document.getElementById('modal-book-author'),
  modalGenre:         document.getElementById('modal-book-genre'),
  modalYear:          document.getElementById('modal-book-year'),
  modalCopiesText:    document.getElementById('modal-copies-text'),
  modalSynopsis:      document.getElementById('modal-book-synopsis'),
  btnReserve:         document.getElementById('btn-reserve'),

  // Modal de formulário de reserva
  modalReserve:       document.getElementById('modal-reserve'),
  reserveOverlay:     document.getElementById('reserve-overlay'),
  btnReserveClose:    document.getElementById('btn-reserve-close'),
  btnCancelReserve:   document.getElementById('btn-cancel-reserve'),
  reserveModalBook:   document.getElementById('reserve-modal-book'),
  formReserve:        document.getElementById('form-reserve'),
  inputName:          document.getElementById('input-name'),
  inputEmail:         document.getElementById('input-email'),
  errorName:          document.getElementById('error-name'),
  errorEmail:         document.getElementById('error-email'),
  btnSubmitReserve:   document.getElementById('btn-submit-reserve'),
  btnSubmitText:      document.getElementById('btn-submit-text'),
  btnSubmitSpinner:   document.getElementById('btn-submit-spinner'),

  // Seção de reservas
  reservationsLoading:document.getElementById('reservations-loading'),
  reservationsEmpty:  document.getElementById('reservations-empty'),
  reservationsList:   document.getElementById('reservations-list'),
  btnGoCatalog:       document.getElementById('btn-go-catalog'),

  // Toasts
  toastContainer:     document.getElementById('toast-container'),
};

// =====================================================
// CAMADA DE API (Fetch)
// =====================================================

/**
 * Busca todos os livros do servidor.
 * @returns {Promise<Array>} Lista de livros
 */
async function fetchBooks() {
  const response = await fetch(`${API_BASE}/books`);
  if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao buscar livros`);
  return response.json();
}

/**
 * Busca todas as reservas do servidor.
 * @returns {Promise<Array>} Lista de reservas
 */
async function fetchReservations() {
  const response = await fetch(`${API_BASE}/reservations`);
  if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao buscar reservas`);
  return response.json();
}

/**
 * Cria uma nova reserva via POST.
 * @param {Object} reservation - Dados da reserva
 * @returns {Promise<Object>} Reserva criada
 */
async function postReservation(reservation) {
  const response = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservation),
  });
  if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao criar reserva`);
  return response.json();
}

/**
 * Atualiza a quantidade de cópias disponíveis via PATCH.
 * @param {number|string} bookId - ID do livro
 * @param {number} availableCopies - Nova quantidade de cópias disponíveis
 * @returns {Promise<Object>} Livro atualizado
 */
async function patchBookCopies(bookId, availableCopies) {
  const response = await fetch(`${API_BASE}/books/${bookId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availableCopies }),
  });
  if (!response.ok) throw new Error(`Erro ${response.status}: Falha ao atualizar livro`);
  return response.json();
}

// =====================================================
// RENDERIZAÇÃO: CATÁLOGO
// =====================================================

/**
 * Carrega o catálogo de livros da API e inicia a renderização.
 * Gerencia os estados: loading, error e sucesso.
 */
async function loadCatalog() {
  setLoadingState(true);
  setErrorState(false);

  try {
    state.books = await fetchBooks();
    state.filteredBooks = [...state.books];
    populateGenreFilter(state.books);
    renderBooks(state.filteredBooks);
  } catch (error) {
    setErrorState(true, error.message);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Renderiza os cards de livros no grid.
 * @param {Array} books - Lista de livros a exibir
 */
function renderBooks(books) {
  el.booksGrid.innerHTML = '';
  el.catalogEmpty.classList.toggle('hidden', books.length > 0);

  books.forEach((book) => {
    const card = createBookCard(book);
    el.booksGrid.appendChild(card);
  });
}

/**
 * Cria o elemento HTML de um card de livro.
 * @param {Object} book - Dados do livro
 * @returns {HTMLElement} Card do livro
 */
function createBookCard(book) {
  const isAvailable = book.availableCopies > 0;

  const card = document.createElement('article');
  card.className = 'book-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${book.title} de ${book.author}`);

  card.innerHTML = `
    <div class="book-card__cover-wrapper">
      <img
        class="book-card__cover"
        src="${book.coverUrl}"
        alt="Capa do livro ${book.title}"
        loading="lazy"
        onerror="this.src='https://placehold.co/300x450/e2e8f0/94a3b8?text=Sem+Capa'"
      />
      <span class="availability-badge ${isAvailable ? 'availability-badge--available' : 'availability-badge--unavailable'}">
        ${isAvailable ? 'Disponível' : 'Esgotado'}
      </span>
    </div>
    <div class="book-card__body">
      <span class="book-card__genre">${book.genre}</span>
      <h3 class="book-card__title">${book.title}</h3>
      <p class="book-card__author">${book.author}</p>
    </div>
  `;

  // Abre o modal ao clicar ou pressionar Enter/Espaço
  card.addEventListener('click', () => openDetailsModal(book.id));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetailsModal(book.id);
    }
  });

  return card;
}

// =====================================================
// FILTROS
// =====================================================

/**
 * Popula o select de gêneros com os valores únicos do catálogo.
 * @param {Array} books - Lista de livros
 */
function populateGenreFilter(books) {
  const genres = [...new Set(books.map((b) => b.genre))].sort();

  // Mantém a opção padrão e adiciona os gêneros
  el.selectGenre.innerHTML = '<option value="">Todos os gêneros</option>';
  genres.forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    el.selectGenre.appendChild(option);
  });
}

/**
 * Aplica os filtros de busca e gênero sobre `state.books`.
 * Atualiza `state.filteredBooks` e re-renderiza o grid.
 */
function applyFilters() {
  const query  = el.inputSearch.value.trim().toLowerCase();
  const genre  = el.selectGenre.value;

  state.filteredBooks = state.books.filter((book) => {
    const matchesQuery = !query
      || book.title.toLowerCase().includes(query)
      || book.author.toLowerCase().includes(query);

    const matchesGenre = !genre || book.genre === genre;

    return matchesQuery && matchesGenre;
  });

  renderBooks(state.filteredBooks);
}

// =====================================================
// MODAL: DETALHES DO LIVRO
// =====================================================

/**
 * Abre o modal de detalhes preenchendo as informações do livro.
 * @param {number|string} bookId - ID do livro
 */
function openDetailsModal(bookId) {
  const book = state.books.find((b) => b.id === bookId);
  if (!book) return;

  state.activeBookId = book.id;
  const isAvailable = book.availableCopies > 0;

  // Preenche os campos do modal
  el.modalCover.src     = book.coverUrl;
  el.modalCover.alt     = `Capa do livro ${book.title}`;
  el.modalTitle.textContent    = book.title;
  el.modalAuthor.textContent   = `por ${book.author}`;
  el.modalGenre.textContent    = book.genre;
  el.modalYear.textContent     = book.year;
  el.modalSynopsis.textContent = book.synopsis;
  el.modalCopiesText.textContent =
    `${book.availableCopies} de ${book.totalCopies} cópias disponíveis`;

  // Configura o botão de reserva
  el.btnReserve.dataset.bookId = book.id;
  el.btnReserve.disabled       = !isAvailable;
  el.btnReserve.textContent    = isAvailable ? 'Solicitar Reserva' : 'Indisponível';

  el.modalDetails.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

/**
 * Fecha o modal de detalhes do livro.
 */
function closeDetailsModal() {
  el.modalDetails.classList.remove('is-open');
  document.body.style.overflow = '';
  state.activeBookId = null;
}

// =====================================================
// MODAL: FORMULÁRIO DE RESERVA
// =====================================================

/**
 * Abre o modal de formulário de reserva para o livro ativo.
 * Salva o bookId antes de fechar o modal de detalhes,
 * pois closeDetailsModal() zera o state.activeBookId.
 */
function openReserveModal() {
  const book = state.books.find((b) => b.id === state.activeBookId);
  if (!book) return;

  // Preserva o ID antes de closeDetailsModal() zerá-lo
  const bookId = book.id;

  el.reserveModalBook.textContent = `"${book.title}"`;
  clearFormErrors();
  el.formReserve.reset();

  closeDetailsModal();

  // Restaura o livro ativo para o formulário poder encontrá-lo
  state.activeBookId = bookId;

  el.modalReserve.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  el.inputName.focus();
}

/**
 * Fecha o modal de formulário de reserva.
 */
function closeReserveModal() {
  el.modalReserve.classList.remove('is-open');
  document.body.style.overflow = '';
}

// =====================================================
// VALIDAÇÃO DO FORMULÁRIO
// =====================================================

/**
 * Valida os campos do formulário de reserva.
 * @returns {boolean} true se todos os campos são válidos
 */
function validateReserveForm() {
  let isValid = true;
  clearFormErrors();

  const name  = el.inputName.value.trim();
  const email = el.inputEmail.value.trim();

  if (!name || name.length < 3) {
    showFieldError(el.inputName, el.errorName, 'Informe seu nome completo (mínimo 3 caracteres).');
    isValid = false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError(el.inputEmail, el.errorEmail, 'Informe um e-mail válido.');
    isValid = false;
  }

  return isValid;
}

/**
 * Exibe mensagem de erro em um campo específico.
 * @param {HTMLElement} input - Campo com erro
 * @param {HTMLElement} errorEl - Elemento de mensagem de erro
 * @param {string} message - Mensagem a exibir
 */
function showFieldError(input, errorEl, message) {
  input.classList.add('is-error');
  errorEl.textContent = message;
}

/**
 * Remove todos os erros de validação do formulário.
 */
function clearFormErrors() {
  [el.inputName, el.inputEmail].forEach((input) => input.classList.remove('is-error'));
  [el.errorName, el.errorEmail].forEach((el) => (el.textContent = ''));
}

// =====================================================
// FLUXO DE RESERVA
// =====================================================

/**
 * Manipula o envio do formulário de reserva.
 * Valida, envia via POST, atualiza cópias via PATCH e atualiza a UI.
 * @param {Event} event - Evento de submit do formulário
 */
async function handleReserveSubmit(event) {
  event.preventDefault();

  if (!validateReserveForm()) return;

  const book = state.books.find((b) => b.id === state.activeBookId);
  if (!book || book.availableCopies <= 0) {
    showToast('error', 'Ops!', 'Este livro não tem cópias disponíveis.');
    return;
  }

  setSubmitLoading(true);

  const reservation = {
    bookId:          book.id,
    bookTitle:       book.title,
    userName:        el.inputName.value.trim(),
    userEmail:       el.inputEmail.value.trim(),
    reservationDate: new Date().toISOString(),
    status:          'Pendente',
  };

  try {
    // 1. Persiste a reserva
    const newReservation = await postReservation(reservation);

    // 2. Atualiza cópias disponíveis no livro
    const updatedCopies = book.availableCopies - 1;
    await patchBookCopies(book.id, updatedCopies);

    // 3. Atualiza o estado local
    book.availableCopies = updatedCopies;
    state.reservations.push(newReservation);

    // 4. Fecha o modal e atualiza a UI
    closeReserveModal();
    renderBooks(state.filteredBooks);
    updateReservationsBadge();

    showToast('success', 'Reserva confirmada!', `"${book.title}" foi reservado com sucesso.`);
  } catch (error) {
    showToast('error', 'Erro ao reservar', error.message);
  } finally {
    setSubmitLoading(false);
  }
}

/**
 * Alterna o estado de loading do botão de submissão.
 * @param {boolean} isLoading
 */
function setSubmitLoading(isLoading) {
  el.btnSubmitReserve.disabled = isLoading;
  el.btnSubmitText.textContent  = isLoading ? 'Enviando...' : 'Confirmar Reserva';
  el.btnSubmitSpinner.classList.toggle('hidden', !isLoading);
}

// =====================================================
// SEÇÃO: MINHAS RESERVAS
// =====================================================

/**
 * Carrega e renderiza a lista de reservas.
 */
async function loadReservations() {
  el.reservationsLoading.classList.remove('hidden');
  el.reservationsEmpty.classList.add('hidden');
  el.reservationsList.innerHTML = '';

  try {
    state.reservations = await fetchReservations();
    renderReservations(state.reservations);
    updateReservationsBadge();
  } catch (error) {
    showToast('error', 'Erro', 'Não foi possível carregar as reservas.');
  } finally {
    el.reservationsLoading.classList.add('hidden');
  }
}

/**
 * Renderiza os cards de reservas na lista.
 * @param {Array} reservations - Lista de reservas
 */
function renderReservations(reservations) {
  el.reservationsList.innerHTML = '';
  const isEmpty = reservations.length === 0;
  el.reservationsEmpty.classList.toggle('hidden', !isEmpty);

  if (isEmpty) return;

  reservations.forEach((reservation) => {
    const card = createReservationCard(reservation);
    el.reservationsList.appendChild(card);
  });
}

/**
 * Cria o elemento HTML de um card de reserva.
 * @param {Object} reservation - Dados da reserva
 * @returns {HTMLElement} Card de reserva
 */
function createReservationCard(reservation) {
  const card = document.createElement('article');
  card.className = 'reservation-card';
  card.setAttribute('role', 'listitem');

  const formattedDate = formatDate(reservation.reservationDate);
  const statusClass   = `status-badge--${reservation.status.toLowerCase()}`;

  card.innerHTML = `
    <div class="reservation-card__info">
      <p class="reservation-card__book-title">📖 ${reservation.bookTitle}</p>
      <p class="reservation-card__user">👤 ${reservation.userName} &mdash; ${reservation.userEmail}</p>
    </div>
    <div class="reservation-card__meta">
      <span class="reservation-card__date">🗓 ${formattedDate}</span>
      <span class="status-badge ${statusClass}">${reservation.status}</span>
    </div>
  `;

  return card;
}

/**
 * Atualiza o badge de contagem de reservas na aba.
 */
function updateReservationsBadge() {
  const count = state.reservations.length;
  el.reservationsBadge.textContent = count;
  el.reservationsBadge.classList.toggle('hidden', count === 0);
}

// =====================================================
// NAVEGAÇÃO ENTRE ABAS
// =====================================================

/**
 * Exibe a aba do catálogo e oculta a de reservas.
 */
function showCatalogTab() {
  el.sectionCatalog.classList.remove('hidden');
  el.sectionCatalog.classList.add('section--active');
  el.sectionReservations.classList.add('hidden');
  el.sectionReservations.classList.remove('section--active');

  el.btnTabCatalog.classList.add('nav-tab--active');
  el.btnTabCatalog.setAttribute('aria-pressed', 'true');
  el.btnTabReservations.classList.remove('nav-tab--active');
  el.btnTabReservations.setAttribute('aria-pressed', 'false');
}

/**
 * Exibe a aba de reservas e oculta o catálogo.
 * Recarrega os dados ao trocar para a aba.
 */
function showReservationsTab() {
  el.sectionCatalog.classList.add('hidden');
  el.sectionCatalog.classList.remove('section--active');
  el.sectionReservations.classList.remove('hidden');
  el.sectionReservations.classList.add('section--active');

  el.btnTabCatalog.classList.remove('nav-tab--active');
  el.btnTabCatalog.setAttribute('aria-pressed', 'false');
  el.btnTabReservations.classList.add('nav-tab--active');
  el.btnTabReservations.setAttribute('aria-pressed', 'true');

  loadReservations();
}

// =====================================================
// TOASTS (NOTIFICAÇÕES VISUAIS)
// =====================================================

/** Mapa de tipos para ícones e classes CSS */
const TOAST_CONFIG = {
  success: { icon: '✅', cssClass: 'toast--success' },
  error:   { icon: '❌', cssClass: 'toast--error'   },
  info:    { icon: 'ℹ️', cssClass: 'toast--info'    },
};

/**
 * Exibe uma notificação toast na tela.
 * @param {'success'|'error'|'info'} type - Tipo do toast
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem descritiva
 * @param {number} [duration=4000] - Duração em ms antes de fechar
 */
function showToast(type, title, message, duration = 4000) {
  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;

  const toast = document.createElement('div');
  toast.className = `toast ${config.cssClass}`;
  toast.setAttribute('role', 'alert');

  toast.innerHTML = `
    <span class="toast__icon">${config.icon}</span>
    <div class="toast__body">
      <p class="toast__title">${title}</p>
      <p class="toast__msg">${message}</p>
    </div>
  `;

  el.toastContainer.appendChild(toast);

  // Remove o toast após o tempo definido
  setTimeout(() => dismissToast(toast), duration);
}

/**
 * Remove o toast com animação de saída.
 * @param {HTMLElement} toast
 */
function dismissToast(toast) {
  toast.classList.add('toast--out');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

// =====================================================
// ESTADOS DE FEEDBACK DO CATÁLOGO
// =====================================================

/**
 * Alterna o estado de carregamento do catálogo.
 * @param {boolean} isLoading
 */
function setLoadingState(isLoading) {
  el.catalogLoading.classList.toggle('hidden', !isLoading);
  el.booksGrid.classList.toggle('hidden', isLoading);
}

/**
 * Alterna o estado de erro do catálogo.
 * @param {boolean} hasError
 * @param {string} [message=''] - Mensagem de erro
 */
function setErrorState(hasError, message = '') {
  el.catalogError.classList.toggle('hidden', !hasError);
  if (hasError) el.catalogErrorMsg.textContent = message;
}

// =====================================================
// UTILITÁRIOS
// =====================================================

/**
 * Formata uma data ISO 8601 para o formato brasileiro.
 * @param {string} isoDate - Data em formato ISO 8601
 * @returns {string} Data formatada (ex: "31/10/2026 às 09:20")
 */
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString('pt-BR', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).replace(',', ' às');
}

// =====================================================
// REGISTRO DE EVENTOS
// =====================================================

/**
 * Registra todos os event listeners da aplicação.
 * Separado da lógica para manter o código organizado.
 */
function registerEventListeners() {
  // Navegação entre abas
  el.btnTabCatalog.addEventListener('click', showCatalogTab);
  el.btnTabReservations.addEventListener('click', showReservationsTab);
  el.btnGoCatalog.addEventListener('click', showCatalogTab);

  // Filtros em tempo real
  el.inputSearch.addEventListener('input', applyFilters);
  el.selectGenre.addEventListener('change', applyFilters);

  // Retry do catálogo
  el.btnRetry.addEventListener('click', loadCatalog);

  // Modal de detalhes — fechar
  el.btnModalClose.addEventListener('click', closeDetailsModal);
  el.modalOverlay.addEventListener('click', closeDetailsModal);

  // Botão de reserva (abre formulário)
  el.btnReserve.addEventListener('click', openReserveModal);

  // Modal de formulário — fechar
  el.btnReserveClose.addEventListener('click', closeReserveModal);
  el.reserveOverlay.addEventListener('click', closeReserveModal);
  el.btnCancelReserve.addEventListener('click', closeReserveModal);

  // Formulário de reserva — submissão
  el.formReserve.addEventListener('submit', handleReserveSubmit);

  // Fechar modais com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (el.modalReserve.classList.contains('is-open'))  closeReserveModal();
    else if (el.modalDetails.classList.contains('is-open')) closeDetailsModal();
  });
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

/**
 * Ponto de entrada da aplicação.
 * Registra eventos e carrega o catálogo inicial.
 */
async function init() {
  registerEventListeners();
  await loadCatalog();
}

// Inicia a aplicação quando o DOM estiver pronto
init();

