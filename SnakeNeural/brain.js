// Snake que joga sozinho.
// Método: clonagem comportamental (o mais rápido que ainda deixa a REDE decidir).
//
// 1. As regras do jogo andam num tabuleiro pequeno.
// 2. Sensores medem, para esquerda / frente / direita, o perigo, o espaço,
//    a distância da maçã e se o rabo continua alcançável.
// 3. Um professor (busca no tabuleiro) escolhe a jogada certa e gera exemplos.
//    Isso é muito mais rápido do que a rede descobrir tudo por tentativa e erro.
// 4. Uma rede neural pequena (18 → 32 → 3) aprende a copiar esses exemplos.
// 5. Na hora de jogar, só a rede escolhe a direção. O professor fica de fora.

(function () {
  const GRID = 12;
  const N = GRID * GRID;
  const INPUTS = 18;
  const HIDDEN = 32;
  const OUTPUTS = 3;
  const HUNGER = GRID * GRID * 5;
  const DX = [0, 1, 0, -1];
  const DY = [-1, 0, 1, 0];

  const blocked = new Uint8Array(N);
  const seen = new Uint8Array(N);
  const parent = new Int16Array(N);
  const queue = new Int16Array(N);

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function rng() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randn(rng) {
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
  }

  function idx(x, y) {
    return y * GRID + x;
  }

  function inside(x, y) {
    return x >= 0 && y >= 0 && x < GRID && y < GRID;
  }

  function turnDir(dir, action) {
    return (dir + [3, 0, 1][action]) & 3;
  }

  function relAction(fromDir, toDir) {
    const diff = (toDir - fromDir + 4) & 3;
    if (diff === 1) return 2;
    if (diff === 3) return 0;
    if (diff === 0) return 1;
    return -1;
  }

  function directionOf(dx, dy) {
    for (let d = 0; d < 4; d++) {
      if (DX[d] === dx && DY[d] === dy) return d;
    }
    return -1;
  }

  function createGame(rng, demo) {
    let dir;
    let hx;
    let hy;
    if (demo) {
      dir = 1;
      hx = 4;
      hy = (GRID / 2) | 0;
    } else {
      dir = (rng() * 4) | 0;
      const back = (dir + 2) & 3;
      for (;;) {
        hx = (rng() * GRID) | 0;
        hy = (rng() * GRID) | 0;
        const x1 = hx + DX[back];
        const y1 = hy + DY[back];
        const x2 = hx + 2 * DX[back];
        const y2 = hy + 2 * DY[back];
        if (inside(x1, y1) && inside(x2, y2)) break;
      }
    }
    const back = (dir + 2) & 3;
    const game = {
      snake: [
        { x: hx, y: hy },
        { x: hx + DX[back], y: hy + DY[back] },
        { x: hx + 2 * DX[back], y: hy + 2 * DY[back] },
      ],
      dir,
      score: 0,
      steps: 0,
      stepsSinceFood: 0,
      alive: true,
      won: false,
      starved: false,
      crash: null,
      food: null,
      rng,
    };
    spawnFood(game);
    return game;
  }

  function spawnFood(game) {
    const occ = new Uint8Array(N);
    const snake = game.snake;
    for (let i = 0; i < snake.length; i++) occ[idx(snake[i].x, snake[i].y)] = 1;
    const free = [];
    for (let i = 0; i < N; i++) if (!occ[i]) free.push(i);
    if (free.length === 0) {
      game.food = null;
      return;
    }
    const cell = free[(game.rng() * free.length) | 0];
    game.food = { x: cell % GRID, y: (cell / GRID) | 0 };
  }

  // Colisão barata: parede ou corpo. O rabo sai do lugar, então pisar nele é válido
  // quando a cobra não vai crescer neste passo.
  function peek(game, action) {
    const dir = turnDir(game.dir, action);
    const x = game.snake[0].x + DX[dir];
    const y = game.snake[0].y + DY[dir];
    const base = { dir, x, y, eating: false, dist: 1, fatal: true };
    if (!inside(x, y)) return base;
    const food = game.food;
    const eating = !!(food && food.x === x && food.y === y);
    const snake = game.snake;
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === x && snake[i].y === y) {
        const isTail = i === snake.length - 1;
        if (!(isTail && !eating)) return { dir, x, y, eating, dist: 0, fatal: true };
      }
    }
    const dist = food ? Math.abs(food.x - x) + Math.abs(food.y - y) : 0;
    return { dir, x, y, eating, dist, fatal: false };
  }

  function floodCount(sx, sy) {
    seen.fill(0);
    const start = idx(sx, sy);
    if (blocked[start]) return 0;
    seen[start] = 1;
    let qh = 0;
    let qt = 0;
    queue[qt++] = start;
    let count = 0;
    while (qh < qt) {
      const cur = queue[qh++];
      count++;
      const x = cur % GRID;
      const y = (cur / GRID) | 0;
      for (let d = 0; d < 4; d++) {
        const nx = x + DX[d];
        const ny = y + DY[d];
        if (!inside(nx, ny)) continue;
        const ni = ny * GRID + nx;
        if (seen[ni] || blocked[ni]) continue;
        seen[ni] = 1;
        queue[qt++] = ni;
      }
    }
    return count;
  }

  // Menor caminho. `blocked` vale 1 em célula proibida. A origem pode estar marcada
  // porque a cabeça está em cima do próprio corpo; a busca sai dela mesmo assim.
  function bfsPath(sx, sy, gx, gy) {
    seen.fill(0);
    const start = idx(sx, sy);
    const goal = idx(gx, gy);
    if (blocked[goal]) return null;
    seen[start] = 1;
    let qh = 0;
    let qt = 0;
    queue[qt++] = start;
    let found = start === goal;
    while (qh < qt && !found) {
      const cur = queue[qh++];
      const x = cur % GRID;
      const y = (cur / GRID) | 0;
      for (let d = 0; d < 4; d++) {
        const nx = x + DX[d];
        const ny = y + DY[d];
        if (!inside(nx, ny)) continue;
        const ni = ny * GRID + nx;
        if (seen[ni] || blocked[ni]) continue;
        seen[ni] = 1;
        parent[ni] = cur;
        if (ni === goal) {
          found = true;
          break;
        }
        queue[qt++] = ni;
      }
    }
    if (!found) return null;
    if (start === goal) return [];
    const cells = [];
    let cur = goal;
    let guard = 0;
    while (cur !== start && guard++ <= N) {
      cells.push(cur);
      cur = parent[cur];
    }
    if (cur !== start) return null;
    cells.reverse();
    return cells;
  }

  function markBodyExceptTail(snake) {
    blocked.fill(0);
    const last = snake.length - 1;
    for (let i = 0; i < last; i++) blocked[idx(snake[i].x, snake[i].y)] = 1;
  }

  // Sensores depois de um passo hipotético, sem alterar o jogo.
  function sense(game, action) {
    const p = peek(game, action);
    if (p.fatal) {
      return {
        fatal: true,
        dir: p.dir,
        x: p.x,
        y: p.y,
        eating: false,
        dist: GRID * 2,
        space: 0,
        need: game.snake.length,
        foodDist: -1,
        tailReachable: false,
      };
    }
    const snake = game.snake;
    const eating = p.eating;
    const need = snake.length + (eating ? 1 : 0);

    blocked.fill(0);
    const keep = eating ? snake.length : snake.length - 1;
    for (let i = 0; i < keep; i++) blocked[idx(snake[i].x, snake[i].y)] = 1;
    const space = floodCount(p.x, p.y);

    blocked.fill(0);
    blocked[idx(p.x, p.y)] = 1;
    const bodyEnd = eating ? snake.length - 1 : snake.length - 2;
    for (let i = 0; i <= bodyEnd; i++) blocked[idx(snake[i].x, snake[i].y)] = 1;
    const tailIndex = eating ? snake.length - 1 : snake.length - 2;
    const tail = snake[tailIndex];
    if (!(tail.x === p.x && tail.y === p.y)) blocked[idx(tail.x, tail.y)] = 0;

    let tailReachable = tail.x === p.x && tail.y === p.y;
    if (!tailReachable) tailReachable = bfsPath(p.x, p.y, tail.x, tail.y) !== null;

    let foodDist = 0;
    if (!eating && game.food) {
      const path = bfsPath(p.x, p.y, game.food.x, game.food.y);
      foodDist = path ? path.length : -1;
    }

    const body = [{ x: p.x, y: p.y }];
    for (let i = 0; i < keep; i++) body.push(snake[i]);
    const safeFood = eating ? (tailReachable ? 1 : 0) : safeFoodSignal(body, game.food);

    return {
      fatal: false,
      dir: p.dir,
      x: p.x,
      y: p.y,
      eating,
      dist: p.dist,
      space,
      need,
      foodDist,
      tailReachable,
      safeFood,
    };
  }

  function features(game) {
    const f = new Float64Array(INPUTS);
    const span = GRID * 2;
    for (let a = 0; a < 3; a++) {
      const ev = sense(game, a);
      if (ev.fatal) {
        f[a] = 1;
        f[3 + a] = 0;
        f[6 + a] = 1;
        f[9 + a] = 1;
        f[12 + a] = 0;
        f[15 + a] = 0;
      } else {
        f[a] = 0;
        f[3 + a] = Math.min(ev.space / ev.need, 2) / 2;
        f[6 + a] = ev.dist / span;
        f[9 + a] = ev.foodDist < 0 ? 1 : ev.foodDist / span;
        f[12 + a] = ev.tailReachable ? 1 : 0;
        f[15 + a] = ev.safeFood;
      }
    }
    return f;
  }

  // 1 se, desta posição, existe caminho até a maçã e depois dele ainda dá para
  // alcançar o rabo. É o mesmo critério do professor, medido em cada lado.
  function safeFoodSignal(snake, food) {
    if (!food) return 0;
    const head = snake[0];
    markBodyExceptTail(snake);
    const cells = bfsPath(head.x, head.y, food.x, food.y);
    if (!cells || cells.length === 0) return 0;
    const future = pathSurvives(snake, cells, food);
    return future && tailReachable(future) ? 1 : 0;
  }

  function step(game, action) {
    if (!game.alive) return;
    const p = peek(game, action);
    game.steps++;
    if (p.fatal) {
      game.alive = false;
      game.crash = inside(p.x, p.y) ? { x: p.x, y: p.y } : { x: game.snake[0].x, y: game.snake[0].y };
      return;
    }
    game.dir = p.dir;
    game.snake.unshift({ x: p.x, y: p.y });
    if (p.eating) {
      game.score++;
      game.stepsSinceFood = 0;
      spawnFood(game);
      if (!game.food) {
        game.won = true;
        game.alive = false;
      }
    } else {
      game.snake.pop();
      game.stepsSinceFood++;
      if (game.stepsSinceFood > HUNGER) {
        game.alive = false;
        game.starved = true;
      }
    }
  }

  function pathSurvives(snake, cells, food) {
    const body = snake.map((s) => ({ x: s.x, y: s.y }));
    for (let k = 0; k < cells.length; k++) {
      const cell = cells[k];
      const x = cell % GRID;
      const y = (cell / GRID) | 0;
      const eating = food && food.x === x && food.y === y;
      for (let i = 0; i < body.length; i++) {
        if (body[i].x === x && body[i].y === y) {
          const isTail = i === body.length - 1;
          if (!(isTail && !eating)) return null;
        }
      }
      body.unshift({ x, y });
      if (!eating) body.pop();
    }
    return body;
  }

  function tailReachable(snake) {
    const head = snake[0];
    const tail = snake[snake.length - 1];
    if (head.x === tail.x && head.y === tail.y) return true;
    markBodyExceptTail(snake);
    return bfsPath(head.x, head.y, tail.x, tail.y) !== null;
  }

  // Professor: vai na maçã só se, depois de comer, ainda existe caminho até o rabo.
  // Se isso prenderia a cobra, ela segue o rabo e abre espaço. Sem saída, escolhe
  // o lado com mais células livres.
  function teacherAction(game) {
    const head = game.snake[0];
    const food = game.food;
    if (food) {
      markBodyExceptTail(game.snake);
      const cells = bfsPath(head.x, head.y, food.x, food.y);
      if (cells && cells.length > 0) {
        const future = pathSurvives(game.snake, cells, food);
        if (future && tailReachable(future)) {
          const nx = cells[0] % GRID;
          const ny = (cells[0] / GRID) | 0;
          const action = relAction(game.dir, directionOf(nx - head.x, ny - head.y));
          if (action >= 0 && !peek(game, action).fatal) return action;
        }
      }
    }

    const tail = game.snake[game.snake.length - 1];
    markBodyExceptTail(game.snake);
    const toTail = bfsPath(head.x, head.y, tail.x, tail.y);
    if (toTail && toTail.length > 0) {
      const nx = toTail[0] % GRID;
      const ny = (toTail[0] / GRID) | 0;
      const action = relAction(game.dir, directionOf(nx - head.x, ny - head.y));
      if (action >= 0 && !peek(game, action).fatal) return action;
    }

    let bestA = 1;
    let bestS = -Infinity;
    for (let a = 0; a < 3; a++) {
      const ev = sense(game, a);
      const score = ev.fatal ? -1e9 : ev.space;
      if (score > bestS) {
        bestS = score;
        bestA = a;
      }
    }
    return bestA;
  }

  function createNet(rng) {
    const net = {
      nIn: INPUTS,
      nHid: HIDDEN,
      nOut: OUTPUTS,
      w1: new Float64Array(HIDDEN * INPUTS),
      b1: new Float64Array(HIDDEN),
      w2: new Float64Array(OUTPUTS * HIDDEN),
      b2: new Float64Array(OUTPUTS),
    };
    const s1 = Math.sqrt(2 / INPUTS);
    const s2 = Math.sqrt(2 / HIDDEN);
    for (let i = 0; i < net.w1.length; i++) net.w1[i] = randn(rng) * s1;
    for (let i = 0; i < net.w2.length; i++) net.w2[i] = randn(rng) * s2;
    return net;
  }

  function forward(net, x) {
    const h = new Float64Array(net.nHid);
    const z = new Float64Array(net.nHid);
    for (let i = 0; i < net.nHid; i++) {
      let s = net.b1[i];
      const row = i * net.nIn;
      for (let j = 0; j < net.nIn; j++) s += net.w1[row + j] * x[j];
      z[i] = s;
      h[i] = s > 0 ? s : 0.01 * s;
    }
    const logits = new Float64Array(net.nOut);
    for (let k = 0; k < net.nOut; k++) {
      let s = net.b2[k];
      const row = k * net.nHid;
      for (let j = 0; j < net.nHid; j++) s += net.w2[row + j] * h[j];
      logits[k] = s;
    }
    return { h, z, logits };
  }

  function softmax(logits) {
    let m = logits[0];
    for (let i = 1; i < logits.length; i++) if (logits[i] > m) m = logits[i];
    const probs = new Float64Array(logits.length);
    let sum = 0;
    for (let i = 0; i < logits.length; i++) {
      probs[i] = Math.exp(logits[i] - m);
      sum += probs[i];
    }
    for (let i = 0; i < probs.length; i++) probs[i] /= sum;
    return probs;
  }

  function chooseNet(net, game) {
    const x = features(game);
    const { logits } = forward(net, x);
    const probs = softmax(logits);
    let action = 0;
    for (let i = 1; i < probs.length; i++) if (probs[i] > probs[action]) action = i;
    return { action, probs, features: x };
  }

  function createAdam(net) {
    const params = [net.w1, net.b1, net.w2, net.b2];
    return {
      t: 0,
      lr: 0.012,
      params,
      m: params.map((a) => new Float64Array(a.length)),
      v: params.map((a) => new Float64Array(a.length)),
      g: params.map((a) => new Float64Array(a.length)),
    };
  }

  function adamStep(opt) {
    opt.t += 1;
    const b1 = 0.9;
    const b2 = 0.999;
    const eps = 1e-8;
    const c1 = 1 - Math.pow(b1, opt.t);
    const c2 = 1 - Math.pow(b2, opt.t);
    for (let p = 0; p < opt.params.length; p++) {
      const w = opt.params[p];
      const m = opt.m[p];
      const v = opt.v[p];
      const g = opt.g[p];
      for (let i = 0; i < w.length; i++) {
        m[i] = b1 * m[i] + (1 - b1) * g[i];
        v[i] = b2 * v[i] + (1 - b2) * g[i] * g[i];
        w[i] -= (opt.lr * (m[i] / c1)) / (Math.sqrt(v[i] / c2) + eps);
      }
    }
  }

  function createDataset() {
    return { nIn: INPUTS, count: 0, x: [], y: [] };
  }

  function pushSample(ds, feat, label) {
    ds.x.push(feat);
    ds.y.push(label);
    ds.count++;
  }

  function classWeights(ds) {
    const counts = [0, 0, 0];
    for (let i = 0; i < ds.count; i++) counts[ds.y[i]]++;
    const weights = [1, 1, 1];
    for (let c = 0; c < 3; c++) {
      weights[c] = counts[c] ? ds.count / (3 * counts[c]) : 1;
    }
    return weights;
  }

  function trainEpoch(net, opt, ds, rng, weights) {
    const order = new Uint32Array(ds.count);
    for (let i = 0; i < ds.count; i++) order[i] = i;
    for (let i = ds.count - 1; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0;
      const tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }

    const batch = 64;
    let lossSum = 0;
    let correct = 0;
    const dh = new Float64Array(net.nHid);

    for (let start = 0; start < ds.count; start += batch) {
      const end = Math.min(start + batch, ds.count);
      for (let p = 0; p < opt.g.length; p++) opt.g[p].fill(0);
      const gw1 = opt.g[0];
      const gb1 = opt.g[1];
      const gw2 = opt.g[2];
      const gb2 = opt.g[3];

      for (let n = start; n < end; n++) {
        const si = order[n];
        const x = ds.x[si];
        const label = ds.y[si];
        const { h, z, logits } = forward(net, x);
        const probs = softmax(logits);
        const pLabel = probs[label] > 1e-12 ? probs[label] : 1e-12;
        lossSum += -Math.log(pLabel);
        let pred = 0;
        for (let k = 1; k < 3; k++) if (probs[k] > probs[pred]) pred = k;
        if (pred === label) correct++;

        const cw = weights[label];
        const dLog = [0, 0, 0];
        for (let k = 0; k < 3; k++) dLog[k] = (probs[k] - (k === label ? 1 : 0)) * cw;

        for (let j = 0; j < net.nHid; j++) {
          let s = 0;
          for (let k = 0; k < 3; k++) s += dLog[k] * net.w2[k * net.nHid + j];
          dh[j] = s * (z[j] > 0 ? 1 : 0.01);
        }
        for (let j = 0; j < net.nHid; j++) {
          gb1[j] += dh[j];
          const row = j * net.nIn;
          for (let i = 0; i < net.nIn; i++) gw1[row + i] += dh[j] * x[i];
        }
        for (let k = 0; k < 3; k++) {
          gb2[k] += dLog[k];
          const row = k * net.nHid;
          for (let j = 0; j < net.nHid; j++) gw2[row + j] += dLog[k] * h[j];
        }
      }

      const inv = 1 / (end - start);
      for (let p = 0; p < opt.g.length; p++) {
        const g = opt.g[p];
        for (let i = 0; i < g.length; i++) g[i] *= inv;
      }
      adamStep(opt);
    }

    return { loss: lossSum / ds.count, acc: correct / ds.count };
  }

  function rollout(policy, rng, demo, cap) {
    const game = createGame(rng, demo);
    const limit = cap || GRID * GRID * 40;
    while (game.alive && game.steps < limit) step(game, policy(game));
    return game;
  }

  function mean(nums) {
    if (!nums.length) return 0;
    let s = 0;
    for (let i = 0; i < nums.length; i++) s += nums[i];
    return s / nums.length;
  }

  // Coleta exemplos e treina cedendo o controle de tempos em tempos,
  // para a página continuar respondendo.
  async function trainAndEval(options) {
    const opts = options || {};
    const seed = opts.seed == null ? 7 : opts.seed;
    const games = opts.games || 10;
    const epochs = opts.epochs || 24;
    const evalGames = opts.evalGames == null ? 8 : opts.evalGames;
    const sampleCap = opts.sampleCap || 9000;
    const stepCap = opts.stepCap || GRID * GRID * 25;
    const slice = opts.slice || 200;
    const onProgress = opts.onProgress || function () {};
    const rng = mulberry32(seed);
    const ds = createDataset();
    const teacherScores = [];
    const t0 = performance.now();

    let game = createGame(rng, true);
    let played = 0;
    while (played < games && ds.count < sampleCap) {
      let guard = 0;
      while (game.alive && game.steps < stepCap && ds.count < sampleCap && guard < slice) {
        const feat = features(game);
        const action = teacherAction(game);
        pushSample(ds, feat, action);
        step(game, action);
        guard++;
      }
      if (!game.alive || game.steps >= stepCap || ds.count >= sampleCap) {
        teacherScores.push(game.score);
        played++;
        if (played < games && ds.count < sampleCap) game = createGame(rng, false);
      }
      await onProgress({
        phase: "exemplos",
        game: Math.min(played + (game.alive ? 1 : 0), games),
        games,
        samples: ds.count,
        teacherMean: mean(teacherScores),
      });
    }

    const net = createNet(mulberry32(seed + 99));
    const opt = createAdam(net);
    const weights = classWeights(ds);
    const history = [];
    for (let e = 0; e < epochs; e++) {
      const stat = trainEpoch(net, opt, ds, mulberry32(seed + 1000 + e), weights);
      history.push(stat);
      await onProgress({
        phase: "treino",
        epoch: e + 1,
        epochs,
        loss: stat.loss,
        acc: stat.acc,
        samples: ds.count,
        teacherMean: mean(teacherScores),
      });
      if (stat.acc >= 0.97 && e >= 6) break;
    }

    const studentScores = [];
    for (let i = 0; i < evalGames; i++) {
      const g = rollout((gm) => chooseNet(net, gm).action, mulberry32(seed + 5000 + i), false);
      studentScores.push(g.score);
      if (i === 0 || i === evalGames - 1 || (i + 1) % 2 === 0) {
        await onProgress({
          phase: "prova",
          done: i + 1,
          evalGames,
          studentMean: mean(studentScores),
          acc: history[history.length - 1].acc,
          loss: history[history.length - 1].loss,
          samples: ds.count,
          teacherMean: mean(teacherScores),
        });
      }
    }

    const elapsedMs = performance.now() - t0;
    return {
      net,
      history,
      samples: ds.count,
      teacherScores,
      studentScores,
      teacherMean: mean(teacherScores),
      studentMean: mean(studentScores),
      studentMax: studentScores.reduce((a, b) => (a > b ? a : b), 0),
      acc: history.length ? history[history.length - 1].acc : 0,
      loss: history.length ? history[history.length - 1].loss : 0,
      elapsedMs,
    };
  }

  function netToJSON(net) {
    return {
      v: 1,
      grid: GRID,
      nIn: net.nIn,
      nHid: net.nHid,
      nOut: net.nOut,
      w1: Array.from(net.w1),
      b1: Array.from(net.b1),
      w2: Array.from(net.w2),
      b2: Array.from(net.b2),
    };
  }

  function netFromJSON(data) {
    if (!data || data.v !== 1 || data.grid !== GRID || data.nIn !== INPUTS || data.nHid !== HIDDEN) {
      return null;
    }
    return {
      nIn: INPUTS,
      nHid: HIDDEN,
      nOut: OUTPUTS,
      w1: Float64Array.from(data.w1),
      b1: Float64Array.from(data.b1),
      w2: Float64Array.from(data.w2),
      b2: Float64Array.from(data.b2),
    };
  }

  function selfCheck() {
    const errors = [];
    const rng = mulberry32(1);
    const g = createGame(rng, true);
    const x0 = g.snake[0].x;
    const len0 = g.snake.length;
    step(g, 1);
    if (!g.alive) errors.push("morreu no primeiro passo livre");
    if (g.snake[0].x !== x0 + 1) errors.push("passo em frente não andou para a direita");
    if (g.snake.length !== len0) errors.push("encolheu sem motivo");

    const wall = createGame(rng, true);
    wall.snake = [
      { x: GRID - 1, y: 1 },
      { x: GRID - 2, y: 1 },
      { x: GRID - 3, y: 1 },
    ];
    wall.dir = 1;
    wall.food = { x: 0, y: 0 };
    step(wall, 1);
    if (wall.alive) errors.push("não morreu na parede");

    const eat = createGame(rng, true);
    eat.food = { x: eat.snake[0].x + 1, y: eat.snake[0].y };
    const before = eat.snake.length;
    step(eat, 1);
    if (eat.score !== 1 || eat.snake.length !== before + 1) errors.push("não cresceu ao comer");

    const probs = softmax(new Float64Array([1, 1, 1]));
    const sum = probs[0] + probs[1] + probs[2];
    if (Math.abs(sum - 1) > 1e-9) errors.push("softmax não soma 1");
    return errors;
  }

  globalThis.SnakeBrain = {
    GRID,
    INPUTS,
    HIDDEN,
    OUTPUTS,
    DX,
    DY,
    mulberry32,
    createGame,
    step,
    peek,
    features,
    teacherAction,
    createNet,
    chooseNet,
    rollout,
    trainAndEval,
    netToJSON,
    netFromJSON,
    selfCheck,
  };
})();
