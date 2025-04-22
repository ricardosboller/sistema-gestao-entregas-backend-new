const mongoose = require('mongoose');

const EntregaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'Cliente é obrigatório']
  },
  dataEntrega: {
    type: Date,
    required: [true, 'Data de entrega é obrigatória']
  },
  motorista: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['agendada', 'em_transito', 'entregue', 'cancelada'],
    default: 'agendada'
  },
  valorTotal: {
    type: Number,
    required: [true, 'Valor total é obrigatório'],
    min: [0, 'Valor total não pode ser negativo']
  },
  produtos: [
    {
      nome: {
        type: String,
        required: [true, 'Nome do produto é obrigatório'],
        trim: true
      },
      quantidade: {
        type: Number,
        required: [true, 'Quantidade é obrigatória'],
        min: [1, 'Quantidade deve ser pelo menos 1']
      },
      valorUnitario: {
        type: Number,
        required: [true, 'Valor unitário é obrigatório'],
        min: [0, 'Valor unitário não pode ser negativo']
      }
    }
  ],
  observacoes: {
    type: String,
    trim: true
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now
  },
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  atualizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Atualizar data de atualização antes de salvar
EntregaSchema.pre('save', function(next) {
  this.dataAtualizacao = Date.now();
  next();
});

// Middleware para popular cliente ao buscar entregas
EntregaSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'cliente',
    select: 'nome email telefone'
  });
  next();
});

module.exports = mongoose.model('Entrega', EntregaSchema);
