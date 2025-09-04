# 🔧 Backend - Plataforma de Chamados

API REST completa para o sistema de gerenciamento de chamados desenvolvida com Node.js, Express, TypeScript e Prisma.

## 🌐 Deploy

**API online:** [https://help-desk-y1w4.onrender.com](https://help-desk-y1w4.onrender.com)

## 🎯 Sobre o Backend

Servidor robusto e escalável que gerencia toda a lógica de negócio da plataforma de chamados, incluindo autenticação, autorização e gerenciamento de dados.

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Multer** - Upload de arquivos
- **Sharp** - Processamento de imagens
- **Zod** - Validação de schemas
- **Bcrypt** - Hash de senhas

## 📁 Estrutura

```
api/
├── src/
│   ├── controllers/           # Lógica de negócio
│   │   ├── auth-controller.ts     # Autenticação
│   │   ├── calls-controller.ts    # Gerenciamento de chamados
│   │   ├── clients-controller.ts  # Gerenciamento de clientes
│   │   ├── services-controller.ts # Gerenciamento de serviços
│   │   ├── technicians-controller.ts # Gerenciamento de técnicos
│   │   └── uploads-controller.ts  # Upload de arquivos
│   ├── middlewares/           # Middlewares
│   │   ├── ensure-authenticated.ts # Verificação de autenticação
│   │   ├── verify-user-authorization.ts # Verificação de autorização
│   │   └── error-handling.ts      # Tratamento de erros
│   ├── routes/                # Definição de rotas
│   │   ├── auth-routes.ts         # Rotas de autenticação
│   │   ├── calls-routes.ts        # Rotas de chamados
│   │   ├── clients-routes.ts      # Rotas de clientes
│   │   ├── services-routes.ts     # Rotas de serviços
│   │   ├── technicians-routes.ts  # Rotas de técnicos
│   │   └── uploads-routes.ts      # Rotas de upload
│   ├── providers/              # Provedores de serviços
│   │   └── disk-storage.ts        # Gerenciamento de arquivos
│   ├── utils/                  # Utilitários
│   │   ├── AppError.ts            # Classe de erro personalizada
│   │   ├── UrlHelper.ts           # Helper para URLs
│   │   └── ProfileImageGenerator.ts # Gerador de imagens padrão
│   └── server.ts               # Configuração do servidor
├── prisma/                     # Schema e migrações
│   ├── schema.prisma              # Schema do banco
│   └── migrations/               # Migrações do banco
├── uploads/                     # Arquivos enviados
├── .env.example                 # Exemplo de variáveis de ambiente
├── package.json                 # Dependências e scripts
└── tsconfig.json                # Configuração TypeScript
```

## ⚠️ Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versão 13 ou superior)
- **Git**

## 🚀 Instalação

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/plataforma_chamados"

# JWT
JWT_SECRET="sua-chave-secreta-jwt-super-segura"

# Servidor
PORT=3333
NODE_ENV=development

# Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
```

### 4. Configure o banco de dados

```bash
# Execute as migrações
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate
```

## ⚙️ Configuração

### Banco de Dados

O projeto usa **PostgreSQL** com **Prisma ORM**. Certifique-se de:

1. **Instalar PostgreSQL** em sua máquina
2. **Criar um banco de dados** chamado `plataforma_chamados`
3. **Configurar a URL** no arquivo `.env`

## 🏃‍♂️ Executando

### Desenvolvimento

```bash
# Executar com hot-reload
npm run dev
```

### Outros Comandos

```bash
# Verificar tipos TypeScript
npm run type-check

# Abrir Prisma Studio
npx prisma studio
```

## 📚 API Endpoints

### 🔐 Autenticação

| Método   | Endpoint                  | Descrição                   |
| -------- | ------------------------- | --------------------------- |
| `POST`   | `/sessions`               | Login do usuário            |
| `DELETE` | `/sessions`               | Logout do usuário           |
| `POST`   | `/users`                  | Registro de novo usuário    |
| `GET`    | `/users/profile`          | Obter perfil do usuário     |
| `PUT`    | `/users/profile`          | Atualizar perfil do usuário |
| `PATCH`  | `/users/profile/password` | Alterar senha               |

### 📞 Chamados

| Método   | Endpoint                         | Descrição                             |
| -------- | -------------------------------- | ------------------------------------- |
| `GET`    | `/calls`                         | Listar chamados (com paginação)       |
| `POST`   | `/calls`                         | Criar novo chamado                    |
| `GET`    | `/calls/:id`                     | Obter detalhes do chamado             |
| `PUT`    | `/calls/:id`                     | Atualizar chamado                     |
| `DELETE` | `/calls/:id`                     | Deletar chamado                       |
| `PATCH`  | `/calls/:id/status`              | Atualizar status do chamado           |
| `PATCH`  | `/calls/:id/assign`              | Atribuir técnico ao chamado           |
| `PATCH`  | `/calls/:id/additional-services` | Atualizar serviços adicionais         |
| `GET`    | `/calls/availability`            | Verificar disponibilidade de técnicos |

### 🔧 Técnicos

| Método   | Endpoint                 | Descrição                       |
| -------- | ------------------------ | ------------------------------- |
| `GET`    | `/technicians`           | Listar técnicos (com paginação) |
| `POST`   | `/technicians`           | Criar novo técnico              |
| `GET`    | `/technicians/:id`       | Obter detalhes do técnico       |
| `PUT`    | `/technicians/:id`       | Atualizar técnico               |
| `DELETE` | `/technicians/:id`       | Deletar técnico                 |
| `GET`    | `/technicians/available` | Listar técnicos disponíveis     |

### 👥 Clientes

| Método   | Endpoint          | Descrição                       |
| -------- | ----------------- | ------------------------------- |
| `GET`    | `/clients`        | Listar clientes (com paginação) |
| `POST`   | `/clients`        | Criar novo cliente              |
| `GET`    | `/clients/:id`    | Obter detalhes do cliente       |
| `PUT`    | `/clients/:id`    | Atualizar cliente               |
| `DELETE` | `/clients/:id`    | Deletar cliente                 |
| `GET`    | `/clients/search` | Buscar clientes por nome        |

### 🛠️ Serviços

| Método   | Endpoint               | Descrição                       |
| -------- | ---------------------- | ------------------------------- |
| `GET`    | `/services`            | Listar serviços (com paginação) |
| `POST`   | `/services`            | Criar novo serviço              |
| `GET`    | `/services/:id`        | Obter detalhes do serviço       |
| `PUT`    | `/services/:id`        | Atualizar serviço               |
| `DELETE` | `/services/:id`        | Deletar serviço                 |
| `PATCH`  | `/services/:id/status` | Alternar status ativo/inativo   |
| `GET`    | `/services/active`     | Listar serviços ativos          |

### 📁 Uploads

| Método  | Endpoint                 | Descrição                  |
| ------- | ------------------------ | -------------------------- |
| `PATCH` | `/uploads/profile-image` | Upload de imagem de perfil |

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**

   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no `.env`

2. **Erro de JWT**

   - Verifique se `JWT_SECRET` está configurado
   - Confirme se o token não expirou

3. **Erro de upload**
   - Verifique se a pasta `uploads` existe
   - Confirme permissões de escrita

## 👨‍💻 Autor

**\*Lucas Garcia** : - [GitHub](https://github.com/lxcasgarcia) - [Linkedin](https://www.linkedin.com/in/lucas-gabriel-dos-santos-garcia/) - [Email](lucasdsantosgarcia@gmail.com)

## 🙏 Agradecimentos

- **Rocketseat** - Curso de desenvolvimento full-stack

---
