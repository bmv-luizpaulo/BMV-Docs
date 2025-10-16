
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, TestTube, Loader2, CheckCircle, XCircle, Chrome, AlertTriangle } from "lucide-react";
import { useGoogleDriveAuth } from "@/hooks/use-google-drive-auth";

export default function SettingsPage() {
  const { accessToken, isAuthenticated, isLoading: isAuthLoading, error: authError, authenticate } = useGoogleDriveAuth();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestApi = async () => {
    if (!accessToken) {
      setTestError("Token de acesso não encontrado. Por favor, autentique-se novamente.");
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const response = await fetch('/api/folders?parentId=root', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult(`Conexão bem-sucedida! ${data.folders.length} pastas encontradas na raiz.`);
      } else {
        throw new Error(data.details || data.error || 'Falha ao testar a API do Google Drive.');
      }
    } catch (err: any) {
      setTestError(err.message || "Ocorreu um erro desconhecido durante o teste.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Configurações
              </CardTitle>
              <CardDescription>
                  Gerencie as configurações da sua conta e da aplicação.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Página de Configurações em construção.</p>
              </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            Diagnóstico da API
          </CardTitle>
          <CardDescription>
            Use esta seção para verificar a conexão com as APIs externas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Autenticação Necessária</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Você precisa se autenticar com o Google para poder testar a conexão com a API.
              </p>
              <Button onClick={authenticate} className="mt-6">
                <Chrome className="mr-2 h-4 w-4" />
                Autorizar Google Drive
              </Button>
            </div>
          ) : (
            <>
              <Button onClick={handleTestApi} disabled={isTesting}>
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : "Testar Conexão com Google Drive"}
              </Button>

              {testResult && (
                <Alert variant="default" className="border-green-300 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4 !text-green-600" />
                  <AlertTitle>Sucesso!</AlertTitle>
                  <AlertDescription>
                    {testResult}
                  </AlertDescription>
                </Alert>
              )}

              {testError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Falha na Conexão</AlertTitle>
                  <AlertDescription>
                    {testError}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
