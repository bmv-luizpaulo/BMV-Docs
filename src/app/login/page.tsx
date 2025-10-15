"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BmvLogo } from "@/components/icons"
import { Loader2, Chrome, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Verificar se há erro na URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    
    const errorMessages: { [key: string]: string } = {
      Configuration: "Erro de configuração no servidor. Verifique as variáveis de ambiente.",
      AccessDenied: "Acesso negado. Apenas usuários com e-mail @bmv.global podem entrar.",
      CredentialsSignin: "Email ou senha incorretos.",
      Default: "Não foi possível fazer login. Tente novamente mais tarde.",
    }
    
    if (errorParam) {
      setError(errorMessages[errorParam] || errorMessages.Default)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erros quando o usuário começar a digitar
    if (error) setError(null)
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError("Email e senha são obrigatórios")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      
      if (result?.error) {
        setError("Email ou senha incorretos")
      } else if (result?.ok) {
        // Redirecionar para a página inicial
        window.location.href = "/"
      }
    } catch (err) {
      console.error("Sign in error", err)
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      console.error("Sign in error", err)
      setIsLoading(false)
    }
  }

  // Evita hidratação mismatch
  if (!mounted) {
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
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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

            {/* Formulário de Login */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Entrar com Email
                  </>
                )}
              </Button>
            </form>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            {/* Botão Google */}
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

            {/* Link para Cadastro */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Não tem uma conta?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Criar Conta
                </Link>
              </p>
            </div>

            {/* Termos */}
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
