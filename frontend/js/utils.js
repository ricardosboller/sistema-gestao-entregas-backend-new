// Funções utilitárias para o sistema

// Formatação de data
const formatarData = (data) => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
};

// Formatação de moeda
const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

// Formatação de status
const formatarStatus = (status) => {
    const statusMap = {
        'agendada': 'Agendada',
        'em_transito': 'Em Trânsito',
        'entregue': 'Entregue',
        'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
};

// Formatação de cargo
const formatarCargo = (cargo) => {
    const cargoMap = {
        'admin': 'Administrador',
        'gerente': 'Gerente',
        'operador': 'Operador'
    };
    return cargoMap[cargo] || cargo;
};

// Mostrar loading
const mostrarLoading = () => {
    document.getElementById('loading-overlay').style.display = 'flex';
};

// Esconder loading
const esconderLoading = () => {
    document.getElementById('loading-overlay').style.display = 'none';
};

// Mostrar modal de alerta
const mostrarAlerta = (mensagem, callback) => {
    const modal = document.getElementById('modal-alerta');
    const mensagemElement = document.getElementById('modal-alerta-mensagem');
    const btnOk = document.getElementById('btn-alerta-ok');
    
    mensagemElement.textContent = mensagem;
    modal.style.display = 'block';
    
    btnOk.onclick = () => {
        modal.style.display = 'none';
        if (callback) callback();
    };
    
    document.querySelector('#modal-alerta .close').onclick = () => {
        modal.style.display = 'none';
        if (callback) callback();
    };
};

// Mostrar modal de confirmação
const mostrarConfirmacao = (mensagem, callbackConfirmar, callbackCancelar) => {
    const modal = document.getElementById('modal-confirmar');
    const mensagemElement = document.getElementById('modal-confirmar-mensagem');
    const btnOk = document.getElementById('btn-confirmar-ok');
    const btnCancelar = document.getElementById('btn-confirmar-cancelar');
    
    mensagemElement.textContent = mensagem;
    modal.style.display = 'block';
    
    btnOk.onclick = () => {
        modal.style.display = 'none';
        if (callbackConfirmar) callbackConfirmar();
    };
    
    btnCancelar.onclick = () => {
        modal.style.display = 'none';
        if (callbackCancelar) callbackCancelar();
    };
    
    document.querySelector('#modal-confirmar .close').onclick = () => {
        modal.style.display = 'none';
        if (callbackCancelar) callbackCancelar();
    };
};

// Validar formulário
const validarFormulario = (form) => {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let valido = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
            valido = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    return valido;
};

// Verificar permissão de usuário
const verificarPermissao = (cargoNecessario) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return false;
    
    if (cargoNecessario === 'admin') {
        return usuario.cargo === 'admin';
    }
    
    if (cargoNecessario === 'gerente') {
        return usuario.cargo === 'admin' || usuario.cargo === 'gerente';
    }
    
    return true; // Todos têm permissão de operador
};

// Gerar cores aleatórias para gráficos
const gerarCores = (quantidade) => {
    const cores = [];
    const coresPredefinidas = [
        'rgba(74, 109, 167, 0.7)',
        'rgba(46, 204, 113, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(231, 76, 60, 0.7)',
        'rgba(52, 152, 219, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(230, 126, 34, 0.7)',
        'rgba(149, 165, 166, 0.7)'
    ];
    
    for (let i = 0; i < quantidade; i++) {
        if (i < coresPredefinidas.length) {
            cores.push(coresPredefinidas[i]);
        } else {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            cores.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
    }
    
    return cores;
};

// Calcular estatísticas de entregas
const calcularEstatisticasEntregas = (entregas) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const estatisticas = {
        total: entregas.length,
        entregasHoje: 0,
        entregasConcluidas: 0,
        entregasPendentes: 0,
        valorTotal: 0
    };
    
    entregas.forEach(entrega => {
        // Calcular valor total
        estatisticas.valorTotal += entrega.valorTotal || 0;
        
        // Verificar se é entrega de hoje
        const dataEntrega = new Date(entrega.dataEntrega);
        dataEntrega.setHours(0, 0, 0, 0);
        if (dataEntrega.getTime() === hoje.getTime()) {
            estatisticas.entregasHoje++;
        }
        
        // Verificar status
        if (entrega.status === 'entregue') {
            estatisticas.entregasConcluidas++;
        } else if (entrega.status === 'agendada' || entrega.status === 'em_transito') {
            estatisticas.entregasPendentes++;
        }
    });
    
    return estatisticas;
};

