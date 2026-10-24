-- Script DDL de criação do Banco de Dados PostgreSQL - GiroVerde

-- Categorias de resíduos (ex: Plásticos, Metais, Eletrônicos, Resíduos Especiais)
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    icone VARCHAR(50),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materiais específicos pesquisáveis
CREATE TABLE IF NOT EXISTS materiais (
    id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orientações de descarte e preparação para cada material (RF02)
CREATE TABLE IF NOT EXISTS orientacoes_descarte (
    id SERIAL PRIMARY KEY,
    material_id INT NOT NULL UNIQUE REFERENCES materiais(id) ON DELETE CASCADE,
    destino_recomendado TEXT NOT NULL,
    instrucoes_preparo TEXT NOT NULL,
    cuidados_seguranca TEXT,
    fonte VARCHAR(255) NOT NULL,
    data_revisao DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Pontos de coleta cadastrados
CREATE TABLE IF NOT EXISTS pontos_coleta (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(9),
    horario_funcionamento VARCHAR(255),
    contato VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    data_verificacao DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Associação N:N entre materiais e pontos de coleta (RN03 - Compatibilidade)
CREATE TABLE IF NOT EXISTS materiais_pontos_coleta (
    material_id INT NOT NULL REFERENCES materiais(id) ON DELETE CASCADE,
    ponto_coleta_id INT NOT NULL REFERENCES pontos_coleta(id) ON DELETE CASCADE,
    condicoes_recebimento TEXT,
    PRIMARY KEY (material_id, ponto_coleta_id)
);

-- Dicas de reciclagem e conteúdos educativos (RF05)
CREATE TABLE IF NOT EXISTS dicas_reciclagem (
    id SERIAL PRIMARY KEY,
    categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    tema VARCHAR(100) NOT NULL,
    publicado BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Administradores do sistema (RF06, RF07, RF08, RN07)
CREATE TABLE IF NOT EXISTS administradores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de auditoria de alterações
CREATE TABLE IF NOT EXISTS historico_alteracoes (
    id SERIAL PRIMARY KEY,
    administrador_id INT REFERENCES administradores(id) ON DELETE SET NULL,
    tabela_afetada VARCHAR(50) NOT NULL,
    registro_id INT NOT NULL,
    acao VARCHAR(20) NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_materiais_nome ON materiais(nome);
CREATE INDEX IF NOT EXISTS idx_pontos_cidade ON pontos_coleta(cidade);

