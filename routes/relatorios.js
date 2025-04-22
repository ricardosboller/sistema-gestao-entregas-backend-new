const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Entrega = require('../models/Entrega');
const Cliente = require('../models/Cliente');

// Todas as rotas de relatórios requerem autenticação
router.use(protect);

// @desc    Relatório por período
// @route   GET /api/relatorios/periodo
// @access  Private
router.get('/periodo', async (req, res, next) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        error: true,
        message: 'Data de início e fim são obrigatórias'
      });
    }
    
    // Filtrar entregas por período
    const entregas = await Entrega.find({
      dataEntrega: {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      }
    }).populate('cliente', 'nome');
    
    // Calcular estatísticas
    const totalEntregas = entregas.length;
    const valorTotal = entregas.reduce((total, entrega) => total + entrega.valorTotal, 0);
    
    // Estatísticas por status
    const estatisticasPorStatus = {
      agendada: 0,
      em_transito: 0,
      entregue: 0,
      cancelada: 0
    };
    
    entregas.forEach(entrega => {
      estatisticasPorStatus[entrega.status]++;
    });
    
    res.status(200).json({
      error: false,
      relatorio: {
        periodo: {
          dataInicio,
          dataFim
        },
        totalEntregas,
        valorTotal,
        estatisticasPorStatus,
        entregas
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Relatório por cliente
// @route   GET /api/relatorios/cliente/:id
// @access  Private
router.get('/cliente/:id', async (req, res, next) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const clienteId = req.params.id;
    
    // Verificar se o cliente existe
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({
        error: true,
        message: 'Cliente não encontrado'
      });
    }
    
    // Filtrar entregas por cliente e período (se fornecido)
    const filtro = { cliente: clienteId };
    if (dataInicio || dataFim) {
      filtro.dataEntrega = {};
      if (dataInicio) {
        filtro.dataEntrega.$gte = new Date(dataInicio);
      }
      if (dataFim) {
        filtro.dataEntrega.$lte = new Date(dataFim);
      }
    }
    
    const entregas = await Entrega.find(filtro).sort({ dataEntrega: -1 });
    
    // Calcular estatísticas
    const totalEntregas = entregas.length;
    const valorTotal = entregas.reduce((total, entrega) => total + entrega.valorTotal, 0);
    
    // Estatísticas por status
    const estatisticasPorStatus = {
      agendada: 0,
      em_transito: 0,
      entregue: 0,
      cancelada: 0
    };
    
    entregas.forEach(entrega => {
      estatisticasPorStatus[entrega.status]++;
    });
    
    res.status(200).json({
      error: false,
      relatorio: {
        cliente: {
          id: cliente._id,
          nome: cliente.nome
        },
        periodo: {
          dataInicio: dataInicio || 'Todas',
          dataFim: dataFim || 'Todas'
        },
        totalEntregas,
        valorTotal,
        estatisticasPorStatus,
        entregas
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Relatório de desempenho
// @route   GET /api/relatorios/desempenho
// @access  Private
router.get('/desempenho', async (req, res, next) => {
  try {
    const { periodo } = req.query;
    
    // Definir período de análise
    let dataInicio, dataFim = new Date();
    
    switch (periodo) {
      case 'semana':
        dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - 7);
        break;
      case 'mes':
        dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 1);
        break;
      case 'trimestre':
        dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 3);
        break;
      case 'semestre':
        dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 6);
        break;
      case 'ano':
        dataInicio = new Date();
        dataInicio.setFullYear(dataInicio.getFullYear() - 1);
        break;
      default:
        dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 1);
    }
    
    // Buscar entregas no período
    const entregas = await Entrega.find({
      dataEntrega: {
        $gte: dataInicio,
        $lte: dataFim
      }
    }).populate('cliente', 'nome');
    
    // Calcular estatísticas gerais
    const totalEntregas = entregas.length;
    const valorTotal = entregas.reduce((total, entrega) => total + entrega.valorTotal, 0);
    
    // Estatísticas por status
    const estatisticasPorStatus = {
      agendada: 0,
      em_transito: 0,
      entregue: 0,
      cancelada: 0
    };
    
    entregas.forEach(entrega => {
      estatisticasPorStatus[entrega.status]++;
    });
    
    // Estatísticas por cliente
    const estatisticasPorCliente = {};
    
    entregas.forEach(entrega => {
      const clienteId = entrega.cliente._id.toString();
      const clienteNome = entrega.cliente.nome;
      
      if (!estatisticasPorCliente[clienteId]) {
        estatisticasPorCliente[clienteId] = {
          id: clienteId,
          nome: clienteNome,
          totalEntregas: 0,
          valorTotal: 0
        };
      }
      
      estatisticasPorCliente[clienteId].totalEntregas++;
      estatisticasPorCliente[clienteId].valorTotal += entrega.valorTotal;
    });
    
    // Converter para array e ordenar por valor total
    const clientesArray = Object.values(estatisticasPorCliente).sort((a, b) => b.valorTotal - a.valorTotal);
    
    res.status(200).json({
      error: false,
      relatorio: {
        periodo: {
          nome: periodo || 'mes',
          dataInicio,
          dataFim
        },
        totalEntregas,
        valorTotal,
        estatisticasPorStatus,
        clientesTop: clientesArray.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
