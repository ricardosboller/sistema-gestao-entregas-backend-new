// Funcionalidades de Entregas

// Inicializar página de entregas
const inicializarEntregas = async () => {
    try {
        Utils.mostrarLoading();
        
        // Verificar autenticação
        if (!Auth.verificarAutenticacao()) {
            return;
        }
        
        // Carregar dados
        const entregas = await API.Entrega.getAll();
        const clientes = await API.Cliente.getAll();
        
        // Preencher select de clientes nos filtros
        preencherSelectClientes(clientes);
        
        // Atualizar tabela
        atualizarTabelaEntregas(entregas);
        
        // Configurar eventos
        configurarEventosEntregas();
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao inicializar entregas:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados de entregas. Por favor, tente novamente.');
    }
};

// Preencher select de clientes
const preencherSelectClientes = (clientes) => {
    const selectClientes = document.querySelectorAll('.select-cliente');
    
    selectClientes.forEach(select => {
        // Limpar opções existentes, mantendo a primeira (selecione)
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

// Atualizar tabela de entregas
const atualizarTabelaEntregas = (entregas) => {
    const tbody = document.querySelector('#tabela-entregas tbody');
    tbody.innerHTML = '';
    
    if (entregas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" class="text-center">Nenhuma entrega encontrada</td>';
        tbody.appendChild(tr);
        return;
    }
    
    entregas.forEach(entrega => {
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
            <td>
                <div class="table-actions">
                    <button class="btn-table-action btn-view" title="Ver detalhes" 
                            onclick="Entregas.visualizarEntrega('${entrega._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-table-action btn-edit gerente-only" title="Editar" 
                            onclick="Entregas.editarEntrega('${entrega._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-table-action btn-delete admin-only" title="Excluir" 
                            onclick="Entregas.confirmarExclusaoEntrega('${entrega._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Configurar visibilidade de botões baseado nas permissões
    Auth.configurarInterfacePorPermissao();
};

// Configurar eventos da página de entregas
const configurarEventosEntregas = () => {
    // Configurar botão de nova entrega
    const btnNovaEntrega = document.getElementById('btn-nova-entrega');
    if (btnNovaEntrega) {
        btnNovaEntrega.addEventListener('click', abrirModalNovaEntrega);
    }
    
    // Configurar botão de busca
    const btnBuscarEntrega = document.getElementById('btn-buscar-entrega');
    if (btnBuscarEntrega) {
        btnBuscarEntrega.addEventListener('click', buscarEntregas);
    }
    
    // Configurar botão de filtrar
    const btnFiltrarEntrega = document.getElementById('btn-filtrar-entrega');
    if (btnFiltrarEntrega) {
        btnFiltrarEntrega.addEventListener('click', filtrarEntregas);
    }
    
    // Configurar botão de limpar filtros
    const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', limparFiltros);
    }
    
    // Configurar campo de busca para buscar ao pressionar Enter
    const campoBusca = document.getElementById('busca-entrega');
    if (campoBusca) {
        campoBusca.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarEntregas();
            }
        });
    }
    
    // Configurar formulário de entrega
    const formEntrega = document.getElementById('form-entrega');
    if (formEntrega) {
        formEntrega.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarEntrega();
        });
    }
    
    // Configurar botão de adicionar produto
    const btnAdicionarProduto = document.getElementById('btn-adicionar-produto');
    if (btnAdicionarProduto) {
        btnAdicionarProduto.addEventListener('click', adicionarProduto);
    }
};

// Buscar entregas
const buscarEntregas = async () => {
    try {
        Utils.mostrarLoading();
        
        const termoBusca = document.getElementById('busca-entrega').value;
        const entregas = await API.Entrega.getAll();
        
        // Filtrar entregas pelo termo de busca
        const entregasFiltradas = Utils.buscarEntregas(entregas, termoBusca);
        
        // Atualizar tabela com resultados
        atualizarTabelaEntregas(entregasFiltradas);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao buscar entregas:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao buscar entregas. Por favor, tente novamente.');
    }
};

