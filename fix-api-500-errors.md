# 🔧 Correção dos Erros 500 nas APIs

## ❌ **Problema Identificado**
```
GET https://bmvbackoffice.vercel.app/api/documents?folderId=root 500 (Internal Server Error)
GET https://bmvbackoffice.vercel.app/api/folders?parentId=root 500 (Internal Server Error)
```

## 🔍 **Causa Raiz**
O problema estava na configuração do OAuth2Client. O cliente estava sendo reutilizado entre requisições, causando conflitos de autenticação.

## ✅ **Soluções Implementadas**

### 1. **Nova Função para Criar Cliente OAuth2**
```typescript
// src/lib/google-drive.ts
export function createOAuth2ClientWithToken(accessToken: string) {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  )
  
  client.setCredentials({
    access_token: accessToken,
    token_type: 'Bearer'
  })
  
  return client
}
```

### 2. **APIs Atualizadas**
- ✅ Cada requisição cria uma nova instância do OAuth2Client
- ✅ Logs detalhados para debug
- ✅ Melhor tratamento de erros
- ✅ Instância separada do Drive API para cada requisição

### 3. **Logs de Debug Adicionados**
- 🔑 Token recebido (primeiros 20 caracteres)
- ✅ Confirmação de configuração de credenciais
- 🔍 Parâmetros da query
- 📄/📁 Status da listagem
- ❌ Detalhes de erros

## 🚀 **Próximos Passos**

### 1. **Fazer Deploy das Alterações**
```bash
git add .
git commit -m "Fix: Corrigir erro 500 nas APIs com nova configuração OAuth2Client"
git push
```

### 2. **Testar as APIs**
1. **Acesse a aplicação**: `https://bmvbackoffice.vercel.app`
2. **Faça login com Google**
3. **Verifique o console do navegador** para logs de debug
4. **Teste o carregamento de documentos**

### 3. **Verificar Logs do Servidor**
No Vercel Dashboard, verifique os logs para:
- ✅ Tokens sendo recebidos corretamente
- ✅ Credenciais sendo configuradas
- ✅ Queries sendo executadas
- ✅ Documentos/pastas sendo retornados

## 🔍 **O que Mudou**

### **Antes (Problemático)**
```typescript
// Cliente global sendo reutilizado
oauth2Client.setCredentials({ access_token: token })
const response = await drive.files.list({...})
```

### **Depois (Corrigido)**
```typescript
// Nova instância para cada requisição
const client = createOAuth2ClientWithToken(token)
const driveWithAuth = google.drive({ version: 'v3', auth: client })
const response = await driveWithAuth.files.list({...})
```

## 🧪 **Teste Após Deploy**

1. **Limpe o cache do navegador**
2. **Acesse a aplicação**
3. **Faça login com Google**
4. **Verifique se os documentos carregam**
5. **Confirme que não há mais erros 500**

## 📊 **Logs Esperados**

### **Sucesso**
```
📄 Iniciando listagem de documentos
🔑 Token recebido: ya29.a0AfH6SMC...
✅ Credenciais configuradas com sucesso
🔍 Parâmetros: { folderId: 'root', mimeType: null, q: null }
🔍 Query final: trashed = false and 'root' in parents
✅ Documentos encontrados: 5
```

### **Erro**
```
❌ Token de acesso não fornecido
```
ou
```
❌ Erro ao configurar credenciais: [detalhes do erro]
```

## ⚠️ **Importante**

- As alterações requerem redeploy completo
- Certifique-se de que o domínio está autorizado no Firebase Console
- Verifique se as variáveis de ambiente estão corretas no Vercel
- Os logs ajudarão a identificar qualquer problema restante
