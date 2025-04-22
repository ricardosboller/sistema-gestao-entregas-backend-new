// Funcionalidades de Relatórios

// Inicializar página de relatórios
const inicializarRelatorios = async () => {
    try {
        Utils.mostrarLoading();
        
        // Verificar autenticação
        if (!Auth.verificarAutenticacao()) {
            return;
        }
        
        // Carregar dados para os selects
        const clientes = await API.Cliente.getAll();
        preencherSelectClientes(clientes);
        
        // Configurar eventos
        configurarEventosRelatorios();
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao inicializar relatórios:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados para relatórios. Por favor, tente novamente.');
    }
};

// Preencher select de clientes
const preencherSelectClientes = (clientes) => {
    const selectClientes = document.querySelectorAll('.select-cliente-relatorio');
    
    selectClientes.forEach(select => {
        // Limpar opções existentes, mantendo a primeira (todos)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Adicionar opções de clientes
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente._id;
            option.textContent = cliente.nome;
            select.appendChild(option);
        });
    });
};

// Configurar eventos da página de relatórios
const configurarEventosRelatorios = () => {
    // Configurar botões de gerar relatório
    const btnRelatorioEntregasPeriodo = document.getElementById('btn-relatorio-entregas-periodo');
    if (btnRelatorioEntregasPeriodo) {
        btnRelatorioEntregasPeriodo.addEventListener('click', gerarRelatorioEntregasPeriodo);
    }
    
    const btnRelatorioEntregasCliente = document.getElementById('btn-relatorio-entregas-cliente');
    if (btnRelatorioEntregasCliente) {
        btnRelatorioEntregasCliente.addEventListener('click', gerarRelatorioEntregasCliente);
    }
    
    const btnRelatorioDesempenho = document.getElementById('btn-relatorio-desempenho');
    if (btnRelatorioDesempenho) {
        btnRelatorioDesempenho.addEventListener('click', gerarRelatorioDesempenho);
    }
    
    // Configurar botões de exportar
    const btnExportarPDF = document.getElementById('btn-exportar-pdf');
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', exportarRelatorioPDF);
    }
    
    const btnExportarExcel = document.getElementById('btn-exportar-excel');
    if (btnExportarExcel) {
        btnExportarExcel.addEventListener('click', exportarRelatorioExcel);
    }
    
    // Configurar botão de imprimir
    const btnImprimir = document.getElementById('btn-imprimir-relatorio');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', imprimirRelatorio);
    }
};

// Gerar relatório de entregas por período
const gerarRelatorioEntregasPeriodo = async () => {
    try {
        // Validar datas
        const dataInicio = document.getElementById('relatorio-periodo-inicio').value;
        const dataFim = document.getElementById('relatorio-periodo-fim').value;
        
        if (!dataInicio || !dataFim) {
            Utils.mostrarAlerta('Por favor, selecione as datas de início e fim do período.');
            return;
        }
        
        Utils.mostrarLoading();
        
        // Buscar dados para o relatório
        const params = {
            dataInicio,
            dataFim
        };
        
        const relatorio = await API.Entrega.getRelatorio('periodo', params);
        
        // Exibir relatório
        exibirRelatorioEntregasPeriodo(relatorio, dataInicio, dataFim);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao gerar relatório de entregas por período:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao gerar relatório. Por favor, tente novamente.');
    }
};

