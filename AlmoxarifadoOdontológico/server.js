const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Utilitário: lê o banco de dados
function lerDB() {
  const dados = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(dados);
}

// Utilitário: salva no banco de dados
function salvarDB(dados) {
  fs.writeFileSync(DB_PATH, JSON.stringify(dados, null, 2), 'utf-8');
}

// Utilitário: gera data atual no formato yyyy-mm-dd
function dataAtual() {
  return new Date().toISOString().split('T')[0];
}

// GET /api/materiais - Lista todos os materiais
app.get('/api/materiais', (req, res) => {
  const db = lerDB();
  const { categoria, busca } = req.query;

  let resultado = db.materiais;

  if (categoria && categoria !== 'todas') {
    resultado = resultado.filter(m => m.categoria === categoria);
  }

  if (busca) {
    const termo = busca.toLowerCase();
    resultado = resultado.filter(
      m =>
        m.nome.toLowerCase().includes(termo) ||
        m.descricao.toLowerCase().includes(termo) ||
        m.fornecedor.toLowerCase().includes(termo)
    );
  }

  res.json(resultado);
});

// GET /api/materiais/:id - Busca material por ID
app.get('/api/materiais/:id', (req, res) => {
  const db = lerDB();
  const material = db.materiais.find(m => m.id === parseInt(req.params.id));

  if (!material) {
    return res.status(404).json({ erro: 'Material não encontrado' });
  }

  res.json(material);
});

// POST /api/materiais - Cria novo material
app.post('/api/materiais', (req, res) => {
  const db = lerDB();
  const { nome, categoria, quantidade, unidade, quantidadeMinima, descricao, fornecedor, localizacao } = req.body;

  if (!nome || !categoria || quantidade === undefined || !unidade) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, categoria, quantidade, unidade' });
  }

  const novoId = db.materiais.length > 0
    ? Math.max(...db.materiais.map(m => m.id)) + 1
    : 1;

  const novoMaterial = {
    id: novoId,
    nome,
    categoria,
    quantidade: parseInt(quantidade),
    unidade,
    quantidadeMinima: parseInt(quantidadeMinima) || 0,
    descricao: descricao || '',
    fornecedor: fornecedor || '',
    localizacao: localizacao || '',
    dataUltimaAtualizacao: dataAtual()
  };

  db.materiais.push(novoMaterial);
  salvarDB(db);

  res.status(201).json(novoMaterial);
});

// PUT /api/materiais/:id - Atualiza material completo
app.put('/api/materiais/:id', (req, res) => {
  const db = lerDB();
  const idx = db.materiais.findIndex(m => m.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ erro: 'Material não encontrado' });
  }

  db.materiais[idx] = {
    ...db.materiais[idx],
    ...req.body,
    id: parseInt(req.params.id),
    dataUltimaAtualizacao: dataAtual()
  };

  salvarDB(db);
  res.json(db.materiais[idx]);
});

// PATCH /api/materiais/:id/quantidade - Ajusta quantidade (+/-)
app.patch('/api/materiais/:id/quantidade', (req, res) => {
  const db = lerDB();
  const { operacao, valor, motivo } = req.body;
  const idx = db.materiais.findIndex(m => m.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ erro: 'Material não encontrado' });
  }

  if (!['adicionar', 'remover'].includes(operacao) || !valor || valor <= 0) {
    return res.status(400).json({ erro: 'Informe operacao (adicionar|remover) e valor positivo' });
  }

  const material = db.materiais[idx];
  const qtdAntes = material.quantidade;

  if (operacao === 'remover' && valor > material.quantidade) {
    return res.status(400).json({ erro: 'Quantidade insuficiente em estoque' });
  }

  material.quantidade = operacao === 'adicionar'
    ? material.quantidade + parseInt(valor)
    : material.quantidade - parseInt(valor);

  material.dataUltimaAtualizacao = dataAtual();

  // Registra a movimentação
  db.movimentacoes.push({
    id: db.movimentacoes.length + 1,
    materialId: material.id,
    materialNome: material.nome,
    operacao,
    valor: parseInt(valor),
    quantidadeAntes: qtdAntes,
    quantidadeDepois: material.quantidade,
    motivo: motivo || '',
    data: new Date().toISOString()
  });

  salvarDB(db);
  res.json(material);
});

// DELETE /api/materiais/:id - Remove material
app.delete('/api/materiais/:id', (req, res) => {
  const db = lerDB();
  const idx = db.materiais.findIndex(m => m.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ erro: 'Material não encontrado' });
  }

  const removido = db.materiais.splice(idx, 1)[0];
  salvarDB(db);

  res.json({ mensagem: 'Material removido com sucesso', material: removido });
});

// GET /api/categorias - Lista categorias únicas
app.get('/api/categorias', (req, res) => {
  const db = lerDB();
  const categorias = [...new Set(db.materiais.map(m => m.categoria))].sort();
  res.json(categorias);
});

// GET /api/movimentacoes - Lista movimentações
app.get('/api/movimentacoes', (req, res) => {
  const db = lerDB();
  const ultimas = db.movimentacoes.slice(-50).reverse();
  res.json(ultimas);
});

// GET /api/dashboard - Estatísticas gerais
app.get('/api/dashboard', (req, res) => {
  const db = lerDB();
  const materiais = db.materiais;

  const stats = {
    totalMateriais: materiais.length,
    totalItens: materiais.reduce((acc, m) => acc + m.quantidade, 0),
    estoqueBaixo: materiais.filter(m => m.quantidade <= m.quantidadeMinima).length,
    categorias: [...new Set(materiais.map(m => m.categoria))].length,
    materiaisEstoqueBaixo: materiais
      .filter(m => m.quantidade <= m.quantidadeMinima)
      .map(m => ({ id: m.id, nome: m.nome, quantidade: m.quantidade, quantidadeMinima: m.quantidadeMinima }))
  };

  res.json(stats);
});

// Rota fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

