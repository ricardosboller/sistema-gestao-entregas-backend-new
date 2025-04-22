# Sistema de Gestão de Entregas - README

Este repositório contém todos os arquivos necessários para implantar o Sistema de Gestão de Entregas, uma aplicação web completa para gerenciamento de entregas de suínos.

## Estrutura do Projeto

O projeto está organizado nas seguintes pastas:

- **frontend**: Contém todos os arquivos da interface de usuário (HTML, CSS, JavaScript)
- **backend**: Contém a API RESTful (Node.js, Express, MongoDB)
- **docs**: Contém a documentação completa do sistema

## Documentação

A documentação completa do sistema está disponível na pasta `docs`:

- [Documentação do Sistema](docs/system-documentation.md): Descrição detalhada de todas as funcionalidades
- [Guia de Implantação](docs/deployment-guide.md): Instruções passo a passo para implantar o sistema
- [Configuração do MongoDB Atlas](docs/mongodb-setup.md): Instruções para configurar o banco de dados

## Requisitos Técnicos

- Node.js 14.x ou superior
- NPM 6.x ou superior
- MongoDB Atlas (banco de dados na nuvem)
- Netlify (para hospedagem do frontend)
- Render (para hospedagem do backend)

## Implantação Rápida

### Backend (Render)

1. Crie um repositório no GitHub e faça upload dos arquivos da pasta `backend`
2. No Render, crie um novo Web Service conectado ao repositório
3. Configure o serviço:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Adicione as variáveis de ambiente conforme o arquivo `.env`

### Frontend (Netlify)

1. Atualize a URL da API no arquivo `frontend/js/api.js`
2. Crie um repositório no GitHub e faça upload dos arquivos da pasta `frontend`
3. No Netlify, crie um novo site conectado ao repositório
4. Configure as regras de redirecionamento conforme o guia de implantação

## Funcionalidades Principais

- Autenticação e controle de acesso (Admin, Gerente, Operador)
- Gestão completa de clientes
- Gestão de entregas com ciclo de vida completo
- Relatórios e análises detalhados
- Dashboard interativo

## Suporte

Para suporte ou dúvidas sobre a implantação, consulte a documentação detalhada na pasta `docs` ou entre em contato com a equipe de desenvolvimento.

## Licença

Este projeto é propriedade da BTH Group e seu uso é restrito aos termos acordados.
