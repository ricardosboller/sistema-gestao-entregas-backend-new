// Funcionalidades de Usuários

// Inicializar página de usuários
const inicializarUsuarios = async () => {
    try {
        Utils.mostrarLoading();
        
        // Verificar autenticação
        if (!Auth.verificarAutenticacao()) {
            return;
        }
        
        // Verificar se usuário tem permissão de admin
        if (!Utils.verificarPermissao('admin')) {
            window.location.href = 'index.html#dashboard';
            Utils.mostrarAlerta('Você não tem permissão para acessar esta página.');
            return;
        }
        
        // Carregar dados
        const usuarios = await API.Usuario.getAll();
        
        // Atualizar tabela
        atualizarTabelaUsuarios(usuarios);
        
        // Configurar eventos
        configurarEventosUsuarios();
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao inicializar usuários:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados de usuários. Por favor, tente novamente.');
    }
};

// Atualizar tabela de usuários
const atualizarTabelaUsuarios = (usuarios) => {
    const tbody = document.querySelector('#tabela-usuarios tbody');
    tbody.innerHTML = '';
    
    if (usuarios.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" class="text-center">Nenhum usuário encontrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${Utils.formatarCargo(usuario.cargo)}</td>
            <td>${Utils.formatarData(usuario.dataCriacao)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-table-action btn-edit" title="Editar" 
                            onclick="Usuarios.editarUsuario('${usuario._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-table-action btn-delete" title="Excluir" 
                            onclick="Usuarios.confirmarExclusaoUsuario('${usuario._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
};

// Configurar eventos da página de usuários
const configurarEventosUsuarios = () => {
    // Configurar botão de novo usuário
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    if (btnNovoUsuario) {
        btnNovoUsuario.addEventListener('click', abrirModalNovoUsuario);
    }
    
    // Configurar botão de busca
    const btnBuscarUsuario = document.getElementById('btn-buscar-usuario');
    if (btnBuscarUsuario) {
        btnBuscarUsuario.addEventListener('click', buscarUsuarios);
    }
    
    // Configurar campo de busca para buscar ao pressionar Enter
    const campoBusca = document.getElementById('busca-usuario');
    if (campoBusca) {
        campoBusca.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarUsuarios();
            }
        });
    }
    
    // Configurar formulário de usuário
    const formUsuario = document.getElementById('form-usuario');
    if (formUsuario) {
        formUsuario.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarUsuario();
        });
    }
};

// Buscar usuários
const buscarUsuarios = async () => {
    try {
        Utils.mostrarLoading();
        
        const termoBusca = document.getElementById('busca-usuario').value;
        const usuarios = await API.Usuario.getAll();
        
        // Filtrar usuários pelo termo de busca
        const usuariosFiltrados = usuarios.filter(usuario => {
            return usuario.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                   usuario.email.toLowerCase().includes(termoBusca.toLowerCase()) ||
                   Utils.formatarCargo(usuario.cargo).toLowerCase().includes(termoBusca.toLowerCase());
        });
        
        // Atualizar tabela com resultados
        atualizarTabelaUsuarios(usuariosFiltrados);
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao buscar usuários. Por favor, tente novamente.');
    }
};

// Abrir modal para novo usuário
const abrirModalNovoUsuario = () => {
    // Limpar formulário
    document.getElementById('form-usuario').reset();
    document.getElementById('usuario-id').value = '';
    
    // Mostrar campo de senha
    document.getElementById('grupo-senha').style.display = 'block';
    document.getElementById('usuario-senha').required = true;
    
    // Atualizar título do modal
    document.getElementById('modal-usuario-titulo').textContent = 'Novo Usuário';
    
    // Exibir modal
    document.getElementById('modal-usuario').style.display = 'block';
};

// Abrir modal para editar usuário
const editarUsuario = async (usuarioId) => {
    try {
        Utils.mostrarLoading();
        
        // Buscar dados do usuário
        const usuario = await API.Usuario.getById(usuarioId);
        
        // Preencher formulário
        document.getElementById('usuario-id').value = usuario._id;
        document.getElementById('usuario-nome').value = usuario.nome || '';
        document.getElementById('usuario-email').value = usuario.email || '';
        document.getElementById('usuario-cargo').value = usuario.cargo || 'operador';
        
        // Esconder campo de senha na edição
        document.getElementById('grupo-senha').style.display = 'none';
        document.getElementById('usuario-senha').required = false;
        
        // Atualizar título do modal
        document.getElementById('modal-usuario-titulo').textContent = 'Editar Usuário';
        
        // Exibir modal
        document.getElementById('modal-usuario').style.display = 'block';
        
        Utils.esconderLoading();
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao carregar dados do usuário. Por favor, tente novamente.');
    }
};

