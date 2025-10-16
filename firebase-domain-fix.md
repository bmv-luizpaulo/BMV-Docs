# 🔧 Correção do Erro de Domínio Firebase

## ❌ **Problema Identificado**
```
FirebaseError: Firebase: Error (auth/unauthorized-domain)
```

O domínio `bmvbackoffice.vercel.app` não está autorizado no Firebase Console.

## ✅ **Solução Passo a Passo**

### 1. **Firebase Console - Domínios Autorizados**
1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto: `studio-5757745802-11667`
3. Vá para **Authentication** > **Settings** > **Authorized domains**
4. Clique em **"Add domain"**
5. Adicione: `bmvbackoffice.vercel.app`
6. Clique em **"Done"**

### 2. **Google Cloud Console - OAuth**
1. Acesse: https://console.developers.google.com/
2. Selecione seu projeto
3. Vá para **APIs & Services** > **Credentials**
4. Clique na credencial OAuth 2.0: `372583818239-66atekdsn40iv2e6a0tdpt6pi0gq8ius.apps.googleusercontent.com`
5. Em **"Authorized JavaScript origins"**, adicione:
   - `https://bmvbackoffice.vercel.app`
6. Em **"Authorized redirect URIs"**, adicione:
   - `https://bmvbackoffice.vercel.app/api/auth/callback/google`
7. Clique em **"Save"**

### 3. **Atualizar Variáveis de Ambiente**

Edite o arquivo `.env.local` e altere:

```env
# ANTES
NEXTAUTH_URL=http://localhost:9002

# DEPOIS
NEXTAUTH_URL=https://bmvbackoffice.vercel.app
```

### 4. **Verificar Configuração**

Após fazer as alterações:

1. **Redeploy no Vercel** (se necessário)
2. **Teste a autenticação** no domínio de produção
3. **Verifique o console** para confirmar que o erro foi resolvido

## 🔍 **Domínios Atualmente Configurados**

### Firebase Auth Domain:
- `studio-5757745802-11667.firebaseapp.com` ✅
- `bmvbackoffice.vercel.app` ❌ (precisa ser adicionado)

### Google OAuth Origins:
- `http://localhost:9002` ✅ (desenvolvimento)
- `https://bmvbackoffice.vercel.app` ❌ (precisa ser adicionado)

### Google OAuth Redirect URIs:
- `http://localhost:9002/api/auth/callback/google` ✅ (desenvolvimento)
- `https://bmvbackoffice.vercel.app/api/auth/callback/google` ❌ (precisa ser adicionado)

## ⚠️ **Importante**

- As alterações no Firebase Console podem levar alguns minutos para serem aplicadas
- Certifique-se de fazer as alterações em ambos os consoles (Firebase e Google Cloud)
- Mantenha as configurações de desenvolvimento para testes locais

## 🧪 **Teste Após Correção**

1. Acesse: `https://bmvbackoffice.vercel.app/login`
2. Clique em "Entrar com Google"
3. Verifique se não há mais erros no console
4. Confirme que a autenticação funciona corretamente
