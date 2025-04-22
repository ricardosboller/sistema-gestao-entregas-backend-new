const Entrega = require('../models/Entrega');
const Cliente = require('../models/Cliente');
const mongoose = require('mongoose');

// @desc    Obter todas as entregas
// @route   GET /api/entregas
// @access  Private
exports.getEntregas = async (req, res, next) => {
  try {
    // Opções de filtro
    const { status, dataInicio, dataFim, cliente } = req.query;
    const filtro = {};
    
    // Filtrar por status
    if (status) {
      filtro.status = status;
    }
    
    // Filtrar por data
    if (dataInicio || dataFim) {
      filtro.dataEntrega = {};
      if (dataInicio) {
        filtro.dataEntrega.$gte = new Date(dataInicio);
      }
      if (dataFim) {
        filtro.dataEntrega.$lte = new Date(dataFim);
      }
    }
    
    // Filtrar por cliente
    if (cliente) {
      filtro.cliente = cliente;
    }
    
    const entregas = await Entrega.find(filtro)
      .sort({ dataEntrega: -1 })
      .populate('cliente', 'nome email telefone');
    
    res.status(200).json({
      error: false,
      count: entregas.length,
      entregas
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter entrega por ID
// @route   GET /api/entregas/:id
// @access  Private
exports.getEntregaById = async (req, res, next) => {
  try {
    const entrega = await Entrega.findById(req.params.id)
      .populate('cliente', 'nome email telefone endereco');
    
    if (!entrega) {
      return res.status(404).json({
        error: true,
        message: 'Entrega não encontrada'
      });
    }
    
    res.status(200).json({
      error: false,
      entrega
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar entrega
// @route   POST /api/entregas
// @access  Private
exports.createEntrega = async (req, res, next) => {
  try {
    // Verificar se o cliente existe
    const clienteExiste = await Cliente.findById(req.body.cliente);
    if (!clienteExiste) {
      return res.status(404).json({
        error: true,
        message: 'Cliente não encontrado'
      });
    }
    
    // Adicionar usuário que criou a entrega
    req.body.criadoPor = req.user.id;
    
    // Criar entrega
    const entrega = await Entrega.create(req.body);
    
    // Buscar entrega com cliente populado
    const entregaPopulada = await Entrega.findById(entrega._id)
      .populate('cliente', 'nome email telefone');
    
    res.status(201).json({
      error: false,
      entrega: entregaPopulada
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar entrega
// @route   PUT /api/entregas/:id
// @access  Private
exports.updateEntrega = async (req, res, next) => {
  try {
    // Verificar se a entrega existe
    let entrega = await Entrega.findById(req.params.id);
    if (!entrega) {
      return res.status(404).json({
        error: true,
        message: 'Entrega não encontrada'
      });
    }
    
    // Verificar se o cliente existe (se estiver sendo atualizado)
    if (req.body.cliente) {
      const clienteExiste = await Cliente.findById(req.body.cliente);
      if (!clienteExiste) {
        return res.status(404).json({
          error: true,
          message: 'Cliente não encontrado'
        });
      }
    }
    
    // Adicionar usuário que atualizou a entrega
    req.body.atualizadoPor = req.user.id;
    
    // Atualizar entrega
    entrega = await Entrega.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('cliente', 'nome email telefone');
    
    res.status(200).json({
      error: false,
      entrega
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Excluir entrega
// @route   DELETE /api/entregas/:id
// @access  Private
exports.deleteEntrega = async (req, res, next) => {
  try {
    // Verificar se a entrega existe
    const entrega = await Entrega.findById(req.params.id);
    if (!entrega) {
      return res.status(404).json({
        error: true,
        message: 'Entrega não encontrada'
      });
    }
    
    // Excluir entrega
    await entrega.remove();
    
    res.status(200).json({
      error: false,
      message: 'Entrega excluída com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar status da entrega
// @route   PUT /api/entregas/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Verificar se o status é válido
    const statusValidos = ['agendada', 'em_transito', 'entregue', 'cancelada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        error: true,
        message: 'Status inválido'
      });
    }
    
    // Verificar se a entrega existe
    let entrega = await Entrega.findById(req.params.id);
    if (!entrega) {
      return res.status(404).json({
        error: true,
        message: 'Entrega não encontrada'
      });
    }
    
    // Atualizar status
    entrega = await Entrega.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        atualizadoPor: req.user.id
      },
      { new: true, runValidators: true }
    ).populate('cliente', 'nome email telefone');
    
    res.status(200).json({
      error: false,
      entrega
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter estatísticas de entregas
// @route   GET /api/entregas/estatisticas
// @access  Private
exports.getEstatisticas = async (req, res, next) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    // Definir período de filtro
    const filtro = {};
    if (dataInicio || dataFim) {
      filtro.dataEntrega = {};
      if (dataInicio) {
        filtro.dataEntrega.$gte = new Date(dataInicio);
      }
      if (dataFim) {
        filtro.dataEntrega.$lte = new Date(dataFim);
      }
    }
    
    // Estatísticas por status
    const estatisticasPorStatus = await Entrega.aggregate([
      { $match: filtro },
      { $group: {
          _id: '$status',
          count: { $sum: 1 },
          valorTotal: { $sum: '$valorTotal' }
        }
      }
    ]);
    
    // Total de entregas e valor
    const totalEntregas = await Entrega.countDocuments(filtro);
    const valorTotalEntregas = await Entrega.aggregate([
      { $match: filtro },
      { $group: {
          _id: null,
          total: { $sum: '$valorTotal' }
        }
      }
    ]);
    
    // Estatísticas por cliente
    const estatisticasPorCliente = await Entrega.aggregate([
      { $match: filtro },
      { $group: {
          _id: '$cliente',
          count: { $sum: 1 },
          valorTotal: { $sum: '$valorTotal' }
        }
      },
      { $sort: { valorTotal: -1 } },
      { $limit: 10 }
    ]);
    
    // Buscar nomes dos clientes
    const clientesIds = estatisticasPorCliente.map(item => item._id);
    const clientes = await Cliente.find({ _id: { $in: clientesIds } }, 'nome');
    
    // Mapear nomes dos clientes para estatísticas
    const estatisticasPorClienteComNomes = estatisticasPorCliente.map(item => {
      const cliente = clientes.find(c => c._id.toString() === item._id.toString());
      return {
        ...item,
        nomeCliente: cliente ? cliente.nome : 'Cliente não encontrado'
      };
    });
    
    res.status(200).json({
      error: false,
      estatisticas: {
        totalEntregas,
        valorTotal: valorTotalEntregas.length > 0 ? valorTotalEntregas[0].total : 0,
        porStatus: estatisticasPorStatus,
        porCliente: estatisticasPorClienteComNomes
      }
    });
  } catch (error) {
    next(error);
  }
};
