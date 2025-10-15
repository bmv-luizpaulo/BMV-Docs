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
import { Loader2, Chrome, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Verificar se há erro na URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    
    const errorMessages: { [key: string]: string } = {
      Configuration: "Erro de configuração no servidor. Verifique as variáveis de ambiente.",
      AccessDenied: "Acesso negado. Apenas usuários com e-mail @bmv.global podem entrar.",
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome é obrigatório")
      return false
    }
    
    if (!formData.email.trim()) {
      setError("Email é obrigatório")
      return false
    }
    
    if (!formData.email.includes("@")) {
      setError("Email inválido")
      return false
    }
    
    if (formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não coincidem")
      return false
    }
    
    return true
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simular cadastro (em produção, isso seria uma chamada para sua API)
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })
      
      if (response.ok) {
        setSuccess("Conta criada com sucesso! Redirecionando para login...")
        setTimeout(() => {
          // Fazer login automaticamente após cadastro
          signIn("credentials", {
            email: formData.email,
            password: formData.password,
            callbackUrl: "/",
          })
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Erro ao criar conta")
      }
    } catch (err) {
      console.error("Sign up error", err)
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      console.error("Google sign up error", err)
      setError("Erro ao fazer cadastro com Google")
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
                  Criar Conta - BMV Docs
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
                Criar Conta
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

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Formulário de Cadastro */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 6 caracteres"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Criar Conta com Email
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
              onClick={handleGoogleSignUp}
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
                  Criar Conta com Google
                </>
              )}
            </Button>

            {/* Link para Login */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Fazer Login
                </Link>
              </p>
            </div>

            {/* Termos */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Ao criar uma conta, você concorda com nossos{" "}
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