// Salvar usuário (criar ou atualizar)
const salvarUsuario = async () => {
    try {
        // Validar formulário
        const form = document.getElementById('form-usuario');
        if (!Utils.validarFormulario(form)) {
            Utils.mostrarAlerta('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        Utils.mostrarLoading();
        
        // Obter dados do formulário
        const usuarioId = document.getElementById('usuario-id').value;
        const usuarioData = {
            nome: document.getElementById('usuario-nome').value,
            email: document.getElementById('usuario-email').value,
            cargo: document.getElementById('usuario-cargo').value
        };
        
        // Adicionar senha apenas para novos usuários
        if (!usuarioId) {
            usuarioData.senha = document.getElementById('usuario-senha').value;
        }
        
        let response;
        
        // Criar ou atualizar usuário
        if (usuarioId) {
            response = await API.Usuario.update(usuarioId, usuarioData);
        } else {
            response = await API.Usuario.create(usuarioData);
        }
        
        // Fechar modal
        document.getElementById('modal-usuario').style.display = 'none';
        
        // Recarregar lista de usuários
        const usuarios = await API.Usuario.getAll();
        atualizarTabelaUsuarios(usuarios);
        
        Utils.esconderLoading();
        
        // Mostrar mensagem de sucesso
        Utils.mostrarAlerta(usuarioId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao salvar usuário. Por favor, tente novamente.');
    }
};

// Confirmar exclusão de usuário
const confirmarExclusaoUsuario = (usuarioId) => {
    Utils.mostrarConfirmacao(
        'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
        () => excluirUsuario(usuarioId),
        null
    );
};

// Excluir usuário
const excluirUsuario = async (usuarioId) => {
    try {
        Utils.mostrarLoading();
        
        // Verificar se é o próprio usuário
        const usuarioAtual = Auth.getUsuarioAtual();
        if (usuarioAtual.id === usuarioId) {
            Utils.esconderLoading();
            Utils.mostrarAlerta('Você não pode excluir seu próprio usuário.');
            return;
        }
        
        // Excluir usuário
        await API.Usuario.delete(usuarioId);
        
        // Recarregar lista de usuários
        const usuarios = await API.Usuario.getAll();
        atualizarTabelaUsuarios(usuarios);
        
        Utils.esconderLoading();
        
        // Mostrar mensagem de sucesso
        Utils.mostrarAlerta('Usuário excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao excluir usuário. Por favor, tente novamente.');
    }
};

// Abrir modal para alterar senha
const abrirModalAlterarSenha = () => {
    // Limpar formulário
    document.getElementById('form-alterar-senha').reset();
    
    // Exibir modal
    document.getElementById('modal-alterar-senha').style.display = 'block';
};

// Alterar senha do usuário atual
const alterarSenha = async () => {
    try {
        // Validar formulário
        const form = document.getElementById('form-alterar-senha');
        if (!Utils.validarFormulario(form)) {
            Utils.mostrarAlerta('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Verificar se as senhas coincidem
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        
        if (novaSenha !== confirmarSenha) {
            Utils.mostrarAlerta('As senhas não coincidem. Por favor, tente novamente.');
            return;
        }
        
        Utils.mostrarLoading();
        
        // Obter dados do formulário
        const senhaAtual = document.getElementById('senha-atual').value;
        
        // Alterar senha
        await API.Usuario.alterarSenha({
            senhaAtual,
            novaSenha
        });
        
        // Fechar modal
        document.getElementById('modal-alterar-senha').style.display = 'none';
        
        Utils.esconderLoading();
        
        // Mostrar mensagem de sucesso
        Utils.mostrarAlerta('Senha alterada com sucesso!');
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        Utils.esconderLoading();
        Utils.mostrarAlerta('Erro ao alterar senha. Verifique se a senha atual está correta.');
    }
};

// Exportar funções de usuários
const Usuarios = {
    inicializarUsuarios,
    atualizarTabelaUsuarios,
    configurarEventosUsuarios,
    buscarUsuarios,
    abrirModalNovoUsuario,
    editarUsuario,
    salvarUsuario,
    confirmarExclusaoUsuario,
    excluirUsuario,
    abrirModalAlterarSenha,
    alterarSenha
};
