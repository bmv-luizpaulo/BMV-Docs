"use client"

import ActivityHistory from '@/components/activity/activity-history'
import { useGoogleDriveAuth } from '@/hooks/use-google-drive-auth'
import { Button } from '@/components/ui/button'
import { Loader2, Chrome, AlertTriangle } from 'lucide-react'

export default function HistoryPage() {
  const { accessToken, isAuthenticated, isLoading, error, authenticate } = useGoogleDriveAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Conectando...</p>
      </div>
    )
  }

  if (error || !isAuthenticated || !accessToken) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg p-6">
        <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Autenticação Necessária</h3>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          {error || "Você precisa se autenticar com o Google Drive para ver o histórico de atividades."}
        </p>
        <Button onClick={authenticate} className="mt-6">
          <Chrome className="mr-2 h-4 w-4" />
          Autorizar Google Drive
        </Button>
      </div>
    )
  }

  return (
    <ActivityHistory accessToken={accessToken} />
  )
}
