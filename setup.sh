#!/bin/bash

# Script de configuração do BMV Docs
echo "🚀 Configurando BMV Docs..."

# Verificar se o arquivo .env.local já existe
if [ -f ".env.local" ]; then
    echo "⚠️  Arquivo .env.local já existe!"
    read -p "Deseja sobrescrever? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuração cancelada."
        exit 1
    fi
fi

# Copiar template para .env.local
cp env-template.txt .env.local

echo "✅ Arquivo .env.local criado!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure suas credenciais do Google OAuth:"
echo "   - Acesse: https://console.developers.google.com/"
echo "   - Crie um projeto ou selecione um existente"
echo "   - Ative a API do Google+ e Google OAuth2"
echo "   - Vá para 'Credenciais' e crie uma credencial OAuth 2.0"
echo "   - Configure as URLs autorizadas:"
echo "     * URIs de redirecionamento: http://localhost:9002/api/auth/callback/google"
echo "     * Origens JavaScript: http://localhost:9002"
echo ""
echo "2. Edite o arquivo .env.local e substitua:"
echo "   - GOOGLE_CLIENT_ID=seu-client-id-real"
echo "   - GOOGLE_CLIENT_SECRET=seu-client-secret-real"
echo ""
echo "3. Execute: npm run dev"
echo ""
echo "🎉 Configuração concluída!"