// Filtrar entregas
const filtrarEntregas = async () => {
    try {
        Utils.mostrarLoading();
        
        // Obter valores dos filtros
        const dataInicio = document.getElementById('filtro-data-inicio').value;
        const dataFim = document.getElementById('filtro-data-fim').value;
        const status = document.getElementById('filtro-status').value;
        const clienteId = document.getElementById('filtro-cliente').value;
        
        // Construir objeto de filtros para a API
        const filtros = {};
        if (dataInicio) filtros.dataInicio = dataInicio;
        if (dataFim) filtros.dataFim = dataFim;
        if (status && status !== 'todos') filtros.status = status;
        if (clienteId) filtros.cliente = clienteId;
        
        // Buscar entregas com filtros
        const entregas = await API.Entrega.getAll(filtros);
        
        // Atualizar tabela com resultados
        atualizarTabelaEntregas(entregas);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao filtrar entregas:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao filtrar entregas. Por favor, tente novamente.');
    }
};

// Limpar filtros
const limparFiltros = async () => {
    // Limpar campos de filtro
    document.getElementById('filtro-data-inicio').value = '';
    document.getElementById('filtro-data-fim').value = '';
    document.getElementById('filtro-status').value = 'todos';
    document.getElementById('filtro-cliente').value = '';
    
    // Recarregar todas as entregas
    try {
        Utils.mostrarLoading();
        
        const entregas = await API.Entrega.getAll();
        atualizarTabelaEntregas(entregas);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao recarregar entregas:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao recarregar entregas. Por favor, tente novamente.');
    }
};

// Abrir modal para nova entrega
const abrirModalNovaEntrega = async () => {
    try {
        Utils.mostrarLoading();
        
        // Limpar formulário
        document.getElementById('form-entrega').reset();
        document.getElementById('entrega-id').value = '';
        
        // Limpar produtos
        const produtosContainer = document.getElementById('produtos-container');
        produtosContainer.innerHTML = '';
        adicionarProduto(); // Adicionar um produto vazio
        
        // Carregar clientes para o select
        const clientes = await API.Cliente.getAll();
        preencherSelectClientes(clientes);
        
        // Atualizar título do modal
        document.getElementById('modal-entrega-titulo').textContent = 'Nova Entrega';
        
        // Exibir modal
        document.getElementById('modal-entrega').style.display = 'block';
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao abrir modal de nova entrega:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados para nova entrega. Por favor, tente novamente.');
    }
};

