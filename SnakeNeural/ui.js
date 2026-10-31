// Desenha o tabuleiro, mostra a decisão da rede e conduz o treino.
(function () {
  const B = SnakeBrain;
  const KEY = "snake-neural-g12-i24";

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const lossCanvas = document.getElementById("loss");
  const lossCtx = lossCanvas.getContext("2d");

  const scoreEl = document.getElementById("score");
  const recordEl = document.getElementById("record");
  const driverEl = document.getElementById("driver");
  const statusEl = document.getElementById("status");
  const pauseBtn = document.getElementById("pause");
  const retrainBtn = document.getElementById("retrain");
  const modeNetBtn = document.getElementById("mode-net");
  const modeTeacherBtn = document.getElementById("mode-teacher");
  const speedInput = document.getElementById("speed");
  const speedLabel = document.getElementById("speed-label");
  const statSamples = document.getElementById("stat-samples");
  const statAcc = document.getElementById("stat-acc");
  const statLoss = document.getElementById("stat-loss");
  const statMean = document.getElementById("stat-mean");

  const state = {
    net: null,
    game: null,
    mode: "net",
    paused: false,
    busy: false,
    holding: false,
    timer: 0,
    view: 480,
    speed: 12,
    record: 0,
    history: [],
    acc: null,
    loss: null,
    studentMean: null,
    samples: null,
    taken: 1,
  };

  function num(value, digits) {
    return value.toFixed(digits).replace(".", ",");
  }

  function paintStatus(text) {
    statusEl.textContent = text;
  }

  function nextFrame() {
    return new Promise((resolve) => setTimeout(resolve, 16));
  }

  function fit() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.max(240, Math.round(rect.width));
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.view = size;
  }

  function draw() {
    const game = state.game;
    if (!game) return;
    const size = state.view;
    const cell = size / B.GRID;
    ctx.fillStyle = "#14352c";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(232, 245, 226, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 1; i < B.GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(size, i * cell);
      ctx.stroke();
    }

    if (game.food) {
      const cx = game.food.x * cell + cell / 2;
      const cy = game.food.y * cell + cell / 2;
      ctx.fillStyle = "#ef4b32";
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7dbe45";
      ctx.beginPath();
      ctx.ellipse(cx + cell * 0.12, cy - cell * 0.28, cell * 0.1, cell * 0.06, -0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    const snake = game.snake;
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const pad = i === 0 ? cell * 0.1 : cell * 0.16;
      const radius = i === 0 ? cell * 0.34 : cell * 0.28;
      ctx.fillStyle = i === 0 ? "#f4ffd2" : "#d6f26a";
      round(seg.x * cell + pad, seg.y * cell + pad, cell - pad * 2, cell - pad * 2, radius);
      if (i === 0) drawEyes(seg.x, seg.y, game.dir, cell);
    }

    if (!game.alive && game.crash) {
      ctx.strokeStyle = "#ffb4a8";
      ctx.lineWidth = Math.max(2, cell * 0.08);
      const x = game.crash.x * cell;
      const y = game.crash.y * cell;
      ctx.beginPath();
      ctx.moveTo(x + cell * 0.28, y + cell * 0.28);
      ctx.lineTo(x + cell * 0.72, y + cell * 0.72);
      ctx.moveTo(x + cell * 0.72, y + cell * 0.28);
      ctx.lineTo(x + cell * 0.28, y + cell * 0.72);
      ctx.stroke();
    }
  }

  function round(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
    ctx.fill();
  }

  function drawEyes(x, y, dir, cell) {
    const cx = x * cell + cell / 2;
    const cy = y * cell + cell / 2;
    const fx = B.DX[dir];
    const fy = B.DY[dir];
    const px = -fy;
    const py = fx;
    ctx.fillStyle = "#17352c";
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.arc(
        cx + fx * cell * 0.16 + px * side * cell * 0.16,
        cy + fy * cell * 0.16 + py * side * cell * 0.16,
        cell * 0.07,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  function showBars(probs, taken) {
    state.taken = taken;
    for (let a = 0; a < 3; a++) {
      const p = probs ? probs[a] : 0;
      document.getElementById("fill-" + a).style.width = Math.round(p * 100) + "%";
      document.getElementById("pct-" + a).textContent = Math.round(p * 100) + "%";
      document.querySelector('.bar-row[data-action="' + a + '"]').classList.toggle("is-taken", a === taken);
    }
  }

  function drawLoss(history) {
    const w = lossCanvas.width;
    const h = lossCanvas.height;
    lossCtx.clearRect(0, 0, w, h);
    lossCtx.fillStyle = "#fbf8f2";
    lossCtx.fillRect(0, 0, w, h);
    if (!history || history.length < 1) return;
    const pad = 16;
    let max = 0.01;
    for (let i = 0; i < history.length; i++) if (history[i].loss > max) max = history[i].loss;
    lossCtx.strokeStyle = "#0e6b45";
    lossCtx.lineWidth = 3;
    lossCtx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = pad + (history.length === 1 ? 0 : (i / (history.length - 1)) * (w - pad * 2));
      const y = h - pad - (history[i].loss / max) * (h - pad * 2);
      if (i === 0) lossCtx.moveTo(x, y);
      else lossCtx.lineTo(x, y);
    }
    lossCtx.stroke();
  }

  function showStats(partial) {
    if (partial.samples != null) {
      state.samples = partial.samples;
      statSamples.textContent = String(partial.samples);
    }
    if (partial.acc != null) {
      state.acc = partial.acc;
      statAcc.textContent = Math.round(partial.acc * 100) + "%";
    }
    if (partial.loss != null) {
      state.loss = partial.loss;
      statLoss.textContent = num(partial.loss, 3);
    }
    if (partial.studentMean != null) {
      state.studentMean = partial.studentMean;
      statMean.textContent = num(partial.studentMean, 1);
    }
    if (partial.history) {
      state.history = partial.history;
      drawLoss(partial.history);
    }
  }

  function progressText(info) {
    if (info.phase === "exemplos") {
      return "Professor gerando exemplos · jogo " + info.game + " de " + info.games + " · " + info.samples + " amostras";
    }
    if (info.phase === "treino") {
      return "Ajustando os pesos · época " + info.epoch + " de " + info.epochs + " · acerto " + Math.round(info.acc * 100) + "%";
    }
    if (info.phase === "prova") {
      return "Provando a rede · jogo " + info.done + " de " + info.evalGames + " · média " + num(info.studentMean, 1) + " maçãs";
    }
    return "Treinando…";
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const net = B.netFromJSON(data.brain);
      if (!net) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function saveResult(result) {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          brain: B.netToJSON(result.net),
          acc: result.acc,
          loss: result.loss,
          studentMean: result.studentMean,
          samples: result.samples,
          elapsedMs: result.elapsedMs,
          history: result.history,
        })
      );
      localStorage.setItem(KEY + "-record", String(state.record));
    } catch (err) {
      /* navegador sem espaço ou storage bloqueado: a partida segue na memória */
    }
  }

  function freshGame() {
    const seed = (Date.now() ^ ((Math.random() * 0x7fffffff) | 0)) >>> 0;
    state.game = B.createGame(B.mulberry32(seed), true);
    state.holding = false;
    scoreEl.textContent = "0";
    draw();
    if (state.net) {
      const choice = B.chooseNet(state.net, state.game);
      showBars(choice.probs, choice.action);
    }
  }

  function setMode(mode) {
    state.mode = mode;
    const netOn = mode === "net";
    modeNetBtn.classList.toggle("is-on", netOn);
    modeTeacherBtn.classList.toggle("is-on", !netOn);
    modeNetBtn.setAttribute("aria-pressed", netOn ? "true" : "false");
    modeTeacherBtn.setAttribute("aria-pressed", netOn ? "false" : "true");
    driverEl.textContent = netOn ? "Rede" : "Professor";
    if (!state.busy && state.game && state.game.alive) {
      paintStatus(netOn ? "A rede está jogando." : "O professor está jogando, para comparar.");
    }
  }

  function applySpeed(value) {
    state.speed = Number(value);
    speedLabel.textContent = state.speed + " passos/s";
    if (!state.busy) startLoop();
  }

  function startLoop() {
    if (state.timer) clearInterval(state.timer);
    if (state.paused || state.busy) return;
    state.timer = setInterval(tick, 1000 / state.speed);
  }

  function stopLoop() {
    if (state.timer) clearInterval(state.timer);
    state.timer = 0;
  }

  function tick() {
    const game = state.game;
    if (!game || state.holding || state.paused || state.busy || !game.alive) return;
    if (state.mode === "net" && !state.net) return;

    let taken;
    let probs = null;
    if (state.net) {
      const choice = B.chooseNet(state.net, game);
      probs = choice.probs;
      taken = state.mode === "net" ? choice.action : B.teacherAction(game);
    } else {
      taken = B.teacherAction(game);
    }

    B.step(game, taken);
    scoreEl.textContent = String(game.score);
    if (game.score > state.record) {
      state.record = game.score;
      recordEl.textContent = String(state.record);
      try { localStorage.setItem(KEY + "-record", String(state.record)); } catch (err) {}
    }
    draw();
    showBars(probs, taken);

    if (!game.alive) {
      state.holding = true;
      if (game.won) paintStatus("A cobra limpou o tabuleiro. Nova partida.");
      else if (game.starved) paintStatus("Andou em círculo sem achar a maçã. Nova partida.");
      else paintStatus("Bateu. Nova partida.");
      setTimeout(freshGame, 800);
    }
  }

  async function train(seed) {
    state.busy = true;
    state.holding = true;
    state.history = [];
    drawLoss([]);
    stopLoop();
    retrainBtn.disabled = true;
    pauseBtn.disabled = true;
    paintStatus("Preparando exemplos do professor…");

    let result;
    try {
      result = await B.trainAndEval({
        seed,
        games: 8,
        epochs: 16,
        evalGames: 6,
        async onProgress(info) {
          if (info.phase === "treino") {
            state.history = state.history.concat([{ loss: info.loss, acc: info.acc }]);
          }
          showStats({
            samples: info.samples,
            acc: info.acc,
            loss: info.loss,
            studentMean: info.studentMean,
            history: state.history,
          });
          paintStatus(progressText(info));
          await nextFrame();
        },
      });
    } catch (err) {
      paintStatus("O treino não terminou: " + (err && err.message ? err.message : err));
      return null;
    } finally {
      state.busy = false;
      retrainBtn.disabled = false;
      pauseBtn.disabled = false;
    }

    state.history = result.history.slice();
    state.net = result.net;
    showStats(result);
    drawLoss(state.history);
    saveResult(result);
    freshGame();
    const seconds = num(result.elapsedMs / 1000, 1);
    paintStatus(
      "Rede pronta em " +
        seconds +
        " s. Acerto " +
        Math.round(result.acc * 100) +
        "% · média de " +
        num(result.studentMean, 1) +
        " maçãs na prova. Ela está jogando."
    );
    if (!state.paused) startLoop();
    return result;
  }

  function boot() {
    fit();
    try {
      const savedRecord = Number(localStorage.getItem(KEY + "-record"));
      if (savedRecord > 0) state.record = savedRecord;
    } catch (err) {}
    recordEl.textContent = String(state.record);
    freshGame();

    const saved = loadSaved();
    if (saved) {
      state.net = B.netFromJSON(saved.brain);
      state.history = saved.history || [];
      showStats(saved);
      drawLoss(state.history);
      freshGame();
      paintStatus("Cérebro carregado deste navegador. A rede está jogando.");
      startLoop();
      return;
    }
    train(21);
  }

  pauseBtn.addEventListener("click", () => {
    if (state.busy) return;
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? "Continuar" : "Pausar";
    if (state.paused) {
      stopLoop();
      paintStatus("Pausado.");
    } else {
      paintStatus(state.mode === "net" ? "A rede está jogando." : "O professor está jogando, para comparar.");
      startLoop();
    }
  });

  retrainBtn.addEventListener("click", () => {
    if (state.busy) return;
    state.history = [];
    drawLoss([]);
    const seed = (Date.now() % 100000) + 1;
    train(seed);
  });

  modeNetBtn.addEventListener("click", () => setMode("net"));
  modeTeacherBtn.addEventListener("click", () => setMode("teacher"));
  speedInput.addEventListener("input", () => applySpeed(speedInput.value));

  window.addEventListener("resize", () => {
    fit();
    draw();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.target.closest("button, input, textarea, a")) return;
    event.preventDefault();
    pauseBtn.click();
  });

  window.__snake = state;
  boot();
})();
