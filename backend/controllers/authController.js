const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Gerar token JWT
const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
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
      cargo: cargo || 'operador' // Cargo padrão é operador
    });

    // Gerar token
    const token = gerarToken(usuario._id);

    res.status(201).json({
      error: false,
      token,
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

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Verificar se email e senha foram fornecidos
    if (!email || !senha) {
      return res.status(400).json({
        error: true,
        message: 'Por favor, forneça email e senha'
      });
    }

    // Verificar se o usuário existe
    const usuario = await User.findOne({ email }).select('+senha');
    if (!usuario) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se a senha está correta
    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas'
      });
    }

    // Atualizar último acesso
    usuario.ultimoAcesso = Date.now();
    await usuario.save({ validateBeforeSave: false });

    // Gerar token
    const token = gerarToken(usuario._id);

    res.status(200).json({
      error: false,
      token,
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

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.user.id);

    res.status(200).json({
      error: false,
      user: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        dataCriacao: usuario.dataCriacao,
        ultimoAcesso: usuario.ultimoAcesso
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Alterar senha
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // Verificar se as senhas foram fornecidas
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        error: true,
        message: 'Por favor, forneça a senha atual e a nova senha'
      });
    }

    // Verificar se a nova senha tem pelo menos 6 caracteres
    if (novaSenha.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Obter usuário com senha
    const usuario = await User.findById(req.user.id).select('+senha');

    // Verificar se a senha atual está correta
    const senhaCorreta = await usuario.compararSenha(senhaAtual);
    if (!senhaCorreta) {
      return res.status(401).json({
        error: true,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    usuario.senha = novaSenha;
    await usuario.save();

    res.status(200).json({
      error: false,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Configuração inicial (criar usuário admin)
// @route   POST /api/auth/setup
// @access  Public
exports.setup = async (req, res, next) => {
  try {
    // Verificar se já existe algum usuário admin
    const adminExists = await User.findOne({ cargo: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({
        error: true,
        message: 'Configuração inicial já foi realizada'
      });
    }
    
    // Criar usuário admin
    const admin = await User.create({
      nome: 'Administrador',
      email: 'admin@bthgroup.com',
      senha: 'admin123',
      cargo: 'admin'
    });
    
    res.status(201).json({
      error: false,
      message: 'Usuário admin criado com sucesso',
      user: {
        id: admin._id,
        nome: admin.nome,
        email: admin.email,
        cargo: admin.cargo
      }
    });
  } catch (error) {
    next(error);
  }
};
