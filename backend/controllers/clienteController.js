const Cliente = require('../models/Cliente');

// @desc    Obter todos os clientes
// @route   GET /api/clientes
// @access  Private
exports.getClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.find();
    
    res.status(200).json({
      error: false,
      count: clientes.length,
      clientes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter cliente por ID
// @route   GET /api/clientes/:id
// @access  Private
exports.getClienteById = async (req, res, next) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        error: true,
        message: 'Cliente não encontrado'
      });
    }
    
    res.status(200).json({
      error: false,
      cliente
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar cliente
// @route   POST /api/clientes
// @access  Private
exports.createCliente = async (req, res, next) => {
  try {
    // Criar cliente
    const cliente = await Cliente.create(req.body);
    
    res.status(201).json({
      error: false,
      cliente
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar cliente
// @route   PUT /api/clientes/:id
// @access  Private
exports.updateCliente = async (req, res, next) => {
  try {
    // Verificar se o cliente existe
    let cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({
        error: true,
        message: 'Cliente não encontrado'
      });
    }
    
    // Atualizar cliente
    cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      error: false,
      cliente
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Excluir cliente
// @route   DELETE /api/clientes/:id
// @access  Private
exports.deleteCliente = async (req, res, next) => {
  try {
    // Verificar se o cliente existe
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({
        error: true,
        message: 'Cliente não encontrado'
      });
    }
    
    // Excluir cliente
    await cliente.remove();
    
    res.status(200).json({
      error: false,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buscar clientes
// @route   GET /api/clientes/busca
// @access  Private
exports.buscarClientes = async (req, res, next) => {
  try {
    const { termo } = req.query;
    
    if (!termo) {
      return res.status(400).json({
        error: true,
        message: 'Termo de busca é obrigatório'
      });
    }
    
    // Criar expressão regular para busca case-insensitive
    const regex = new RegExp(termo, 'i');
    
    // Buscar clientes que correspondem ao termo
    const clientes = await Cliente.find({
      $or: [
        { nome: regex },
        { email: regex },
        { telefone: regex },
        { cnpj: regex },
        { 'endereco.cidade': regex },
        { 'endereco.estado': regex }
      ]
    });
    
    res.status(200).json({
      error: false,
      count: clientes.length,
      clientes
    });
  } catch (error) {
    next(error);
  }
};
