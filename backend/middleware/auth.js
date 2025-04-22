const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar autenticação
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Verificar se o token está presente no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Verificar se o token existe
    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Não autorizado. Faça login para acessar este recurso.'
      });
    }
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar se o usuário ainda existe
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          error: true,
          message: 'O usuário associado a este token não existe mais.'
        });
      }
      
      // Adicionar usuário à requisição
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        error: true,
        message: 'Token inválido ou expirado. Faça login novamente.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware para restringir acesso por cargo
exports.authorize = (...cargos) => {
  return (req, res, next) => {
    if (!cargos.includes(req.user.cargo)) {
      return res.status(403).json({
        error: true,
        message: `Usuário com cargo '${req.user.cargo}' não tem permissão para acessar este recurso.`
      });
    }
    next();
  };
};
