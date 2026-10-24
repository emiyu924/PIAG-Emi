import { Router } from 'express';
import searchRoutes from './search.routes.js';
import categoriaRoutes from './categoria.routes.js';
import materialRoutes from './material.routes.js';

const router = Router();

// Agrupamento das rotas da API
router.use('/consultas', searchRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/materiais', materialRoutes);

export default router;

