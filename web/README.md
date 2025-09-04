# 🌐 Frontend - Plataforma de Chamados

Interface web da plataforma de gerenciamento de chamados desenvolvida com React, TypeScript e Tailwind CSS.

## 🌐 Deploy

**Aplicação online:** [https://help-desk-git-master-lxcasgarcia09-gmailcoms-projects.vercel.app](https://help-desk-git-master-lxcasgarcia09-gmailcoms-projects.vercel.app)

## 🎯 Sobre o Frontend

Interface moderna e responsiva para o sistema de chamados, com painéis específicos para cada tipo de usuário (Administrador, Técnico e Cliente).

## 🛠️ Tecnologias

- **React 18** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento da aplicação
- **Axios** - Cliente HTTP
- **Zod** - Validação de schemas
- **Context API** - Gerenciamento de estado

## 📁 Estrutura

```
web/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── business/            # Componentes de negócio
│   │   │   ├── badges/              # Badges e tags
│   │   │   └── profile/             # Componentes de perfil
│   │   ├── layout/              # Componentes de layout
│   │   ├── modals/              # Modais da aplicação
│   │   └── ui/                  # Componentes base da UI
│   │       ├── buttons/             # Botões
│   │       ├── forms/               # Formulários
│   │       ├── feedback/            # Estados de feedback
│   │       └── navigation/          # Navegação
│   ├── pages/                 # Páginas da aplicação
│   │   ├── SignIn.tsx             # Página de login
│   │   ├── SignUp.tsx             # Página de registro
│   │   ├── Call.tsx               # Lista de chamados (Admin)
│   │   ├── CallDetail.tsx         # Detalhes do chamado
│   │   ├── Technicians.tsx        # Gerenciamento de técnicos
│   │   ├── Clients.tsx            # Gerenciamento de clientes
│   │   ├── Services.tsx           # Gerenciamento de serviços
│   │   ├── TechnicianCalls.tsx    # Chamados do técnico
│   │   ├── ClientCalls.tsx        # Chamados do cliente
│   │   └── NotFound.tsx           # Página 404
│   ├── contexts/              # Contextos React
│   │   ├── AuthContext.tsx        # Contexto de autenticação
│   │   └── CallsContext.tsx       # Contexto de chamados
│   ├── hooks/                 # Hooks customizados
│   │   ├── useAuth.tsx            # Hook de autenticação
│   │   ├── useApi.tsx             # Hook para chamadas API
│   │   ├── useFormValidation.tsx  # Hook de validação
│   │   └── usePagination.tsx      # Hook de paginação
│   ├── services/              # Serviços de API
│   │   └── api/                   # Serviços específicos
│   │       ├── auth.ts                # Autenticação
│   │       ├── calls.ts               # Chamados
│   │       ├── clients.ts             # Clientes
│   │       ├── services.ts            # Serviços
│   │       └── technicians.ts         # Técnicos
│   ├── types/                  # Tipos TypeScript
│   │   ├── entities/               # Entidades do sistema
│   │   └── dtos/                   # DTOs de requisição/resposta
│   ├── utils/                  # Funções utilitárias
│   │   ├── formatters.ts            # Formatadores
│   │   ├── availability.ts          # Utilitários de disponibilidade
│   │   └── status.ts                # Utilitários de status
│   ├── routes/                 # Configuração de rotas
│   │   ├── index.tsx               # Roteamento principal
│   │   ├── AdminRoutes.tsx         # Rotas de admin
│   │   ├── TechnicianRoutes.tsx    # Rotas de técnico
│   │   ├── ClientRoutes.tsx        # Rotas de cliente
│   │   └── AuthRoute.tsx           # Rotas de autenticação
│   ├── App.tsx                 # Componente principal
│   └── main.tsx                # Ponto de entrada
├── public/                    # Arquivos estáticos
├── package.json               # Dependências e scripts
└── tailwind.config.js         # Configuração Tailwind
```

## ⚠️ Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Backend rodando** na porta 3333

## 🚀 Instalação

### 1. Instale as dependências

```bash
npm install
```

## 🏃‍♂️ Executando

### Desenvolvimento

```bash
# Executar em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

## ✨ Funcionalidades

### 🔐 Autenticação

- **Login/Registro** com validação de formulários
- **Controle de acesso** baseado em roles
- **Gerenciamento de sessão** com JWT

### 👨‍💼 Painel Administrativo

- **Dashboard** com visão geral dos chamados
- **Gerenciamento de técnicos** (CRUD completo)
- **Gerenciamento de clientes** (CRUD completo)
- **Gerenciamento de serviços** (CRUD completo)
- **Visualização de chamados** com paginação

### 🔧 Painel do Técnico

- **Lista de chamados** atribuídos
- **Atualização de status** dos chamados
- **Gerenciamento de disponibilidade**
- **Histórico de atendimentos**

### 👥 Painel do Cliente

- **Criação de novos chamados**
- **Acompanhamento de status**
- **Histórico de chamados**
- **Seleção de serviços**

### 🎨 Interface

- **Componentes reutilizáveis** e consistentes
- **Validação em tempo real** de formulários
- **Feedback visual** para todas as ações
- **Paginação** em todas as listas

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com API**

   - Verifique se o backend está rodando
   - Confirme a URL no arquivo `.env`

2. **Erro de build**

   - Limpe o cache: `npm run build --force`
   - Verifique se todas as dependências estão instaladas

3. **Problemas de roteamento**
   - Verifique se o React Router está configurado
   - Confirme se as rotas estão definidas corretamente

## 👨‍💻 Autor

**Lucas Garcia** : - [GitHub](https://github.com/lxcasgarcia) - [Linkedin](https://www.linkedin.com/in/lucas-gabriel-dos-santos-garcia/) - [Email](lucasdsantosgarcia@gmail.com)

## 🙏 Agradecimentos

- **Rocketseat** - Curso de desenvolvimento full-stack

---
