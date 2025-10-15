"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BmvLogo } from "@/components/icons"
import { Loader2, Chrome } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  const errorMessages: { [key: string]: string } = {
    Configuration: "Erro de configuração no servidor. Verifique as variáveis de ambiente.",
    AccessDenied: "Acesso negado. Apenas usuários com e-mail @bmv.global podem entrar.",
    Default: "Não foi possível fazer login. Tente novamente mais tarde.",
  }

  const error = errorParam ? (errorMessages[errorParam] || errorMessages.Default) : null

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // O callbackUrl irá redirecionar para a página inicial após o login bem-sucedido
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      console.error("Sign in error", err)
      setIsLoading(false) // Garante que o loading para se o signIn falhar
    }
    // O loading não precisa ser parado aqui se o signIn for bem-sucedido, pois a página será redirecionada.
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <BmvLogo className="h-16 w-16 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Bem-vindo ao BMV Docs
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Sistema de gestão documental para o Programa BMV
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Aguarde...
                </>
              ) : (
                <>
                  <Chrome className="mr-2 h-5 w-5" />
                  Entrar com Google
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Ao fazer login, você concorda com nossos{" "}
                <a href="#" className="text-primary hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
