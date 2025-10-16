# 🔑 Configuração das Chaves de API (Credenciais)

## 🎯 Visão Geral

Para que todas as funcionalidades do **BMV Docs** funcionem corretamente, especialmente a integração com o **Google Drive** e a **Inteligência Artificial do Google (Gemini)**, é fundamental configurar corretamente as chaves de API (credenciais) tanto no seu ambiente de desenvolvimento local quanto no ambiente de produção (Vercel).

Este guia irá orientá-lo passo a passo.

---

## 1. Credenciais do Google Drive (OAuth 2.0)

Essas credenciais permitem que a aplicação acesse os arquivos do Google Drive em nome do usuário.

### ✅ Onde Obter as Credenciais:

1.  Acesse o [Google Cloud Console](https://console.developers.google.com/).
2.  Selecione o projeto que você está usando para esta aplicação.
3.  No menu, vá para **APIs e Serviços > Credenciais**.
4.  Encontre sua credencial "Cliente OAuth 2.0" (se não tiver uma, crie uma do tipo "Aplicativo da Web").
5.  Copie o **"ID do cliente"** e a **"Chave secreta do cliente"**.

### ✏️ Onde Configurar:

Adicione as chaves copiadas ao seu arquivo `.env.local` (para desenvolvimento) e às variáveis de ambiente do seu projeto na Vercel (para produção):

```env
# .env.local e Variáveis de Ambiente na Vercel
GOOGLE_CLIENT_ID=aqui-vai-seu-id-do-cliente
GOOGLE_CLIENT_SECRET=aqui-vai-sua-chave-secreta
```

---

## 2. Credencial da API do Google AI (Gemini)

Esta chave permite que a aplicação utilize os modelos de inteligência artificial do Google para analisar documentos.

### ✅ Onde Obter a Credencial:

1.  Acesse o [Google AI Studio](https://aistudio.google.com/).
2.  Faça login com sua conta Google.
3.  Clique no botão **"Get API key"** (Obter chave de API).
4.  Clique em **"Create API key in new project"** (Criar chave de API em um novo projeto).
5.  Copie a chave gerada. Guarde-a em um local seguro.

### ✏️ Onde Configurar:

#### Para Desenvolvimento Local:

Adicione a chave ao seu arquivo `.env.local`:

```env
# .env.local
GEMINI_API_KEY=aqui-vai-sua-chave-da-api-do-gemini
```

#### Para Produção (Vercel) - **PASSO CRUCIAL!**

Este é o passo mais importante para fazer a análise de IA funcionar online.

1.  Acesse seu projeto no [dashboard da Vercel](https://vercel.com/dashboard).
2.  Vá para a aba **"Settings"** (Configurações).
3.  No menu lateral, clique em **"Environment Variables"** (Variáveis de Ambiente).
4.  Adicione uma nova variável:
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: Cole a chave da API do Gemini que você copiou.
5.  Certifique-se de que a variável esteja disponível para o ambiente de **Produção** (Production).
6.  Salve as alterações.
7.  **IMPORTANTE:** Após adicionar a variável, você precisa fazer um novo **deploy** (ou "Redeploy") para que a alteração tenha efeito. Você pode fazer isso a partir da aba "Deployments" do seu projeto na Vercel.

---

## 🚨 Resumo das Variáveis Necessárias na Vercel

Certifique-se de que todas as seguintes variáveis de ambiente estejam configuradas nas "Settings" do seu projeto na Vercel:

-   `GOOGLE_CLIENT_ID`
-   `GOOGLE_CLIENT_SECRET`
-   `NEXT_PUBLIC_FIREBASE_API_KEY`
-   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
-   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
-   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
-   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
-   `NEXT_PUBLIC_FIREBASE_APP_ID`
-   `NEXTAUTH_URL` (com o valor `https://bmvbackoffice.vercel.app`)
-   `NEXTAUTH_SECRET`
-   `GEMINI_API_KEY`

Após configurar todas essas chaves e fazer o redeploy, a aplicação deve funcionar completamente.