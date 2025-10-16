"use client"

import DocumentManagerOptimized from '@/components/documents/document-manager-optimized'
import { useGoogleDriveAuth } from '@/hooks/use-google-drive-auth'
import { Button } from '@/components/ui/button'
import { Loader2, Chrome, AlertTriangle } from 'lucide-react'

export default function DocumentsPage() {
  const { accessToken, isAuthenticated, isLoading, error, authenticate } = useGoogleDriveAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Conectando ao Google Drive...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg p-6">
        <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive">Erro de Autenticação</h3>
        <p className="text-muted-foreground mt-2 text-center">{error}</p>
        <Button onClick={authenticate} className="mt-6">
          <Chrome className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold">Acesso ao Google Drive Necessário</h3>
        <p className="text-muted-foreground mt-2 text-center">
          Para ver e gerenciar seus documentos, você precisa autorizar o acesso ao Google Drive.
        </p>
        <Button onClick={authenticate} className="mt-6">
          <Chrome className="mr-2 h-4 w-4" />
          Autorizar Google Drive
        </Button>
      </div>
    )
  }

  return (
    <DocumentManagerOptimized accessToken={accessToken} />
  )
}
