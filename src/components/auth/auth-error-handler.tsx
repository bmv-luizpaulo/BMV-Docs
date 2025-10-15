"use client";

import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorHandler({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (!error) {
    return <>{children}</>
  }

  const errorMessages: { [key: string]: string } = {
    Configuration: "Houve um erro de configuração de autenticação no servidor. Verifique as variáveis de ambiente (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL).",
    AccessDenied: "O acesso foi negado. Você precisa autorizar o aplicativo para continuar.",
    Default: "Ocorreu um erro desconhecido durante a autenticação."
  }

  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro de Autenticação</AlertTitle>
        <AlertDescription>
          {message}
          <p className="mt-4">
            Por favor, verifique a configuração e tente novamente. Se o problema persistir, entre em contato com o suporte.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
