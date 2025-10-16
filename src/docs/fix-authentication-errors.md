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

### 3. **Erro `_tokenResponse' of 'object null'`**
```
TypeError: Cannot destructure property '_tokenResponse' of 'object null'
```
Este erro ocorria no hook `useGoogleDriveAuth` porque a função `getRedirectResult` estava sendo chamada em momentos inadequados (a cada mudança de estado de autenticação), resultando em `null` quando não havia uma operação de redirect pendente, o que quebrava a lógica subsequente.

## ✅ **Soluções Implementadas**

### 1. **Mudança de `signInWithPopup` para `signInWithRedirect`**
- ✅ **Fluxo Robusto:** Substituímos o `signInWithPopup` por `signInWithRedirect` no hook `useGoogleDriveAuth`. Este fluxo é mais estável, pois redireciona o usuário para a página de login do Google e depois de volta para a aplicação, evitando problemas com pop-ups.

### 2. **Gerenciamento de Estado de Autenticação Simplificado**
- ✅ **Fonte Única de Verdade:** O gerenciamento manual do `accessToken` via `localStorage` foi removido. A lógica foi centralizada no hook `useGoogleDriveAuth`.
- ✅ **Processamento Correto do Redirect:** A chamada a `getRedirectResult` agora ocorre apenas uma vez, quando o componente é montado. Isso garante que o token de acesso do Google (OAuth `accessToken`) seja capturado corretamente logo após o login, sem causar erros em recarregamentos de página ou em outras mudanças de estado.
- ✅ **Estado Sincronizado:** O estado do usuário (`user`) vindo do `onAuthStateChanged` do Firebase e o `accessToken` vindo do `getRedirectResult` são gerenciados em conjunto para determinar o estado de `isAuthenticated`.

### 3. **Configuração de Headers de Segurança**
- ✅ Adicionado `Cross-Origin-Opener-Policy: same-origin-allow-popups` e `Cross-Origin-Embedder-Policy: unsafe-none` no `next.config.ts` como uma medida de segurança adicional para garantir a compatibilidade entre diferentes contextos de origem.

## 🚀 **Resultado**

O sistema de autenticação agora é mais simples, mais robusto e está alinhado com as melhores práticas do Firebase para fluxos de autenticação com provedores OAuth. O fluxo de `redirect` elimina os problemas de cross-origin e o gerenciamento de estado corrigido garante que as chamadas à API do Google Drive sejam sempre autenticadas corretamente, resolvendo os erros 500 e os erros de `TypeError` no frontend.

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
- Adição de um `useEffect` que executa apenas uma vez para chamar `getRedirectResult` e capturar o `accessToken`.
- Remoção da lógica de `localStorage` para o token.
- O estado de autenticação (`isAuthenticated`) agora depende tanto da existência de um `user` no Firebase quanto de um `accessToken` válido do Google.