// Adicionar produto ao formulário
const adicionarProduto = () => {
    const produtosContainer = document.getElementById('produtos-container');
    const produtoIndex = document.querySelectorAll('.produto-item').length;
    
    const produtoHtml = `
        <div class="produto-item">
            <div class="form-row">
                <div class="form-group">
                    <label for="produto-nome-${produtoIndex}">Nome do Produto</label>
                    <input type="text" id="produto-nome-${produtoIndex}" name="produto-nome-${produtoIndex}" required>
                </div>
                <div class="form-group">
                    <label for="produto-quantidade-${produtoIndex}">Quantidade</label>
                    <input type="number" id="produto-quantidade-${produtoIndex}" name="produto-quantidade-${produtoIndex}" min="1" required>
                </div>
                <div class="form-group">
                    <label for="produto-valor-${produtoIndex}">Valor Unitário (R$)</label>
                    <input type="number" id="produto-valor-${produtoIndex}" name="produto-valor-${produtoIndex}" min="0" step="0.01" required>
                </div>
                <button type="button" class="btn-remover-produto" onclick="Entregas.removerProduto(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    produtosContainer.insertAdjacentHTML('beforeend', produtoHtml);
    
    // Atualizar valor total ao alterar valores dos produtos
    const inputsValor = document.querySelectorAll('[id^="produto-valor-"]');
    const inputsQuantidade = document.querySelectorAll('[id^="produto-quantidade-"]');
    
    inputsValor.forEach(input => {
        input.addEventListener('input', calcularValorTotal);
    });
    
    inputsQuantidade.forEach(input => {
        input.addEventListener('input', calcularValorTotal);
    });
};

// Remover produto do formulário
const removerProduto = (button) => {
    const produtoItem = button.closest('.produto-item');
    produtoItem.remove();
    calcularValorTotal();
};

// Calcular valor total da entrega
const calcularValorTotal = () => {
    let valorTotal = 0;
    
    const produtos = document.querySelectorAll('.produto-item');
    produtos.forEach((produto, index) => {
        const quantidade = parseFloat(document.getElementById(`produto-quantidade-${index}`)?.value || 0);
        const valorUnitario = parseFloat(document.getElementById(`produto-valor-${index}`)?.value || 0);
        
        if (!isNaN(quantidade) && !isNaN(valorUnitario)) {
            valorTotal += quantidade * valorUnitario;
        }
    });
    
    document.getElementById('entrega-valor-total').value = valorTotal.toFixed(2);
};

// Abrir modal para editar entrega
const editarEntrega = async (entregaId) => {
    try {
        Utils.mostrarLoading();
        
        // Buscar dados da entrega
        const entrega = await API.Entrega.getById(entregaId);
        const clientes = await API.Cliente.getAll();
        
        // Preencher select de clientes
        preencherSelectClientes(clientes);
        
        // Preencher formulário
        document.getElementById('entrega-id').value = entrega._id;
        document.getElementById('entrega-cliente').value = entrega.cliente._id || entrega.cliente;
        document.getElementById('entrega-data').value = entrega.dataEntrega ? entrega.dataEntrega.substring(0, 10) : '';
        document.getElementById('entrega-motorista').value = entrega.motorista || '';
        document.getElementById('entrega-status').value = entrega.status || 'agendada';
        document.getElementById('entrega-observacoes').value = entrega.observacoes || '';
        document.getElementById('entrega-valor-total').value = entrega.valorTotal ? entrega.valorTotal.toFixed(2) : '0.00';
        
        // Preencher produtos
        const produtosContainer = document.getElementById('produtos-container');
        produtosContainer.innerHTML = '';
        
        if (entrega.produtos && entrega.produtos.length > 0) {
            entrega.produtos.forEach((produto, index) => {
                const produtoHtml = `
                    <div class="produto-item">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="produto-nome-${index}">Nome do Produto</label>
                                <input type="text" id="produto-nome-${index}" name="produto-nome-${index}" value="${produto.nome}" required>
                            </div>
                            <div class="form-group">
                                <label for="produto-quantidade-${index}">Quantidade</label>
                                <input type="number" id="produto-quantidade-${index}" name="produto-quantidade-${index}" value="${produto.quantidade}" min="1" required>
                            </div>
                            <div class="form-group">
                                <label for="produto-valor-${index}">Valor Unitário (R$)</label>
                                <input type="number" id="produto-valor-${index}" name="produto-valor-${index}" value="${produto.valorUnitario.toFixed(2)}" min="0" step="0.01" required>
                            </div>
                            <button type="button" class="btn-remover-produto" onclick="Entregas.removerProduto(this)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                produtosContainer.insertAdjacentHTML('beforeend', produtoHtml);
            });
        } else {
            // Adicionar um produto vazio se não houver produtos
            adicionarProduto();
        }
        
        // Configurar eventos para calcular valor total
        const inputsValor = document.querySelectorAll('[id^="produto-valor-"]');
        const inputsQuantidade = document.querySelectorAll('[id^="produto-quantidade-"]');
        
        inputsValor.forEach(input => {
            input.addEventListener('input', calcularValorTotal);
        });
        
        inputsQuantidade.forEach(input => {
            input.addEventListener('input', calcularValorTotal);
        });
        
        // Atualizar título do modal
        document.getElementById('modal-entrega-titulo').textContent = 'Editar Entrega';
        
        // Exibir modal
        document.getElementById('modal-entrega').style.display = 'block';
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao editar entrega:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados da entrega. Por favor, tente novamente.');
    }
};

