const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false
  },
  cargo: {
    type: String,
    enum: ['admin', 'gerente', 'operador'],
    default: 'operador'
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  ultimoAcesso: {
    type: Date
  }
});

// Criptografar senha antes de salvar
UserSchema.pre('save', async function(next) {
  // Só executa se a senha foi modificada
  if (!this.isModified('senha')) {
    return next();
  }

  try {
    // Gerar salt
    const salt = await bcrypt.genSalt(10);
    
    // Criptografar senha
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
UserSchema.methods.compararSenha = async function(senhaInformada) {
  return await bcrypt.compare(senhaInformada, this.senha);
};

module.exports = mongoose.model('User', UserSchema);
