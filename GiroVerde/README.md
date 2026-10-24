# GiroVerde 🌱

Aplicação completa para educação ambiental e descarte correto de resíduos, conectando cidadãos a orientações de descarte, dicas sustentáveis e pontos de coleta compatíveis.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: v18+ (testado no v24)
- **NPM**: v9+
- **PostgreSQL** (opcional: caso não esteja rodando localmente, o sistema utiliza automaticamente a base em memória de demonstração).

---

### 1. Iniciar o Back-end
Abra um terminal e execute:
```bash
cd backend
npm install
npm run dev
```
> O servidor da API iniciará em: **http://localhost:3001**

### 2. Iniciar o Front-end
Em outro terminal, execute:
```bash
cd frontend
npm install
npm run dev
```
> A aplicação web abrirá em: **http://localhost:5173**

---

## 🗄️ Banco de Dados PostgreSQL (Opcional / Produção)

Para utilizar o PostgreSQL:
1. Crie uma base de dados chamada `giroverde`:
   ```sql
   CREATE DATABASE giroverde;
   ```
2. Execute os scripts localizados em `backend/database/`:
   - `schema.sql`: Criação das tabelas, chaves estrangeiras e índices.
   - `seed.sql`: Carga inicial de categorias, materiais, orientações, pontos de coleta e dicas.
3. Configure o arquivo `.env` dentro da pasta `backend`:
   ```env
   PORT=3001
   DATABASE_URL=postgres://usuario:senha@localhost:5432/giroverde
   ```

---

## 🏗️ Arquitetura e Estrutura

- **Frontend (React + Vite)**:
  - Componentes modulares com responsabilidade única (SOLID).
  - Consulta em tempo real via REST API.
  - Interface responsiva com foco em usabilidade (RF01 - RF10).
- **Backend (Node.js + Express)**:
  - Arquitetura em camadas: `routes` -> `controllers` -> `services` -> `repositories`.
  - Regra de compatibilidade de pontos (RN03).
  - Tratamento resiliente de ausência de resultados (RF09).

