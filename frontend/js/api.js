// Configuração da API
const API_URL = 'https://sistema-gestao-entregas-backend.onrender.com/api';

// Funções de API para autenticação
const AuthAPI = {
    login: async (email, senha) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao fazer login');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },
    
    setup: async () => {
        try {
            const response = await fetch(`${API_URL}/auth/setup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao configurar usuário admin');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na configuração inicial:', error);
            throw error;
        }
    }
};

// Funções de API para usuários
const UserAPI = {
    getAll: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar usuários');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw error;
        }
    },
    
    create: async (userData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar usuário');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    },
    
    update: async (id, userData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao atualizar usuário');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    },
    
    delete: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao excluir usuário');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            throw error;
        }
    }
};

// Funções de API para clientes
const ClienteAPI = {
    getAll: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar clientes');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw error;
        }
    },
    
    getById: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/clientes/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar cliente');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            throw error;
        }
    },
    
    create: async (clienteData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(clienteData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar cliente');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            throw error;
        }
    },
    
    update: async (id, clienteData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/clientes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(clienteData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao atualizar cliente');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            throw error;
        }
    },
    
    delete: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/clientes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao excluir cliente');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            throw error;
        }
    }
};

// Funções de API para entregas
const EntregaAPI = {
    getAll: async (filtros = {}) => {
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/entregas`;
            
            // Adicionar filtros à URL se existirem
            if (Object.keys(filtros).length > 0) {
                const params = new URLSearchParams();
                for (const key in filtros) {
                    if (filtros[key]) {
                        params.append(key, filtros[key]);
                    }
                }
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar entregas');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar entregas:', error);
            throw error;
        }
    },
    
    getById: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/entregas/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar entrega');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar entrega:', error);
            throw error;
        }
    },
    
    create: async (entregaData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/entregas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(entregaData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar entrega');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar entrega:', error);
            throw error;
        }
    },
    
    update: async (id, entregaData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/entregas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(entregaData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao atualizar entrega');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar entrega:', error);
            throw error;
        }
    },
    
    updateStatus: async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/entregas/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao atualizar status da entrega');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar status da entrega:', error);
            throw error;
        }
    },
    
    delete: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/entregas/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao excluir entrega');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao excluir entrega:', error);
            throw error;
        }
    },
    
    getRelatorio: async (tipo, params) => {
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/relatorios/${tipo}`;
            
            // Adicionar parâmetros à URL
            if (params) {
                const urlParams = new URLSearchParams();
                for (const key in params) {
                    if (params[key]) {
                        urlParams.append(key, params[key]);
                    }
                }
                url += `?${urlParams.toString()}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao gerar relatório');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw error;
        }
    }
};

// Exportar as APIs
const API = {
    Auth: AuthAPI,
    User: UserAPI,
    Cliente: ClienteAPI,
    Entrega: EntregaAPI
};