// Obter dados para gráfico de status
const obterDadosGraficoStatus = (entregas) => {
    const statusCount = {
        'agendada': 0,
        'em_transito': 0,
        'entregue': 0,
        'cancelada': 0
    };
    
    entregas.forEach(entrega => {
        if (statusCount[entrega.status] !== undefined) {
            statusCount[entrega.status]++;
        }
    });
    
    return {
        labels: ['Agendada', 'Em Trânsito', 'Entregue', 'Cancelada'],
        data: [
            statusCount.agendada,
            statusCount.em_transito,
            statusCount.entregue,
            statusCount.cancelada
        ]
    };
};

// Obter dados para gráfico de entregas por dia da semana
const obterDadosGraficoSemana = (entregas) => {
    const hoje = new Date();
    const diasSemana = [];
    const dadosSemana = [0, 0, 0, 0, 0, 0, 0];
    
    // Gerar últimos 7 dias
    for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() - i);
        diasSemana.push(data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }));
    }
    
    // Contar entregas por dia
    entregas.forEach(entrega => {
        const dataEntrega = new Date(entrega.dataEntrega);
        for (let i = 0; i < 7; i++) {
            const data = new Date(hoje);
            data.setDate(hoje.getDate() - (6 - i));
            
            if (dataEntrega.getDate() === data.getDate() &&
                dataEntrega.getMonth() === data.getMonth() &&
                dataEntrega.getFullYear() === data.getFullYear()) {
                dadosSemana[i]++;
                break;
            }
        }
    });
    
    return {
        labels: diasSemana,
        data: dadosSemana
    };
};

// Ordenar entregas por data
const ordenarEntregasPorData = (entregas, crescente = true) => {
    return [...entregas].sort((a, b) => {
        const dataA = new Date(a.dataEntrega);
        const dataB = new Date(b.dataEntrega);
        return crescente ? dataA - dataB : dataB - dataA;
    });
};

// Filtrar entregas por período
const filtrarEntregasPorPeriodo = (entregas, dataInicio, dataFim) => {
    if (!dataInicio && !dataFim) return entregas;
    
    return entregas.filter(entrega => {
        const dataEntrega = new Date(entrega.dataEntrega);
        dataEntrega.setHours(0, 0, 0, 0);
        
        if (dataInicio && dataFim) {
            const inicio = new Date(dataInicio);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);
            return dataEntrega >= inicio && dataEntrega <= fim;
        } else if (dataInicio) {
            const inicio = new Date(dataInicio);
            inicio.setHours(0, 0, 0, 0);
            return dataEntrega >= inicio;
        } else if (dataFim) {
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);
            return dataEntrega <= fim;
        }
        
        return true;
    });
};

// Filtrar entregas por status
const filtrarEntregasPorStatus = (entregas, status) => {
    if (!status || status === 'todos') return entregas;
    return entregas.filter(entrega => entrega.status === status);
};

// Filtrar entregas por cliente
const filtrarEntregasPorCliente = (entregas, clienteId) => {
    if (!clienteId) return entregas;
    return entregas.filter(entrega => entrega.cliente._id === clienteId || entrega.cliente === clienteId);
};

// Buscar entregas por texto
const buscarEntregas = (entregas, texto) => {
    if (!texto) return entregas;
    
    const termoBusca = texto.toLowerCase();
    return entregas.filter(entrega => {
        // Buscar por nome do cliente
        if (entrega.cliente && typeof entrega.cliente === 'object' && entrega.cliente.nome) {
            if (entrega.cliente.nome.toLowerCase().includes(termoBusca)) {
                return true;
            }
        }
        
        // Buscar por observações
        if (entrega.observacoes && entrega.observacoes.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        // Buscar por valor
        if (entrega.valorTotal && entrega.valorTotal.toString().includes(termoBusca)) {
            return true;
        }
        
        return false;
    });
};

// Buscar clientes por texto
const buscarClientes = (clientes, texto) => {
    if (!texto) return clientes;
    
    const termoBusca = texto.toLowerCase();
    return clientes.filter(cliente => {
        // Buscar por nome
        if (cliente.nome && cliente.nome.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        // Buscar por CNPJ
        if (cliente.cnpj && cliente.cnpj.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        // Buscar por email
        if (cliente.email && cliente.email.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        // Buscar por telefone
        if (cliente.telefone && cliente.telefone.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        // Buscar por cidade
        if (cliente.endereco && cliente.endereco.cidade && 
            cliente.endereco.cidade.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        return false;
    });
};

// Exportar funções utilitárias
const Utils = {
    formatarData,
    formatarMoeda,
    formatarStatus,
    formatarCargo,
    mostrarLoading,
    esconderLoading,
    mostrarAlerta,
    mostrarConfirmacao,
    validarFormulario,
    verificarPermissao,
    gerarCores,
    calcularEstatisticasEntregas,
    obterDadosGraficoStatus,
    obterDadosGraficoSemana,
    ordenarEntregasPorData,
    filtrarEntregasPorPeriodo,
    filtrarEntregasPorStatus,
    filtrarEntregasPorCliente,
    buscarEntregas,
    buscarClientes
};
