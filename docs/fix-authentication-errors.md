# 🔧 Correção dos Erros de Autenticação Google Drive

## ❌ **Problemas Identificados**

### 1. **Cross-Origin-Opener-Policy (COOP)**
```
Cross-Origin-Opener-Policy policy would block the window.closed call
```

### 2. **Erros 500 nas APIs**
```
GET https://bmvbackoffice.vercel.app/api/documents?folderId=root 500 (Internal Server Error)
GET https://bmvbackoffice.vercel.app/api/folders?parentId=root 500 (Internal Server Error)
```

## ✅ **Soluções Implementadas**

### 1. **Configuração de Headers de Segurança**
- ✅ Adicionado `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- ✅ Adicionado `Cross-Origin-Embedder-Policy: unsafe-none`
- ✅ Configurado no `next.config.ts`

### 2. **Mudança de Popup para Redirect**
- ✅ Substituído `signInWithPopup` por `signInWithRedirect`
- ✅ Adicionado tratamento de `getRedirectResult`
- ✅ Evita problemas de COOP com popups

### 3. **Melhorias na Autenticação**
- ✅ Verificação automática de resultado de redirect
- ✅ Tratamento de erros melhorado
- ✅ Persistência de token no localStorage

## 🚀 **Próximos Passos**

### 1. **Redeploy no Vercel**
```bash
# Fazer commit das alterações
git add .
git commit -m "Fix: Corrigir erros de COOP e autenticação Google Drive"
git push
```

### 2. **Testar a Autenticação**
1. Acesse: `https://bmvbackoffice.vercel.app/login`
2. Clique em "Entrar com Google"
3. Complete o fluxo de autenticação
4. Verifique se não há mais erros no console

### 3. **Verificar APIs**
1. Após autenticação, teste o carregamento de documentos
2. Verifique se as APIs `/api/documents` e `/api/folders` funcionam
3. Confirme que não há mais erros 500

## 🔍 **Mudanças Técnicas**

### **next.config.ts**
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin-allow-popups',
        },
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'unsafe-none',
        },
      ],
    },
  ]
}
```

### **use-google-drive-auth.ts**
- Mudança de `signInWithPopup` para `signInWithRedirect`
- Adição de `getRedirectResult` para capturar resultado
- Melhor tratamento de erros

## ⚠️ **Importante**

- As mudanças de headers requerem redeploy completo
- O fluxo de autenticação agora usa redirect em vez de popup
- Certifique-se de que o domínio está autorizado no Firebase Console
- Teste em ambiente de produção após o deploy

## 🧪 **Teste Após Deploy**

1. **Limpe o cache do navegador**
2. **Acesse a aplicação**
3. **Teste o login com Google**
4. **Verifique o console para erros**
5. **Teste o carregamento de documentos**

Se ainda houver problemas, verifique:
- Configuração de domínios no Firebase Console
- URLs autorizadas no Google Cloud Console
- Variáveis de ambiente no Vercel
