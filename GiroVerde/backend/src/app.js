import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Cria e configura a aplicação Express
export function criarApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Endpoint de verificação de integridade da API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', servico: 'GiroVerde API' });
  });

  app.use('/api', routes);
  app.use(errorHandler);
  return app;
}

