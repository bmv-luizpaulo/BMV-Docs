"use client"

import { useGoogleDriveAuth } from '@/hooks/use-google-drive-auth'
import DocumentManager from '@/components/documents/document-manager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Chrome, FileText } from 'lucide-react'

export default function DocumentsPage() {
  const { accessToken, isAuthenticated, isLoading, error, authenticate, signOut } = useGoogleDriveAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Conectando com Google Drive...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <FileText className="h-16 w-16 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Gerenciador de Documentos
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Conecte-se ao Google Drive para gerenciar seus documentos
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Funcionalidades disponíveis:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 📁 Organizar documentos em pastas</li>
                  <li>• 🔍 Buscar documentos por nome</li>
                  <li>• 📤 Upload de novos arquivos</li>
                  <li>• 👁️ Visualizar documentos online</li>
                  <li>• 📥 Download de arquivos</li>
                  <li>• 🗑️ Excluir documentos</li>
                </ul>
              </div>

              <Button
                onClick={authenticate}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Chrome className="mr-2 h-5 w-5" />
                    Conectar com Google Drive
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Ao conectar, você autoriza o acesso aos seus documentos do Google Drive
                  para organização e gerenciamento através desta aplicação.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentos BMV</h1>
            <p className="text-gray-600">Sistema de gestão documental integrado ao Google Drive</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Desconectar
          </Button>
        </div>

        <DocumentManager accessToken={accessToken} />
      </div>
    </div>
  )
}
