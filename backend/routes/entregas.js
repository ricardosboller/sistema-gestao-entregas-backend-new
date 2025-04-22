const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getEntregas,
  getEntregaById,
  createEntrega,
  updateEntrega,
  deleteEntrega,
  updateStatus,
  getEstatisticas
} = require('../controllers/entregaController');

// Todas as rotas de entregas requerem autenticação
router.use(protect);

// Rota de estatísticas
router.get('/estatisticas', getEstatisticas);

// Rotas de entregas
router.route('/')
  .get(getEntregas)
  .post(createEntrega);

router.route('/:id')
  .get(getEntregaById)
  .put(updateEntrega)
  .delete(deleteEntrega);

// Rota para atualizar status
router.put('/:id/status', updateStatus);

module.exports = router;