// Abrir modal para visualizar entrega
const visualizarEntrega = async (entregaId) => {
    try {
        Utils.mostrarLoading();
        
        // Buscar dados da entrega
        const entrega = await API.Entrega.getById(entregaId);
        
        // Preencher dados no modal de visualização
        document.getElementById('visualizar-entrega-data').textContent = Utils.formatarData(entrega.dataEntrega);
        document.getElementById('visualizar-entrega-status').innerHTML = `<span class="status-badge status-${entrega.status}">${Utils.formatarStatus(entrega.status)}</span>`;
        document.getElementById('visualizar-entrega-valor').textContent = Utils.formatarMoeda(entrega.valorTotal);
        
        // Preencher dados do cliente
        const nomeCliente = entrega.cliente && typeof entrega.cliente === 'object' ? 
            entrega.cliente.nome : 'Cliente não especificado';
        document.getElementById('visualizar-entrega-cliente').textContent = nomeCliente;
        
        // Preencher dados do motorista
        document.getElementById('visualizar-entrega-motorista').textContent = entrega.motorista || 'Não informado';
        
        // Preencher observações
        document.getElementById('visualizar-entrega-observacoes').textContent = entrega.observacoes || 'Sem observações';
        
        // Preencher produtos
        const produtosContainer = document.getElementById('visualizar-entrega-produtos');
        produtosContainer.innerHTML = '';
        
        if (entrega.produtos && entrega.produtos.length > 0) {
            const table = document.createElement('table');
            table.className = 'data-table';
            
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Valor Unitário</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            
            entrega.produtos.forEach(produto => {
                const tr = document.createElement('tr');
                const subtotal = produto.quantidade * produto.valorUnitario;
                
                tr.innerHTML = `
                    <td>${produto.nome}</td>
                    <td>${produto.quantidade}</td>
                    <td>${Utils.formatarMoeda(produto.valorUnitario)}</td>
                    <td>${Utils.formatarMoeda(subtotal)}</td>
                `;
                
                tbody.appendChild(tr);
            });
            
            produtosContainer.appendChild(table);
        } else {
            produtosContainer.innerHTML = '<p>Nenhum produto registrado</p>';
        }
        
        // Configurar botões de ação
        const btnEditar = document.getElementById('btn-editar-entrega-visualizacao');
        if (btnEditar) {
            btnEditar.onclick = () => {
                document.getElementById('modal-visualizar-entrega').style.display = 'none';
                editarEntrega(entregaId);
            };
            
            // Mostrar ou esconder botão baseado nas permissões
            btnEditar.style.display = Utils.verificarPermissao('gerente') ? 'inline-flex' : 'none';
        }
        
        const btnAtualizarStatus = document.getElementById('btn-atualizar-status-entrega');
        if (btnAtualizarStatus) {
            btnAtualizarStatus.onclick = () => {
                document.getElementById('modal-visualizar-entrega').style.display = 'none';
                abrirModalAtualizarStatus(entregaId, entrega.status);
            };
            
            // Mostrar ou esconder botão baseado nas permissões
            btnAtualizarStatus.style.display = Utils.verificarPermissao('operador') ? 'inline-flex' : 'none';
        }
        
        // Exibir modal
        document.getElementById('modal-visualizar-entrega').style.display = 'block';
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao visualizar entrega:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados da entrega. Por favor, tente novamente.');
    }
};

// Abrir modal para atualizar status da entrega
const abrirModalAtualizarStatus = (entregaId, statusAtual) => {
    document.getElementById('atualizar-status-entrega-id').value = entregaId;
    document.getElementById('atualizar-status-entrega-status').value = statusAtual;
    
    document.getElementById('modal-atualizar-status').style.display = 'block';
};

