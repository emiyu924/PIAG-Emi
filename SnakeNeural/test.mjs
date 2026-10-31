import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(dir, "brain.js"), "utf8");
globalThis.performance = globalThis.performance || (await import("node:perf_hooks")).performance;
eval(code);

const brain = globalThis.SnakeBrain;
const errors = brain.selfCheck();
if (errors.length) {
  console.error("regras:", errors);
  process.exit(1);
}
console.log("regras ok");

const t0 = performance.now();
const teacher = brain.rollout((game) => brain.teacherAction(game), brain.mulberry32(3), true);
console.log(
  "professor 1 jogo:",
  teacher.score,
  "maçãs,",
  teacher.steps,
  "passos,",
  teacher.won ? "limpou" : teacher.starved ? "fome" : "bateu",
  "em",
  Math.round(performance.now() - t0),
  "ms"
);

const result = await brain.trainAndEval({
  seed: 7,
  games: 8,
  epochs: 20,
  evalGames: 6,
  onProgress(info) {
    if (info.phase === "treino") {
      console.log(
        `época ${info.epoch}/${info.epochs}  perda ${info.loss.toFixed(3)}  acerto ${(info.acc * 100).toFixed(1)}%`
      );
    } else if (info.phase === "exemplos" && info.samples % 400 < 200) {
      console.log(`exemplos ${info.samples}  jogos ${info.game}/${info.games}`);
    }
  },
});

console.log(
  JSON.stringify(
    {
      samples: result.samples,
      teacherMean: Number(result.teacherMean.toFixed(2)),
      teacherScores: result.teacherScores,
      studentMean: Number(result.studentMean.toFixed(2)),
      studentMax: result.studentMax,
      studentScores: result.studentScores,
      acc: Number(result.acc.toFixed(3)),
      loss: Number(result.loss.toFixed(3)),
      ms: Math.round(result.elapsedMs),
    },
    null,
    2
  )
);

if (!teacher.won || teacher.score < 141) {
  console.error("professor não limpou o tabuleiro", teacher.score, teacher.won, teacher.starved);
  process.exit(1);
}
if (result.studentMean < 120) {
  console.error("rede fraca: média abaixo de 120 maçãs");
  process.exit(1);
}
