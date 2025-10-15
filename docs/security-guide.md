# 🔐 Guia de Segurança - BMV Docs

## ⚠️ **IMPORTANTE: Proteção de Credenciais**

### 🚨 **NUNCA FAÇA:**
- ❌ Commite arquivos `.env.local` ou `.env` para o repositório
- ❌ Compartilhe credenciais em mensagens, emails ou chats
- ❌ Deixe credenciais hardcoded no código fonte
- ❌ Use credenciais de produção em ambiente de desenvolvimento

### ✅ **SEMPRE FAÇA:**
- ✅ Use variáveis de ambiente para todas as credenciais sensíveis
- ✅ Mantenha o arquivo `.env.local` apenas localmente
- ✅ Use diferentes credenciais para desenvolvimento e produção
- ✅ Revogue credenciais comprometidas imediatamente

## 🔑 **Credenciais Sensíveis no Projeto:**

### **NextAuth.js:**
- `NEXTAUTH_SECRET` - Chave secreta para assinar tokens JWT
- `GOOGLE_CLIENT_ID` - ID do cliente Google OAuth
- `GOOGLE_CLIENT_SECRET` - Segredo do cliente Google OAuth

### **Firebase:**
- `FIREBASE_API_KEY` - Chave da API do Firebase
- `FIREBASE_AUTH_DOMAIN` - Domínio de autenticação
- `FIREBASE_PROJECT_ID` - ID do projeto Firebase
- `FIREBASE_STORAGE_BUCKET` - Bucket de armazenamento
- `FIREBASE_MESSAGING_SENDER_ID` - ID do remetente de mensagens
- `FIREBASE_APP_ID` - ID do aplicativo Firebase

## 🛡️ **Medidas de Segurança Implementadas:**

1. **Validação de Variáveis de Ambiente:**
   - Verificação automática se todas as variáveis necessárias estão definidas
   - Erro claro se alguma variável estiver faltando

2. **Arquivo .gitignore:**
   - Configurado para ignorar todos os arquivos `.env*`
   - Previne commit acidental de credenciais

3. **Documentação Segura:**
   - Templates com valores placeholder
   - Instruções claras sobre onde obter credenciais
   - Nenhuma credencial real na documentação

## 🔄 **Em Caso de Comprometimento:**

1. **Revogue imediatamente:**
   - Credenciais do Google OAuth no Google Cloud Console
   - Chaves do Firebase no Firebase Console

2. **Gere novas credenciais:**
   - Novas chaves OAuth
   - Nova chave secreta NextAuth
   - Novas configurações Firebase

3. **Atualize o ambiente:**
   - Substitua todas as credenciais no `.env.local`
   - Reinicie o servidor de desenvolvimento

## 📋 **Checklist de Segurança:**

- [ ] Todas as credenciais estão em variáveis de ambiente
- [ ] Arquivo `.env.local` não está no controle de versão
- [ ] Credenciais de desenvolvimento são diferentes das de produção
- [ ] Documentação não contém credenciais reais
- [ ] Equipe foi treinada sobre práticas de segurança

## 🚀 **Para Produção:**

1. Configure variáveis de ambiente no servidor de produção
2. Use serviços como Vercel, Netlify ou AWS para gerenciar secrets
3. Implemente rotação regular de credenciais
4. Monitore logs para detectar uso suspeito

---

**Lembre-se: Segurança é responsabilidade de todos! 🔐**
