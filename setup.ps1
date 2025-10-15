# Script de configuração do BMV Docs para Windows
Write-Host "🚀 Configurando BMV Docs..." -ForegroundColor Green

# Verificar se o arquivo .env.local já existe
if (Test-Path ".env.local") {
    Write-Host "⚠️  Arquivo .env.local já existe!" -ForegroundColor Yellow
    $response = Read-Host "Deseja sobrescrever? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Configuração cancelada." -ForegroundColor Red
        exit 1
    }
}

# Copiar template para .env.local
Copy-Item "env-template.txt" ".env.local"

Write-Host "✅ Arquivo .env.local criado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Configure suas credenciais do Google OAuth:"
Write-Host "   - Acesse: https://console.developers.google.com/"
Write-Host "   - Crie um projeto ou selecione um existente"
Write-Host "   - Ative a API do Google+ e Google OAuth2"
Write-Host "   - Vá para 'Credenciais' e crie uma credencial OAuth 2.0"
Write-Host "   - Configure as URLs autorizadas:"
Write-Host "     * URIs de redirecionamento: http://localhost:3000/api/auth/callback/google"
Write-Host "     * Origens JavaScript: http://localhost:3000"
Write-Host ""
Write-Host "2. Edite o arquivo .env.local e substitua:"
Write-Host "   - GOOGLE_CLIENT_ID=seu-client-id-real"
Write-Host "   - GOOGLE_CLIENT_SECRET=seu-client-secret-real"
Write-Host ""
Write-Host "3. Execute: npm run dev"
Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
