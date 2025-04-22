const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  cnpj: {
    type: String,
    trim: true
  },
  telefone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  endereco: {
    cep: {
      type: String,
      trim: true
    },
    logradouro: {
      type: String,
      trim: true
    },
    numero: {
      type: String,
      trim: true
    },
    complemento: {
      type: String,
      trim: true
    },
    bairro: {
      type: String,
      trim: true
    },
    cidade: {
      type: String,
      trim: true
    },
    estado: {
      type: String,
      trim: true
    }
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now
  }
});

// Atualizar data de atualização antes de salvar
ClienteSchema.pre('save', function(next) {
  this.dataAtualizacao = Date.now();
  next();
});

module.exports = mongoose.model('Cliente', ClienteSchema);
