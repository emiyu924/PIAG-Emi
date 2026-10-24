import { criarApp } from './app.js';
import { testarConexaoBanco } from './config/database.js';

const PORTA = process.env.PORT || 3001;
const app = criarApp();

// Inicia o servidor HTTP e verifica a conexão com o banco
export async function iniciarServidor() {
  await testarConexaoBanco();
  return app.listen(PORTA, () => {
    console.log(`[GiroVerde API] Servidor rodando em http://localhost:${PORTA}`);
  });
}

iniciarServidor();
