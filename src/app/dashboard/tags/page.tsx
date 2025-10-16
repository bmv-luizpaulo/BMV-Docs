"use client"

import TagManager from '@/components/tags/tag-manager'
import { useDocuments, useFolders } from '@/store/app-store'
import { useGoogleDriveAuth } from '@/hooks/use-google-drive-auth'
import { Button } from '@/components/ui/button'
import { Loader2, Chrome, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function TagsPage() {
  const { documents, setDocuments } = useDocuments();
  const { folders, setFolders } = useFolders();
  const { accessToken, isAuthenticated, isLoading, error, authenticate } = useGoogleDriveAuth();

  useEffect(() => {
    // Apenas para simular o carregamento inicial,
    // em uma app real os dados seriam buscados via API
    // e colocados no Zustand store.
    if (isAuthenticated && documents.length === 0) {
      // Aqui você poderia buscar os documentos se eles não estiverem no store
    }
  }, [isAuthenticated, documents.length, setDocuments, setFolders]);

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
          {error || "Você precisa se autenticar com o Google Drive para gerenciar as tags."}
        </p>
        <Button onClick={authenticate} className="mt-6">
          <Chrome className="mr-2 h-4 w-4" />
          Autorizar Google Drive
        </Button>
      </div>
    )
  }

  return (
    <TagManager accessToken={accessToken} documents={documents} folders={folders} />
  )
}
