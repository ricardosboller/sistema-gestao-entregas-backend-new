// Funcionalidades do Dashboard

// Inicializar dashboard
const inicializarDashboard = async () => {
    try {
        Utils.mostrarLoading();
        
        // Verificar autenticação
        if (!Auth.verificarAutenticacao()) {
            return;
        }
        
        // Carregar dados
        const entregas = await API.Entrega.getAll();
        const clientes = await API.Cliente.getAll();
        
        // Atualizar cards
        atualizarCardsDashboard(entregas);
        
        // Atualizar gráficos
        atualizarGraficoStatus(entregas);
        atualizarGraficoEntregasSemana(entregas);
        
        // Atualizar tabelas
        atualizarTabelaEntregasRecentes(entregas);
        atualizarTabelaClientesAtivos(clientes, entregas);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados do dashboard. Por favor, tente novamente.');
    }
};

// Atualizar cards do dashboard
const atualizarCardsDashboard = (entregas) => {
    const estatisticas = Utils.calcularEstatisticasEntregas(entregas);
    
    // Atualizar card de total de entregas
    document.getElementById('total-entregas').textContent = estatisticas.total;
    
    // Atualizar card de entregas de hoje
    document.getElementById('entregas-hoje').textContent = estatisticas.entregasHoje;
    
    // Atualizar card de entregas concluídas
    document.getElementById('entregas-concluidas').textContent = estatisticas.entregasConcluidas;
    
    // Atualizar card de valor total
    document.getElementById('valor-total').textContent = Utils.formatarMoeda(estatisticas.valorTotal);
};

// Atualizar gráfico de status
const atualizarGraficoStatus = (entregas) => {
    const ctx = document.getElementById('grafico-status').getContext('2d');
    const dadosGrafico = Utils.obterDadosGraficoStatus(entregas);
    
    // Destruir gráfico existente se houver
    if (window.graficoStatus) {
        window.graficoStatus.destroy();
    }
    
    // Criar novo gráfico
    window.graficoStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: dadosGrafico.labels,
            datasets: [{
                data: dadosGrafico.data,
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

// Atualizar gráfico de entregas por semana
const atualizarGraficoEntregasSemana = (entregas) => {
    const ctx = document.getElementById('grafico-entregas-semana').getContext('2d');
    const dadosGrafico = Utils.obterDadosGraficoSemana(entregas);
    
    // Destruir gráfico existente se houver
    if (window.graficoEntregasSemana) {
        window.graficoEntregasSemana.destroy();
    }
    
    // Criar novo gráfico
    window.graficoEntregasSemana = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosGrafico.labels,
            datasets: [{
                label: 'Entregas',
                data: dadosGrafico.data,
                backgroundColor: 'rgba(74, 109, 167, 0.7)',
                borderColor: 'rgba(74, 109, 167, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
};

// Atualizar tabela de entregas recentes
const atualizarTabelaEntregasRecentes = (entregas) => {
    const tbody = document.querySelector('#tabela-entregas-recentes tbody');
    tbody.innerHTML = '';
    
    // Ordenar entregas por data (mais recentes primeiro)
    const entregasRecentes = Utils.ordenarEntregasPorData(entregas, false).slice(0, 5);
    
    if (entregasRecentes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" class="text-center">Nenhuma entrega encontrada</td>';
        tbody.appendChild(tr);
        return;
    }
    
    entregasRecentes.forEach(entrega => {
        const tr = document.createElement('tr');
        
        // Formatar nome do cliente
        const nomeCliente = entrega.cliente && typeof entrega.cliente === 'object' ? 
            entrega.cliente.nome : 'Cliente não especificado';
        
        tr.innerHTML = `
            <td>${Utils.formatarData(entrega.dataEntrega)}</td>
            <td>${nomeCliente}</td>
            <td>${Utils.formatarMoeda(entrega.valorTotal)}</td>
            <td><span class="status-badge status-${entrega.status}">${Utils.formatarStatus(entrega.status)}</span></td>
            <td>
                <div class="table-actions">
                    <a href="#entregas-page" class="btn-table-action btn-view" title="Ver detalhes" 
                       onclick="Entregas.visualizarEntrega('${entrega._id}')">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
};

// Atualizar tabela de clientes ativos
const atualizarTabelaClientesAtivos = (clientes, entregas) => {
    const tbody = document.querySelector('#tabela-clientes-ativos tbody');
    tbody.innerHTML = '';
    
    // Calcular número de entregas por cliente
    const entregasPorCliente = {};
    entregas.forEach(entrega => {
        const clienteId = entrega.cliente && typeof entrega.cliente === 'object' ? 
            entrega.cliente._id : entrega.cliente;
        
        if (clienteId) {
            entregasPorCliente[clienteId] = (entregasPorCliente[clienteId] || 0) + 1;
        }
    });
    
    // Ordenar clientes por número de entregas
    const clientesAtivos = [...clientes]
        .map(cliente => ({
            ...cliente,
            totalEntregas: entregasPorCliente[cliente._id] || 0
        }))
        .sort((a, b) => b.totalEntregas - a.totalEntregas)
        .slice(0, 5);
    
    if (clientesAtivos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4" class="text-center">Nenhum cliente encontrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    clientesAtivos.forEach(cliente => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.telefone || 'Não informado'}</td>
            <td>${cliente.totalEntregas}</td>
            <td>
                <div class="table-actions">
                    <a href="#clientes-page" class="btn-table-action btn-view" title="Ver detalhes" 
                       onclick="Clientes.visualizarCliente('${cliente._id}')">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
};

// Exportar funções do dashboard
const Dashboard = {
    inicializarDashboard,
    atualizarCardsDashboard,
    atualizarGraficoStatus,
    atualizarGraficoEntregasSemana,
    atualizarTabelaEntregasRecentes,
    atualizarTabelaClientesAtivos
};