// Atualizar status da entrega
const atualizarStatusEntrega = async () => {
    try {
        Utils.mostrarLoading();
        
        const entregaId = document.getElementById('atualizar-status-entrega-id').value;
        const novoStatus = document.getElementById('atualizar-status-entrega-status').value;
        
        // Atualizar status
        await API.Entrega.updateStatus(entregaId, novoStatus);
        
        // Fechar modal
        document.getElementById('modal-atualizar-status').style.display = 'none';
        
        // Recarregar lista de entregas
        const entregas = await API.Entrega.getAll();
        atualizarTabelaEntregas(entregas);
        
        Utils.esconderLoading();
        
        // Mostrar mensagem de sucesso
        Utils.mostrarAlerta('Status da entrega atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar status da entrega:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao atualizar status da entrega. Por favor, tente novamente.');
    }
};

// Salvar entrega (criar ou atualizar)
const salvarEntrega = async () => {
    try {
        // Validar formulário
        const form = document.getElementById('form-entrega');
        if (!Utils.validarFormulario(form)) {
            Utils.mostrarAlerta('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        Utils.mostrarLoading();
        
        // Obter dados do formulário
        const entregaId = document.getElementById('entrega-id').value;
        
        // Obter produtos
        const produtos = [];
        const produtosItems = document.querySelectorAll('.produto-item');
        
        produtosItems.forEach((item, index) => {
            const nome = document.getElementById(`produto-nome-${index}`).value;
            const quantidade = parseInt(document.getElementById(`produto-quantidade-${index}`).value);
            const valorUnitario = parseFloat(document.getElementById(`produto-valor-${index}`).value);
            
            produtos.push({
                nome,
                quantidade,
                valorUnitario
            });
        });
        
        const entregaData = {
            cliente: document.getElementById('entrega-cliente').value,
            dataEntrega: document.getElementById('entrega-data').value,
            motorista: document.getElementById('entrega-motorista').value,
            status: document.getElementById('entrega-status').value,
            observacoes: document.getElementById('entrega-observacoes').value,
            valorTotal: parseFloat(document.getElementById('entrega-valor-total').value),
            produtos
        };
        
        let response;
        
        // Criar ou atualizar entrega
        if (entregaId) {
            response = await API.Entrega.update(entregaId, entregaData);
        } else {
            response = await API.Entrega.create(entregaData);
        }
        
        // Fechar modal
        document.getElementById('modal-entrega').style.display = 'none';
        
        // Recarregar lista de entregas
        const entregas = await API.Entrega.getAll();
        atualizarTabelaEntregas(entregas);
        
        Utils.esconderLoading();
        
        // Mostrar mensagem de sucesso
        Utils.mostrarAlerta(entregaId ? 'Entrega atualizada com sucesso!' : 'Entrega criada com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar entrega:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao salvar entrega. Por favor, tente novamente.');
    }
};

// Confirmar exclusão de entrega
const confirmarExclusaoEntrega = (entregaId) => {
    Utils.mostrarConfirmacao(
        'Tem certeza que deseja excluir esta entrega? Esta ação não pode ser desfeita.',
        () => excluirEntrega(entregaId),
        null
    );
};

// Excluir entrega
const excluirEntrega = async (entregaId) => {
    try {
        Utils.mostrarLoading();
        
        // Excluir entrega
        await API.Entrega.delete(entregaId);
        
        // Recarregar lista de entregas
        const entregas = await API.Entrega.getAll();
        atualizarTabelaEntregas(entregas);
        
        Utils.esconderLoading();
        
        // Mostrar mensagem de sucesso
        Utils.mostrarAlerta('Entrega excluída com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir entrega:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao excluir entrega. Por favor, tente novamente.');
    }
};

// Exportar funções de entregas
const Entregas = {
    inicializarEntregas,
    preencherSelectClientes,
    atualizarTabelaEntregas,
    configurarEventosEntregas,
    buscarEntregas,
    filtrarEntregas,
    limparFiltros,
    abrirModalNovaEntrega,
    adicionarProduto,
    removerProduto,
    calcularValorTotal,
    editarEntrega,
    visualizarEntrega,
    abrirModalAtualizarStatus,
    atualizarStatusEntrega,
    salvarEntrega,
    confirmarExclusaoEntrega,
    excluirEntrega
};
