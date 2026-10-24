import { Router } from 'express';
import { listarMateriais } from '../controllers/material.controller.js';

const router = Router();

// Rota para listagem de materiais
router.get('/', listarMateriais);

export default router;

