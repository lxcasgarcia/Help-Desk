# 🚀 Plataforma de Chamados - Help Desk

Sistema completo de gerenciamento de chamados desenvolvido como projeto final do curso Full-Stack da Rocketseat.

## 🌐 Deploy

- **Backend (API):** [https://help-desk-y1w4.onrender.com](https://help-desk-y1w4.onrender.com)
- **Frontend (Web):** [https://help-desk-git-master-lxcasgarcia09-gmailcoms-projects.vercel.app](https://help-desk-git-master-lxcasgarcia09-gmailcoms-projects.vercel.app)

## 🎯 Sobre o Projeto

Neste desafio, desenvolvemos um Sistema de Gerenciamento de Chamados. Construímos uma aplicação de ponta a ponta com front-end e back-end, utilizando as tecnologias aprendidas na formação Full-Stack, simulando um aplicativo de gerenciamento de chamados com painel de Administrador, Técnico e Cliente.

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização

- Sistema de login com JWT
- Controle de acesso baseado em roles (Admin, Técnico, Cliente)
- Gerenciamento de perfis de usuário

### 👨‍💼 Administração

- Dashboard completo com métricas
- Gerenciamento de técnicos e clientes
- Criação e configuração de serviços
- Visualização de todos os chamados

### 🔧 Técnicos

- Visualização de chamados atribuídos
- Atualização de status de chamados
- Gerenciamento de disponibilidade
- Histórico de atendimentos

### 👥 Clientes

- Criação de novos chamados
- Acompanhamento de status
- Histórico de chamados
- Seleção de serviços

### 📊 Sistema Inteligente

- Atribuição automática de técnicos
- Verificação de disponibilidade em tempo real
- Balanceamento de carga entre técnicos
- Validação de horários de atendimento

## 🛠️ Tecnologias

### Frontend

- **React 18** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento da aplicação
- **Axios** - Cliente HTTP
- **Zod** - Validação de schemas

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Multer** - Upload de arquivos
- **Sharp** - Processamento de imagens

## 📁 Estrutura do Projeto

```
plataforma_de_chamados/
├── web/                    # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes UI
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Contextos React (Auth, Calls)
│   │   ├── hooks/         # Hooks customizados
│   │   ├── services/      # Serviços de API
│   │   ├── types/         # Tipos TypeScript
│   │   └── utils/         # Funções utilitárias
│   └── package.json       # Dependências frontend
├── api/                    # Backend Node.js
│   ├── src/
│   │   ├── controllers/   # Controladores
│   │   ├── middlewares/   # Middlewares
│   │   ├── routes/        # Rotas da API
│   │   ├── providers/     # Provedores
│   │   └── utils/         # Utilitários
│   ├── prisma/            # Schema e migrações
│   └── package.json       # Dependências backend
└── README.md              # Este arquivo
```

## ⚠️ Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versão 13 ou superior)
- **Git**

## 🚀 Instalação

### 1. Instale as dependências

```bash
# Instalar dependências do backend
cd api
npm install

# Instalar dependências do frontend
cd ../web
npm install
```

### 2. Configure o banco de dados

```bash
# Voltar para a pasta api
cd ../api

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrações
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate
```

## ⚙️ Configuração

### Backend (.env)

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/plataforma_chamados"

# JWT
JWT_SECRET="sua-chave-secreta-jwt"

# Servidor
PORT=3333
NODE_ENV=development

# Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
```

## 🏃‍♂️ Executando a Aplicação

### 1. Iniciar o Backend

```bash
cd api
npm run dev
```

O backend estará rodando em: `http://localhost:3333`

### 2. Iniciar o Frontend

```bash
cd web
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

## 📚 API Endpoints

### Autenticação

- `POST /sessions` - Login
- `DELETE /sessions` - Logout
- `POST /users` - Registro
- `GET /users/profile` - Perfil do usuário
- `PUT /users/profile` - Atualizar perfil

### Chamados

- `GET /calls` - Listar chamados
- `POST /calls` - Criar chamado
- `GET /calls/:id` - Detalhes do chamado
- `PUT /calls/:id` - Atualizar chamado
- `DELETE /calls/:id` - Deletar chamado
- `PATCH /calls/:id/status` - Atualizar status
- `PATCH /calls/:id/assign` - Atribuir técnico

### Técnicos

- `GET /technicians` - Listar técnicos
- `POST /technicians` - Criar técnico
- `GET /technicians/:id` - Detalhes do técnico
- `PUT /technicians/:id` - Atualizar técnico
- `DELETE /technicians/:id` - Deletar técnico

### Clientes

- `GET /clients` - Listar clientes
- `POST /clients` - Criar cliente
- `GET /clients/:id` - Detalhes do cliente
- `PUT /clients/:id` - Atualizar cliente
- `DELETE /clients/:id` - Deletar cliente

### Serviços

- `GET /services` - Listar serviços
- `POST /services` - Criar serviço
- `GET /services/:id` - Detalhes do serviço
- `PUT /services/:id` - Atualizar serviço
- `DELETE /services/:id` - Deletar serviço

## 👨‍💻 Autor

**Lucas Garcia** : - [GitHub](https://github.com/lxcasgarcia) - [Linkedin](https://www.linkedin.com/in/lucas-gabriel-dos-santos-garcia/) - [Email](lucasdsantosgarcia@gmail.com)

## 🙏 Agradecimentos

- **Rocketseat** - Curso de desenvolvimento full-stack

---
