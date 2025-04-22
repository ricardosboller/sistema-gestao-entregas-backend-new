// Arquivo principal da aplicação

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

// Inicializar aplicação
const inicializarApp = () => {
    // Configurar navegação
    configurarNavegacao();
    
    // Configurar eventos globais
    configurarEventosGlobais();
    
    // Verificar autenticação
    verificarAutenticacaoInicial();
    
    // Carregar página inicial ou redirecionar para login
    carregarPaginaInicial();
};

// Configurar navegação entre páginas
const configurarNavegacao = () => {
    // Adicionar evento de mudança de hash para navegação
    window.addEventListener('hashchange', navegarParaPagina);
    
    // Configurar links do menu
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Fechar menu mobile se estiver aberto
            const menuMobile = document.getElementById('menu-mobile');
            if (menuMobile && menuMobile.classList.contains('active')) {
                menuMobile.classList.remove('active');
            }
        });
    });
    
    // Configurar botão de menu mobile
    const btnMenuMobile = document.getElementById('btn-menu-mobile');
    if (btnMenuMobile) {
        btnMenuMobile.addEventListener('click', toggleMenuMobile);
    }
};

// Alternar visibilidade do menu mobile
const toggleMenuMobile = () => {
    const menuMobile = document.getElementById('menu-mobile');
    if (menuMobile) {
        menuMobile.classList.toggle('active');
    }
};

// Configurar eventos globais
const configurarEventosGlobais = () => {
    // Configurar botão de logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', Auth.logout);
    }
    
    // Configurar botão de alterar senha
    const btnAlterarSenha = document.getElementById('btn-alterar-senha');
    if (btnAlterarSenha) {
        btnAlterarSenha.addEventListener('click', Usuarios.abrirModalAlterarSenha);
    }
    
    // Configurar formulário de alteração de senha
    const formAlterarSenha = document.getElementById('form-alterar-senha');
    if (formAlterarSenha) {
        formAlterarSenha.addEventListener('submit', (e) => {
            e.preventDefault();
            Usuarios.alterarSenha();
        });
    }
    
    // Configurar botões de fechar modais
    const botoesFechar = document.querySelectorAll('.btn-fechar-modal');
    botoesFechar.forEach(botao => {
        botao.addEventListener('click', () => {
            const modal = botao.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Fechar modais ao clicar fora deles
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Impedir propagação de cliques dentro do conteúdo do modal
    const modaisConteudo = document.querySelectorAll('.modal-conteudo');
    modaisConteudo.forEach(conteudo => {
        conteudo.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
};

// Verificar autenticação inicial
const verificarAutenticacaoInicial = () => {
    // Verificar se o usuário está autenticado
    const autenticado = Auth.verificarAutenticacao(false);
    
    // Atualizar interface com base na autenticação
    atualizarInterfaceAutenticacao(autenticado);
};

// Atualizar interface com base na autenticação
const atualizarInterfaceAutenticacao = (autenticado) => {
    const elementosAutenticados = document.querySelectorAll('.autenticado');
    const elementosNaoAutenticados = document.querySelectorAll('.nao-autenticado');
    
    // Mostrar ou esconder elementos com base na autenticação
    elementosAutenticados.forEach(elemento => {
        elemento.style.display = autenticado ? 'block' : 'none';
    });
    
    elementosNaoAutenticados.forEach(elemento => {
        elemento.style.display = autenticado ? 'none' : 'block';
    });
    
    // Se autenticado, configurar interface por permissão
    if (autenticado) {
        Auth.configurarInterfacePorPermissao();
        
        // Atualizar nome do usuário
        const usuarioAtual = Auth.getUsuarioAtual();
        const nomeUsuarioElement = document.getElementById('nome-usuario');
        if (nomeUsuarioElement && usuarioAtual) {
            nomeUsuarioElement.textContent = usuarioAtual.nome;
        }
    }
};

// Carregar página inicial
const carregarPaginaInicial = () => {
    // Verificar se há um hash na URL
    if (window.location.hash) {
        // Navegar para a página especificada no hash
        navegarParaPagina();
    } else {
        // Redirecionar para a página inicial com base na autenticação
        if (Auth.verificarAutenticacao(false)) {
            window.location.hash = '#dashboard';
        } else {
            window.location.hash = '#login';
        }
    }
};

// Navegar para a página especificada no hash
const navegarParaPagina = () => {
    // Obter página do hash
    const hash = window.location.hash.substring(1) || 'login';
    
    // Verificar autenticação para páginas protegidas
    if (hash !== 'login' && !Auth.verificarAutenticacao(false)) {
        window.location.hash = '#login';
        return;
    }
    
    // Esconder todas as páginas
    const paginas = document.querySelectorAll('.pagina');
    paginas.forEach(pagina => {
        pagina.style.display = 'none';
    });
    
    // Mostrar página selecionada
    const paginaAtual = document.getElementById(`pagina-${hash}`);
    if (paginaAtual) {
        paginaAtual.style.display = 'block';
        
        // Atualizar menu ativo
        atualizarMenuAtivo(hash);
        
        // Inicializar página específica
        inicializarPaginaEspecifica(hash);
    } else {
        // Página não encontrada, redirecionar para dashboard ou login
        if (Auth.verificarAutenticacao(false)) {
            window.location.hash = '#dashboard';
        } else {
            window.location.hash = '#login';
        }
    }
};

// Atualizar item de menu ativo
const atualizarMenuAtivo = (pagina) => {
    // Remover classe ativa de todos os itens do menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Adicionar classe ativa ao item correspondente à página atual
    const menuItemAtivo = document.querySelector(`.menu-item[data-page="${pagina}"]`);
    if (menuItemAtivo) {
        menuItemAtivo.classList.add('active');
    }
};

// Inicializar página específica
const inicializarPaginaEspecifica = (pagina) => {
    switch (pagina) {
        case 'login':
            // Página de login não precisa de inicialização especial
            break;
        case 'dashboard':
            Dashboard.inicializarDashboard();
            break;
        case 'clientes':
            Clientes.inicializarClientes();
            break;
        case 'entregas':
            Entregas.inicializarEntregas();
            break;
        case 'relatorios':
            Relatorios.inicializarRelatorios();
            break;
        case 'usuarios':
            Usuarios.inicializarUsuarios();
            break;
        default:
            console.warn(`Inicialização não implementada para a página: ${pagina}`);
    }
};

// Exportar funções principais
const App = {
    inicializarApp,
    configurarNavegacao,
    configurarEventosGlobais,
    verificarAutenticacaoInicial,
    atualizarInterfaceAutenticacao,
    carregarPaginaInicial,
    navegarParaPagina,
    atualizarMenuAtivo,
    inicializarPaginaEspecifica
};
