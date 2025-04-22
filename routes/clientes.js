const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  buscarClientes
} = require('../controllers/clienteController');

// Todas as rotas de clientes requerem autenticação
router.use(protect);

// Rota de busca
router.get('/busca', buscarClientes);

// Rotas de clientes
router.route('/')
  .get(getClientes)
  .post(createCliente);

router.route('/:id')
  .get(getClienteById)
  .put(updateCliente)
  .delete(deleteCliente);

module.exports = router;
