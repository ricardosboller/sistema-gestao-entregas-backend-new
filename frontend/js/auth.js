// Gerenciamento de autenticação

// Verificar se o usuário está autenticado
const verificarAutenticacao = () => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    if (!token || !usuario) {
        // Redirecionar para a página de login se não estiver autenticado
        window.location.href = 'index.html';
        return false;
    }
    
    // Verificar se o token expirou (implementação básica)
    try {
        const usuarioObj = JSON.parse(usuario);
        const agora = new Date();
        const dataExpiracao = new Date(usuarioObj.expiracao);
        
        if (agora > dataExpiracao) {
            // Token expirado, fazer logout
            logout();
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        logout();
        return false;
    }
    
    return true;
};

// Realizar login
const login = async (email, senha) => {
    try {
        Utils.mostrarLoading();
        
        const response = await API.Auth.login(email, senha);
        
        if (response && response.token) {
            // Salvar token e informações do usuário
            localStorage.setItem('token', response.token);
            
            // Adicionar data de expiração (24 horas)
            const usuario = response.user;
            const expiracao = new Date();
            expiracao.setHours(expiracao.getHours() + 24);
            usuario.expiracao = expiracao;
            
            localStorage.setItem('usuario', JSON.stringify(usuario));
            
            // Redirecionar para o dashboard
            window.location.href = 'app.html#dashboard-page';
            return true;
        } else {
            throw new Error('Resposta inválida do servidor');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        Utils.esconderLoading();
        return false;
    }
};

// Realizar logout
const logout = () => {
    // Limpar dados de autenticação
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Redirecionar para a página de login
    window.location.href = 'index.html';
};

// Obter informações do usuário logado
const getUsuarioLogado = () => {
    const usuarioJSON = localStorage.getItem('usuario');
    if (!usuarioJSON) return null;
    
    try {
        return JSON.parse(usuarioJSON);
    } catch (error) {
        console.error('Erro ao obter usuário logado:', error);
        return null;
    }
};

// Verificar se o usuário tem permissão para acessar uma funcionalidade
const verificarPermissaoAcesso = (permissaoNecessaria) => {
    const usuario = getUsuarioLogado();
    if (!usuario) return false;
    
    // Administrador tem acesso a tudo
    if (usuario.cargo === 'admin') return true;
    
    // Gerente tem acesso a tudo exceto gerenciamento de usuários
    if (usuario.cargo === 'gerente') {
        return permissaoNecessaria !== 'admin';
    }
    
    // Operador tem acesso limitado
    if (usuario.cargo === 'operador') {
        return ['operador', 'visualizar'].includes(permissaoNecessaria);
    }
    
    return false;
};

// Configurar elementos da interface baseado nas permissões
const configurarInterfacePorPermissao = () => {
    const usuario = getUsuarioLogado();
    if (!usuario) return;
    
    // Exibir nome do usuário
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = usuario.nome;
    });
    
    // Exibir cargo do usuário
    const userRoleElements = document.querySelectorAll('.user-role');
    userRoleElements.forEach(element => {
        element.textContent = Utils.formatarCargo(usuario.cargo);
    });
    
    // Configurar visibilidade de itens do menu
    if (usuario.cargo !== 'admin') {
        const menuUsuarios = document.getElementById('menu-usuarios');
        if (menuUsuarios) {
            menuUsuarios.style.display = 'none';
        }
    }
    
    // Configurar visibilidade de botões de ação
    const botoesAdmin = document.querySelectorAll('.admin-only');
    botoesAdmin.forEach(botao => {
        botao.style.display = usuario.cargo === 'admin' ? 'inline-flex' : 'none';
    });
    
    const botoesGerente = document.querySelectorAll('.gerente-only');
    botoesGerente.forEach(botao => {
        botao.style.display = ['admin', 'gerente'].includes(usuario.cargo) ? 'inline-flex' : 'none';
    });
};

// Inicializar configuração de autenticação
const inicializarAutenticacao = () => {
    // Configurar evento de logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            Utils.mostrarConfirmacao(
                'Deseja realmente sair do sistema?',
                () => logout(),
                null
            );
        });
    }
    
    // Configurar interface baseada nas permissões
    configurarInterfacePorPermissao();
};

// Exportar funções de autenticação
const Auth = {
    verificarAutenticacao,
    login,
    logout,
    getUsuarioLogado,
    verificarPermissaoAcesso,
    configurarInterfacePorPermissao,
    inicializarAutenticacao
};
