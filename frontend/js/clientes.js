// Funcionalidades de Clientes

// Inicializar página de clientes
const inicializarClientes = async () => {
    try {
        Utils.mostrarLoading();
        
        // Verificar autenticação
        if (!Auth.verificarAutenticacao()) {
            return;
        }
        
        // Carregar dados
        const clientes = await API.Cliente.getAll();
        
        // Atualizar tabela
        atualizarTabelaClientes(clientes);
        
        // Configurar eventos
        configurarEventosClientes();
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao inicializar clientes:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados de clientes. Por favor, tente novamente.');
    }
};

// Atualizar tabela de clientes
const atualizarTabelaClientes = (clientes) => {
    const tbody = document.querySelector('#tabela-clientes tbody');
    tbody.innerHTML = '';
    
    if (clientes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhum cliente encontrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cnpj || 'Não informado'}</td>
            <td>${cliente.telefone || 'Não informado'}</td>
            <td>${cliente.email || 'Não informado'}</td>
            <td>${cliente.endereco ? cliente.endereco.cidade : 'Não informado'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-table-action btn-view" title="Ver detalhes" 
                            onclick="Clientes.visualizarCliente('${cliente._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-table-action btn-edit gerente-only" title="Editar" 
                            onclick="Clientes.editarCliente('${cliente._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-table-action btn-delete admin-only" title="Excluir" 
                            onclick="Clientes.confirmarExclusaoCliente('${cliente._id}')">
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

// Configurar eventos da página de clientes
const configurarEventosClientes = () => {
    // Configurar botão de novo cliente
    const btnNovoCliente = document.getElementById('btn-novo-cliente');
    if (btnNovoCliente) {
        btnNovoCliente.addEventListener('click', abrirModalNovoCliente);
    }
    
    // Configurar botão de busca
    const btnBuscarCliente = document.getElementById('btn-buscar-cliente');
    if (btnBuscarCliente) {
        btnBuscarCliente.addEventListener('click', buscarClientes);
    }
    
    // Configurar campo de busca para buscar ao pressionar Enter
    const campoBusca = document.getElementById('busca-cliente');
    if (campoBusca) {
        campoBusca.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarClientes();
            }
        });
    }
    
    // Configurar formulário de cliente
    const formCliente = document.getElementById('form-cliente');
    if (formCliente) {
        formCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarCliente();
        });
    }
};

// Buscar clientes
const buscarClientes = async () => {
    try {
        Utils.mostrarLoading();
        
        const termoBusca = document.getElementById('busca-cliente').value;
        const clientes = await API.Cliente.getAll();
        
        // Filtrar clientes pelo termo de busca
        const clientesFiltrados = Utils.buscarClientes(clientes, termoBusca);
        
        // Atualizar tabela com resultados
        atualizarTabelaClientes(clientesFiltrados);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao buscar clientes. Por favor, tente novamente.');
    }
};

// Abrir modal para novo cliente
const abrirModalNovoCliente = () => {
    // Limpar formulário
    document.getElementById('form-cliente').reset();
    document.getElementById('cliente-id').value = '';
    
    // Atualizar título do modal
    document.getElementById('modal-cliente-titulo').textContent = 'Novo Cliente';
    
    // Exibir modal
    document.getElementById('modal-cliente').style.display = 'block';
};

// Abrir modal para editar cliente
const editarCliente = async (clienteId) => {
    try {
        Utils.mostrarLoading();
        
        // Buscar dados do cliente
        const cliente = await API.Cliente.getById(clienteId);
        
        // Preencher formulário
        document.getElementById('cliente-id').value = cliente._id;
        document.getElementById('cliente-nome').value = cliente.nome || '';
        document.getElementById('cliente-cnpj').value = cliente.cnpj || '';
        document.getElementById('cliente-telefone').value = cliente.telefone || '';
        document.getElementById('cliente-email').value = cliente.email || '';
        
        // Preencher endereço
        if (cliente.endereco) {
            document.getElementById('cliente-cep').value = cliente.endereco.cep || '';
            document.getElementById('cliente-logradouro').value = cliente.endereco.logradouro || '';
            document.getElementById('cliente-numero').value = cliente.endereco.numero || '';
            document.getElementById('cliente-complemento').value = cliente.endereco.complemento || '';
            document.getElementById('cliente-bairro').value = cliente.endereco.bairro || '';
            document.getElementById('cliente-cidade').value = cliente.endereco.cidade || '';
            document.getElementById('cliente-estado').value = cliente.endereco.estado || '';
        }
        
        // Atualizar título do modal
        document.getElementById('modal-cliente-titulo').textContent = 'Editar Cliente';
        
        // Exibir modal
        document.getElementById('modal-cliente').style.display = 'block';
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao editar cliente:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados do cliente. Por favor, tente novamente.');
    }
};

