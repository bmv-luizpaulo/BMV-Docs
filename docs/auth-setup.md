# BMV Docs - Sistema de Gestão Documental

Sistema de gestão documental para o Programa BMV com autenticação Google integrada.

## 🚀 Configuração do Projeto

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente

**Opção 1 - Script Automático (Recomendado):**
```bash
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File setup.ps1

# Linux/Mac
bash setup.sh
```

**Opção 2 - Manual:**
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-aqui

# Google OAuth Configuration
GOOGLE_CLIENT_ID=seu-google-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-google-client-secret-aqui

# Ambiente
NODE_ENV=development
```

**⚠️ IMPORTANTE:** 
- O arquivo `.env.local` já foi criado automaticamente pelo script
- Você precisa substituir `seu-google-client-id-aqui` e `seu-google-client-secret-aqui` pelas credenciais reais do Google OAuth

### 3. Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.developers.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ e Google OAuth2
4. Vá para "Credenciais" e crie uma credencial OAuth 2.0
5. Configure as URLs autorizadas:
   - **URIs de redirecionamento autorizados**: `http://localhost:3000/api/auth/callback/google`
   - **Origens JavaScript autorizadas**: `http://localhost:3000`
6. Copie o Client ID e Client Secret para o arquivo `.env.local`

### 4. Executar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🔐 Funcionalidades de Autenticação

- ✅ Login com Google OAuth2
- ✅ Proteção de rotas
- ✅ Gerenciamento de sessão
- ✅ Interface de login moderna
- ✅ Logout seguro

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/auth/[...nextauth].ts  # Configuração NextAuth
│   ├── login/page.tsx             # Página de login
│   └── page.tsx                   # Dashboard principal
├── components/
│   ├── auth/
│   │   └── auth-guard.tsx         # Proteção de rotas
│   └── ui/                        # Componentes UI
└── lib/
    └── types.ts                   # Tipos TypeScript
```

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **NextAuth.js** - Autenticação
- **Google OAuth2** - Provedor de login
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **TypeScript** - Tipagem estática

## 📝 Próximos Passos

- [ ] Implementar controle de acesso baseado em roles
- [ ] Adicionar mais provedores de autenticação
- [ ] Implementar refresh token automático
- [ ] Adicionar logs de auditoria
- [ ] Configurar notificações por email
