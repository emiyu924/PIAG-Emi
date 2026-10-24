import { Router } from 'express';
import { listarCategorias } from '../controllers/categoria.controller.js';

const router = Router();

// Rota para listagem de categorias
router.get('/', listarCategorias);

export default router;

