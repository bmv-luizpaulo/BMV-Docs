# 🔧 Correção dos Erros de Autenticação Google Drive

## ❌ **Problemas Identificados**

### 1. **Cross-Origin-Opener-Policy (COOP)**
```
Cross-Origin-Opener-Policy policy would block the window.closed call
```
Este erro ocorria porque o fluxo `signInWithPopup` é sensível a políticas de segurança do navegador que restringem a comunicação entre janelas de origens diferentes.

### 2. **Erros 500 nas APIs**
```
GET https://bmvbackoffice.vercel.app/api/documents?folderId=root 500 (Internal Server Error)
```
Este erro era um sintoma de um problema mais profundo na autenticação. O token de acesso não estava sendo gerenciado corretamente, fazendo com que as chamadas à API do Google Drive falhassem no servidor.

## ✅ **Soluções Implementadas**

### 1. **Mudança de `signInWithPopup` para `signInWithRedirect`**
- ✅ **Fluxo Robusto:** Substituímos o `signInWithPopup` por `signInWithRedirect` no hook `useGoogleDriveAuth`. Este fluxo é mais estável, pois redireciona o usuário para a página de login do Google e depois de volta para a aplicação, evitando problemas com pop-ups.
- ✅ **Tratamento de Resultado:** Adicionamos a lógica com `getRedirectResult` para capturar as credenciais (incluindo o `accessToken`) após o usuário retornar do login do Google.

### 2. **Simplificação do Gerenciamento de Token**
- ✅ **Remoção do `localStorage`:** O gerenciamento manual do `accessToken` via `localStorage` foi removido. Esta abordagem era frágil e propensa a erros de sincronização.
- ✅ **Fonte Única de Verdade:** Agora, o token de acesso OAuth é obtido diretamente do `credential` retornado pelo Firebase após o fluxo de `signInWithRedirect`. Isso garante que estamos sempre usando um token válido fornecido pelo processo de autenticação oficial.

### 3. **Configuração de Headers de Segurança**
- ✅ Adicionado `Cross-Origin-Opener-Policy: same-origin-allow-popups` e `Cross-Origin-Embedder-Policy: unsafe-none` no `next.config.ts` como uma medida de segurança adicional para garantir a compatibilidade entre diferentes contextos de origem, embora a mudança para `signInWithRedirect` seja a correção principal.

## 🚀 **Resultado**

O sistema de autenticação agora é mais simples, mais robusto e está alinhado com as melhores práticas do Firebase. O fluxo de `redirect` elimina os problemas de cross-origin e o gerenciamento de token centralizado pelo Firebase garante que as chamadas à API do Google Drive sejam sempre autenticadas corretamente, resolvendo os erros 500.

## 🔍 **Mudanças Técnicas**

### **`next.config.ts`**
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

### **`src/hooks/use-google-drive-auth.ts`**
- Mudança de `signInWithPopup` para `signInWithRedirect`.
- Adição de `getRedirectResult` para capturar o `accessToken` após o login.
- Remoção da lógica de `localStorage` para o token.
- O estado de autenticação e o token agora são gerenciados de forma mais limpa e direta através do Firebase.
