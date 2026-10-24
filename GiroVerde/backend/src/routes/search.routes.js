import { Router } from 'express';
import { consultarMaterial } from '../controllers/search.controller.js';

const router = Router();

// Rota de busca consolidada de materiais, orientações e pontos
router.get('/', consultarMaterial);

export default router;

