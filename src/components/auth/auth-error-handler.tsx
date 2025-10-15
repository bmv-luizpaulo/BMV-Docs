"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export default function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const { data: session, status } = useSession();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Verificar se há erros de configuração
    if (status === "unauthenticated" && !hasError) {
      // Verificar se as variáveis de ambiente estão configuradas
      const checkEnvVars = async () => {
        try {
          const response = await fetch("/api/auth/providers");
          if (!response.ok) {
            throw new Error("Erro na configuração de autenticação");
          }
        } catch (error) {
          setHasError(true);
          setErrorMessage(
            "Erro de configuração detectado. Verifique se as variáveis de ambiente estão definidas corretamente."
          );
        }
      };

      checkEnvVars();
    }
  }, [status, hasError]);

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <div className="space-y-4">
                <p className="font-medium">{errorMessage}</p>
                <div className="text-sm space-y-2">
                  <p>Verifique se você configurou:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Arquivo <code>.env.local</code> com as variáveis necessárias</li>
                    <li>GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET</li>
                    <li>NEXTAUTH_SECRET</li>
                    <li>NEXTAUTH_URL</li>
                  </ul>
                </div>
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
