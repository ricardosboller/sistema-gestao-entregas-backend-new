const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  changePassword,
  setup
} = require('../controllers/authController');

// Rota de configuração inicial
router.post('/setup', setup);

// Rotas de autenticação
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
