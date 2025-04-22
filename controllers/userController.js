const User = require('../models/User');

// @desc    Obter todos os usuários
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const usuarios = await User.find().select('-senha');
    
    res.status(200).json({
      error: false,
      count: usuarios.length,
      users: usuarios
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.params.id).select('-senha');
    
    if (!usuario) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado'
      });
    }
    
    res.status(200).json({
      error: false,
      user: usuario
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar usuário
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { nome, email, senha, cargo } = req.body;
    
    // Verificar se o email já está em uso
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        error: true,
        message: 'Email já está em uso'
      });
    }
    
    // Criar usuário
    const usuario = await User.create({
      nome,
      email,
      senha,
      cargo: cargo || 'operador'
    });
    
    res.status(201).json({
      error: false,
      user: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { nome, email, cargo } = req.body;
    
    // Verificar se o usuário existe
    let usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se o email já está em uso por outro usuário
    if (email && email !== usuario.email) {
      const emailExistente = await User.findOne({ email });
      if (emailExistente) {
        return res.status(400).json({
          error: true,
          message: 'Email já está em uso'
        });
      }
    }
    
    // Atualizar usuário
    usuario = await User.findByIdAndUpdate(
      req.params.id,
      { nome, email, cargo },
      { new: true, runValidators: true }
    ).select('-senha');
    
    res.status(200).json({
      error: false,
      user: usuario
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Excluir usuário
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    // Verificar se o usuário existe
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se está tentando excluir o próprio usuário
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        error: true,
        message: 'Você não pode excluir seu próprio usuário'
      });
    }
    
    // Excluir usuário
    await usuario.remove();
    
    res.status(200).json({
      error: false,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
