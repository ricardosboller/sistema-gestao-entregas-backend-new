// Configuração do servidor Express
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clienteRoutes = require('./routes/clientes');
const entregaRoutes = require('./routes/entregas');
const relatorioRoutes = require('./routes/relatorios');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar app Express
const app = express();

// Configurar porta
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/relatorios', relatorioRoutes);

// Rota para verificar status da API
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'API do Sistema de Gestão de Entregas funcionando!',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  // Servir arquivos estáticos da pasta 'public'
  app.use(express.static(path.join(__dirname, 'public')));

  // Todas as rotas não encontradas redirecionam para index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