// Abrir modal para visualizar cliente
const visualizarCliente = async (clienteId) => {
    try {
        Utils.mostrarLoading();
        
        // Buscar dados do cliente
        const cliente = await API.Cliente.getById(clienteId);
        
        // Preencher dados no modal de visualização
        document.getElementById('visualizar-cliente-nome').textContent = cliente.nome;
        document.getElementById('visualizar-cliente-cnpj').textContent = cliente.cnpj || 'Não informado';
        document.getElementById('visualizar-cliente-telefone').textContent = cliente.telefone || 'Não informado';
        document.getElementById('visualizar-cliente-email').textContent = cliente.email || 'Não informado';
        
        // Preencher endereço
        let enderecoCompleto = 'Não informado';
        if (cliente.endereco && cliente.endereco.logradouro) {
            enderecoCompleto = `${cliente.endereco.logradouro}, ${cliente.endereco.numero || 'S/N'}`;
            
            if (cliente.endereco.complemento) {
                enderecoCompleto += ` - ${cliente.endereco.complemento}`;
            }
            
            if (cliente.endereco.bairro) {
                enderecoCompleto += ` - ${cliente.endereco.bairro}`;
            }
            
            if (cliente.endereco.cidade && cliente.endereco.estado) {
                enderecoCompleto += ` - ${cliente.endereco.cidade}/${cliente.endereco.estado}`;
            }
            
            if (cliente.endereco.cep) {
                enderecoCompleto += ` - CEP: ${cliente.endereco.cep}`;
            }
        }
        
        document.getElementById('visualizar-cliente-endereco').textContent = enderecoCompleto;
        
        // Configurar botões de ação
        const btnEditar = document.getElementById('btn-editar-cliente-visualizacao');
        if (btnEditar) {
            btnEditar.onclick = () => {
                document.getElementById('modal-visualizar-cliente').style.display = 'none';
                editarCliente(clienteId);
            };
            
            // Mostrar ou esconder botão baseado nas permissões
            btnEditar.style.display = Utils.verificarPermissao('gerente') ? 'inline-flex' : 'none';
        }
        
        // Exibir modal
        document.getElementById('modal-visualizar-cliente').style.display = 'block';
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao visualizar cliente:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados do cliente. Por favor, tente novamente.');
    }
};

// Salvar cliente (criar ou atualizar)
const salvarCliente = async () => {
    try {
        // Validar formulário
        const form = document.getElementById('form-cliente');
        if (!Utils.validarFormulario(form)) {
            Utils.mostrarAlerta('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        Utils.mostrarLoading();
        
        // Obter dados do formulário
        const clienteId = document.getElementById('cliente-id').value;
        const clienteData = {
            nome: document.getElementById('cliente-nome').value,
            cnpj: document.getElementById('cliente-cnpj').value,
            telefone: document.getElementById('cliente-telefone').value,
            email: document.getElementById('cliente-email').value,
            endereco: {
                cep: document.getElementById('cliente-cep').value,
                logradouro: document.getElementById('cliente-logradouro').value,
                numero: document.getElementById('cliente-numero').value,
                complemento: document.getElementById('cliente-complemento').value,
                bairro: document.getElementById('cliente-bairro').value,
                cidade: document.getElementById('cliente-cidade').value,
                estado: document.getElementById('cliente-estado').value
            }
        };
        
        let response;
        
        // Criar ou atualizar cliente
        if (clienteId) {
            response = await API.Cliente.update(clienteId, clienteData);
        } else {
            response = await API.Cliente.create(clienteData);
        }
        
        // Fechar modal
        document.getElementById('modal-cliente').style.display = 'none';
        
        // Recarregar lista de clientes
        const clientes = await API.Cliente.getAll();
        atualizarTabelaClientes(clientes);
        
        Utils.esconderLoading();
        
        // Mostrar mensagem de sucesso
        Utils.mostrarAlerta(clienteId ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao salvar cliente. Por favor, tente novamente.');
    }
};

// Confirmar exclusão de cliente
const confirmarExclusaoCliente = (clienteId) => {
    Utils.mostrarConfirmacao(
        'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
        () => excluirCliente(clienteId),
        null
    );
};

// Excluir cliente
const excluirCliente = async (clienteId) => {
    try {
        Utils.mostrarLoading();
        
        // Excluir cliente
        await API.Cliente.delete(clienteId);
        
        // Recarregar lista de clientes
        const clientes = await API.Cliente.getAll();
        atualizarTabelaClientes(clientes);
        
        Utils.esconderLoading();
        
        // Mostrar mensagem de sucesso
        Utils.mostrarAlerta('Cliente excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao excluir cliente. Por favor, tente novamente.');
    }
};

// Exportar funções de clientes
const Clientes = {
    inicializarClientes,
    atualizarTabelaClientes,
    configurarEventosClientes,
    buscarClientes,
    abrirModalNovoCliente,
    editarCliente,
    visualizarCliente,
    salvarCliente,
    confirmarExclusaoCliente,
    excluirCliente
};
