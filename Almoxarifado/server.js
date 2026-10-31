const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data', 'materiais.json');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let chain = Promise.resolve();

function withLock(fn) {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function limpar(valor) {
  return String(valor).replace(/[\u0000-\u001F\u007F]/g, '').trim().replace(/\s+/g, ' ');
}

function texto(valor, campo, min, max) {
  if (typeof valor !== 'string') {
    throw new HttpError(400, `${campo} é obrigatório.`);
  }
  const limpo = limpar(valor);
  if (limpo.length < min || limpo.length > max) {
    throw new HttpError(400, `${campo} deve ter entre ${min} e ${max} caracteres.`);
  }
  return limpo;
}

function textoOpcional(valor, campo, max) {
  if (valor == null || valor === '') return '';
  if (typeof valor !== 'string') {
    throw new HttpError(400, `${campo} é inválido.`);
  }
  const limpo = limpar(valor);
  if (limpo.length > max) {
    throw new HttpError(400, `${campo} deve ter no máximo ${max} caracteres.`);
  }
  return limpo;
}

function inteiro(valor, campo, min, max) {
  if (typeof valor !== 'number' && typeof valor !== 'string') {
    throw new HttpError(400, `${campo} deve ser um número inteiro.`);
  }
  if (typeof valor === 'string' && valor.trim() === '') {
    throw new HttpError(400, `${campo} é obrigatório.`);
  }
  const n = typeof valor === 'number' ? valor : Number(valor);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${campo} deve ser um número inteiro entre ${min} e ${max}.`);
  }
  return n;
}

function hojeSP() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function readDB() {
  let raw;
  try {
    raw = fs.readFileSync(DATA_PATH, 'utf8');
  } catch {
    throw new HttpError(500, 'Não foi possível ler a base de materiais.');
  }

  let db;
  try {
    db = JSON.parse(raw);
  } catch {
    throw new HttpError(500, 'A base de materiais está ilegível. Verifique data/materiais.json.');
  }

  if (!db || !Array.isArray(db.materiais) || !Array.isArray(db.movimentacoes)) {
    throw new HttpError(500, 'A base de materiais está incompleta. Verifique data/materiais.json.');
  }

  db.configuracoes = db.configuracoes && typeof db.configuracoes === 'object' ? db.configuracoes : {};
  return db;
}

function writeDB(db) {
  const dir = path.dirname(DATA_PATH);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${DATA_PATH}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, DATA_PATH);
}

function proximoId(lista) {
  return lista.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function idDaRota(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Identificador inválido.');
  }
  return id;
}

function achar(db, id) {
  const material = db.materiais.find((item) => item.id === id);
  if (!material) throw new HttpError(404, 'Material não encontrado.');
  return material;
}

function registrar(db, material, tipo, quantidade, motivo, responsavel, saldoAnterior) {
  const movimento = {
    id: proximoId(db.movimentacoes),
    materialId: material.id,
    materialNome: material.nome,
    tipo,
    quantidade,
    saldoAnterior,
    saldoAtual: material.quantidade,
    motivo,
    responsavel,
    data: new Date().toISOString(),
  };
  db.movimentacoes.unshift(movimento);
  return movimento;
}

function responsavelDe(valor) {
  return textoOpcional(valor, 'Responsável', 80) || 'Responsável pelo Almoxarifado';
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/estado', (_req, res, next) => {
  try {
    res.json(readDB());
  } catch (err) {
    next(err);
  }
});

app.post('/api/materiais', (req, res, next) => {
  withLock(() => {
    const body = req.body || {};
    const db = readDB();
    const quantidade = inteiro(body.quantidade, 'Quantidade', 0, 1000000);
    const material = {
      id: proximoId(db.materiais),
      nome: texto(body.nome, 'Nome', 2, 80),
      categoria: texto(body.categoria, 'Categoria', 2, 40),
      quantidade,
      unidade: texto(body.unidade, 'Unidade', 1, 30),
      quantidadeMinima: inteiro(body.quantidadeMinima, 'Quantidade mínima', 0, 1000000),
      descricao: textoOpcional(body.descricao, 'Descrição', 240),
      fornecedor: textoOpcional(body.fornecedor, 'Fornecedor', 80),
      localizacao: textoOpcional(body.localizacao, 'Localização', 40),
      dataUltimaAtualizacao: hojeSP(),
    };

    db.materiais.push(material);
    let movimento = null;
    if (quantidade > 0) {
      movimento = registrar(
        db,
        material,
        'entrada',
        quantidade,
        'Saldo inicial',
        responsavelDe(body.responsavel),
        0
      );
    }
    db.configuracoes.ultimaAtualizacao = hojeSP();
    writeDB(db);
    return { material, movimento };
  })
    .then((payload) => res.status(201).json(payload))
    .catch(next);
});

app.put('/api/materiais/:id', (req, res, next) => {
  withLock(() => {
    const db = readDB();
    const material = achar(db, idDaRota(req.params.id));
    const body = req.body || {};

    if (body.quantidade != null && Number(body.quantidade) !== material.quantidade) {
      throw new HttpError(400, 'A quantidade muda apenas por entrada ou saída.');
    }

    material.nome = texto(body.nome, 'Nome', 2, 80);
    material.categoria = texto(body.categoria, 'Categoria', 2, 40);
    material.unidade = texto(body.unidade, 'Unidade', 1, 30);
    material.quantidadeMinima = inteiro(body.quantidadeMinima, 'Quantidade mínima', 0, 1000000);
    material.descricao = textoOpcional(body.descricao, 'Descrição', 240);
    material.fornecedor = textoOpcional(body.fornecedor, 'Fornecedor', 80);
    material.localizacao = textoOpcional(body.localizacao, 'Localização', 40);
    material.dataUltimaAtualizacao = hojeSP();
    db.configuracoes.ultimaAtualizacao = hojeSP();
    writeDB(db);
    return { material };
  })
    .then((payload) => res.json(payload))
    .catch(next);
});

app.delete('/api/materiais/:id', (req, res, next) => {
  withLock(() => {
    const db = readDB();
    const id = idDaRota(req.params.id);
    const indice = db.materiais.findIndex((item) => item.id === id);
    if (indice === -1) throw new HttpError(404, 'Material não encontrado.');
    const [removido] = db.materiais.splice(indice, 1);
    db.configuracoes.ultimaAtualizacao = hojeSP();
    writeDB(db);
    return { material: removido };
  })
    .then((payload) => res.json(payload))
    .catch(next);
});

function movimentar(tipo) {
  return (req, res, next) => {
    withLock(() => {
      const db = readDB();
      const material = achar(db, idDaRota(req.params.id));
      const body = req.body || {};
      const quantidade = inteiro(body.quantidade, 'Quantidade', 1, 1000000);
      const motivoPadrao = tipo === 'entrada' ? 'Entrada de estoque' : 'Saída de estoque';
      const motivo = textoOpcional(body.motivo, 'Motivo', 160) || motivoPadrao;
      const responsavel = responsavelDe(body.responsavel);
      const saldoAnterior = material.quantidade;

      if (tipo === 'saida' && quantidade > saldoAnterior) {
        throw new HttpError(
          400,
          `Saída maior que o saldo. Disponível: ${saldoAnterior} ${material.unidade}.`
        );
      }

      material.quantidade = tipo === 'entrada' ? saldoAnterior + quantidade : saldoAnterior - quantidade;
      material.dataUltimaAtualizacao = hojeSP();
      db.configuracoes.ultimaAtualizacao = hojeSP();
      const movimento = registrar(db, material, tipo, quantidade, motivo, responsavel, saldoAnterior);
      writeDB(db);
      return { material, movimento };
    })
      .then((payload) => res.json(payload))
      .catch(next);
  };
}

app.post('/api/materiais/:id/entrada', movimentar('entrada'));
app.post('/api/materiais/:id/saida', movimentar('saida'));

app.put('/api/configuracoes', (req, res, next) => {
  withLock(() => {
    const db = readDB();
    const body = req.body || {};
    db.configuracoes.clinica = texto(body.clinica, 'Nome da clínica', 2, 80);
    db.configuracoes.responsavel = texto(body.responsavel, 'Responsável', 2, 80);
    db.configuracoes.ultimaAtualizacao = hojeSP();
    writeDB(db);
    return { configuracoes: db.configuracoes };
  })
    .then((payload) => res.json(payload))
    .catch(next);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', (_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.parse.failed') {
    res.status(400).json({ erro: 'JSON inválido.' });
    return;
  }
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : 'Erro interno ao processar a solicitação.';
  if (status === 500) console.error(err);
  res.status(status).json({ erro: message });
});

app.listen(PORT, () => {
  console.log(`Almoxarifado em http://localhost:${PORT}`);
});