// Exibir relatório de entregas por período
const exibirRelatorioEntregasPeriodo = (relatorio, dataInicio, dataFim) => {
    // Mostrar seção de relatório
    document.getElementById('relatorio-resultado').style.display = 'block';
    
    // Atualizar título do relatório
    document.getElementById('relatorio-titulo').textContent = 'Relatório de Entregas por Período';
    document.getElementById('relatorio-subtitulo').textContent = 
        `Período: ${Utils.formatarData(dataInicio)} a ${Utils.formatarData(dataFim)}`;
    
    // Atualizar estatísticas
    document.getElementById('relatorio-total-entregas').textContent = relatorio.totalEntregas;
    document.getElementById('relatorio-entregas-concluidas').textContent = relatorio.entregasConcluidas;
    document.getElementById('relatorio-entregas-pendentes').textContent = relatorio.entregasPendentes;
    document.getElementById('relatorio-valor-total').textContent = Utils.formatarMoeda(relatorio.valorTotal);
    
    // Atualizar gráfico de status
    atualizarGraficoStatusRelatorio(relatorio.statusCount);
    
    // Atualizar tabela de entregas
    const tbody = document.querySelector('#tabela-relatorio tbody');
    tbody.innerHTML = '';
    
    if (relatorio.entregas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhuma entrega encontrada no período</td>';
        tbody.appendChild(tr);
        return;
    }
    
    relatorio.entregas.forEach(entrega => {
        const tr = document.createElement('tr');
        
        // Formatar nome do cliente
        const nomeCliente = entrega.cliente && typeof entrega.cliente === 'object' ? 
            entrega.cliente.nome : 'Cliente não especificado';
        
        tr.innerHTML = `
            <td>${Utils.formatarData(entrega.dataEntrega)}</td>
            <td>${nomeCliente}</td>
            <td>${entrega.motorista || 'Não informado'}</td>
            <td>${Utils.formatarMoeda(entrega.valorTotal)}</td>
            <td><span class="status-badge status-${entrega.status}">${Utils.formatarStatus(entrega.status)}</span></td>
            <td>${entrega.observacoes ? entrega.observacoes.substring(0, 30) + '...' : 'Sem observações'}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Rolar para a seção de relatório
    document.getElementById('relatorio-resultado').scrollIntoView({ behavior: 'smooth' });
};

// Gerar relatório de entregas por cliente
const gerarRelatorioEntregasCliente = async () => {
    try {
        // Validar cliente
        const clienteId = document.getElementById('relatorio-cliente').value;
        
        if (!clienteId) {
            Utils.mostrarAlerta('Por favor, selecione um cliente.');
            return;
        }
        
        Utils.mostrarLoading();
        
        // Buscar dados para o relatório
        const params = {
            clienteId
        };
        
        const relatorio = await API.Entrega.getRelatorio('cliente', params);
        
        // Exibir relatório
        exibirRelatorioEntregasCliente(relatorio, clienteId);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao gerar relatório de entregas por cliente:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao gerar relatório. Por favor, tente novamente.');
    }
};

// Exibir relatório de entregas por cliente
const exibirRelatorioEntregasCliente = (relatorio, clienteId) => {
    // Mostrar seção de relatório
    document.getElementById('relatorio-resultado').style.display = 'block';
    
    // Atualizar título do relatório
    document.getElementById('relatorio-titulo').textContent = 'Relatório de Entregas por Cliente';
    document.getElementById('relatorio-subtitulo').textContent = 
        `Cliente: ${relatorio.cliente.nome}`;
    
    // Atualizar estatísticas
    document.getElementById('relatorio-total-entregas').textContent = relatorio.totalEntregas;
    document.getElementById('relatorio-entregas-concluidas').textContent = relatorio.entregasConcluidas;
    document.getElementById('relatorio-entregas-pendentes').textContent = relatorio.entregasPendentes;
    document.getElementById('relatorio-valor-total').textContent = Utils.formatarMoeda(relatorio.valorTotal);
    
    // Atualizar gráfico de status
    atualizarGraficoStatusRelatorio(relatorio.statusCount);
    
    // Atualizar tabela de entregas
    const tbody = document.querySelector('#tabela-relatorio tbody');
    tbody.innerHTML = '';
    
    if (relatorio.entregas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhuma entrega encontrada para este cliente</td>';
        tbody.appendChild(tr);
        return;
    }
    
    relatorio.entregas.forEach(entrega => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${Utils.formatarData(entrega.dataEntrega)}</td>
            <td>${relatorio.cliente.nome}</td>
            <td>${entrega.motorista || 'Não informado'}</td>
            <td>${Utils.formatarMoeda(entrega.valorTotal)}</td>
            <td><span class="status-badge status-${entrega.status}">${Utils.formatarStatus(entrega.status)}</span></td>
            <td>${entrega.observacoes ? entrega.observacoes.substring(0, 30) + '...' : 'Sem observações'}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Rolar para a seção de relatório
    document.getElementById('relatorio-resultado').scrollIntoView({ behavior: 'smooth' });
};

// Gerar relatório de desempenho
const gerarRelatorioDesempenho = async () => {
    try {
        // Validar período
        const periodo = document.getElementById('relatorio-desempenho-periodo').value;
        
        if (!periodo) {
            Utils.mostrarAlerta('Por favor, selecione um período.');
            return;
        }
        
        Utils.mostrarLoading();
        
        // Buscar dados para o relatório
        const params = {
            periodo
        };
        
        const relatorio = await API.Entrega.getRelatorio('desempenho', params);
        
        // Exibir relatório
        exibirRelatorioDesempenho(relatorio, periodo);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao gerar relatório de desempenho:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao gerar relatório. Por favor, tente novamente.');
    }
};

// Exibir relatório de desempenho
const exibirRelatorioDesempenho = (relatorio, periodo) => {
    // Mostrar seção de relatório
    document.getElementById('relatorio-resultado').style.display = 'block';
    
    // Atualizar título do relatório
    document.getElementById('relatorio-titulo').textContent = 'Relatório de Desempenho';
    
    let subtitulo = '';
    switch (periodo) {
        case 'semana':
            subtitulo = 'Últimos 7 dias';
            break;
        case 'mes':
            subtitulo = 'Último mês';
            break;
        case 'trimestre':
            subtitulo = 'Último trimestre';
            break;
        case 'ano':
            subtitulo = 'Último ano';
            break;
    }
    
    document.getElementById('relatorio-subtitulo').textContent = `Período: ${subtitulo}`;
    
    // Atualizar estatísticas
    document.getElementById('relatorio-total-entregas').textContent = relatorio.totalEntregas;
    document.getElementById('relatorio-entregas-concluidas').textContent = relatorio.entregasConcluidas;
    document.getElementById('relatorio-entregas-pendentes').textContent = relatorio.entregasPendentes;
    document.getElementById('relatorio-valor-total').textContent = Utils.formatarMoeda(relatorio.valorTotal);
    
    // Atualizar gráfico de status
    atualizarGraficoStatusRelatorio(relatorio.statusCount);
    
    // Atualizar gráfico de desempenho
    atualizarGraficoDesempenho(relatorio.desempenhoTempo);
    
    // Atualizar tabela de top clientes
    const tbody = document.querySelector('#tabela-relatorio tbody');
    tbody.innerHTML = '';
    
    if (relatorio.topClientes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4" class="text-center">Nenhum cliente encontrado no período</td>';
        tbody.appendChild(tr);
        return;
    }
    
    relatorio.topClientes.forEach((cliente, index) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.totalEntregas}</td>
            <td>${Utils.formatarMoeda(cliente.valorTotal)}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Rolar para a seção de relatório
    document.getElementById('relatorio-resultado').scrollIntoView({ behavior: 'smooth' });
};

// Atualizar gráfico de status para relatórios
const atualizarGraficoStatusRelatorio = (statusCount) => {
    const ctx = document.getElementById('grafico-relatorio-status').getContext('2d');
    
    // Destruir gráfico existente se houver
    if (window.graficoRelatorioStatus) {
        window.graficoRelatorioStatus.destroy();
    }
    
    // Criar novo gráfico
    window.graficoRelatorioStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Agendada', 'Em Trânsito', 'Entregue', 'Cancelada'],
            datasets: [{
                data: [
                    statusCount.agendada || 0,
                    statusCount.em_transito || 0,
                    statusCount.entregue || 0,
                    statusCount.cancelada || 0
                ],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(241, 196, 15, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(231, 76, 60, 0.7)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
};

// Atualizar gráfico de desempenho
const atualizarGraficoDesempenho = (desempenhoTempo) => {
    const ctx = document.getElementById('grafico-relatorio-desempenho').getContext('2d');
    
    // Destruir gráfico existente se houver
    if (window.graficoRelatorioDesempenho) {
        window.graficoRelatorioDesempenho.destroy();
    }
    
    // Criar novo gráfico
    window.graficoRelatorioDesempenho = new Chart(ctx, {
        type: 'line',
        data: {
            labels: desempenhoTempo.labels,
            datasets: [{
                label: 'Entregas',
                data: desempenhoTempo.entregas,
                borderColor: 'rgba(74, 109, 167, 1)',
                backgroundColor: 'rgba(74, 109, 167, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Valor (R$)',
                data: desempenhoTempo.valores,
                borderColor: 'rgba(46, 204, 113, 1)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Entregas'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Valor Total (R$)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
};

// Exportar relatório para PDF
const exportarRelatorioPDF = () => {
    Utils.mostrarAlerta('Funcionalidade de exportação para PDF em desenvolvimento.');
    // Implementação futura: usar biblioteca como jsPDF para exportar o relatório
};

// Exportar relatório para Excel
const exportarRelatorioExcel = () => {
    Utils.mostrarAlerta('Funcionalidade de exportação para Excel em desenvolvimento.');
    // Implementação futura: usar biblioteca como SheetJS para exportar o relatório
};

// Imprimir relatório
const imprimirRelatorio = () => {
    window.print();
};

// Exportar funções de relatórios
const Relatorios = {
    inicializarRelatorios,
    preencherSelectClientes,
    configurarEventosRelatorios,
    gerarRelatorioEntregasPeriodo,
    exibirRelatorioEntregasPeriodo,
    gerarRelatorioEntregasCliente,
    exibirRelatorioEntregasCliente,
    gerarRelatorioDesempenho,
    exibirRelatorioDesempenho,
    atualizarGraficoStatusRelatorio,
    atualizarGraficoDesempenho,
    exportarRelatorioPDF,
    exportarRelatorioExcel,
    imprimirRelatorio
};
