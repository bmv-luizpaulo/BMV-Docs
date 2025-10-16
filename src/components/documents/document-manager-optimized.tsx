"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FolderPlus,
  Search,
  FileText,
  Download,
  Trash2,
  Star,
  StarOff,
  Folder,
  Loader2,
  Plus,
  Eye
} from 'lucide-react'
import { DriveDocument, DriveFolder } from '@/lib/google-drive'
import { useDocuments, useFolders, useNavigation, useUpload } from '@/store/app-store'
import { useDocumentSearch } from '@/hooks/use-document-search'
import { 
  DocumentListSkeleton, 
  FolderListSkeleton, 
  ProgressBar 
} from '@/components/ui/loading-skeletons'
import { LoadingButton } from '@/components/ui/loading-skeletons'
import { apiCache } from '@/lib/api-cache'

interface DocumentManagerProps {
  accessToken: string
}

export default function DocumentManager({ accessToken }: DocumentManagerProps) {
  // Estado global
  const { 
    documents, 
    isLoading: isLoadingDocuments, 
    error: documentsError,
    setDocuments, 
    addDocument, 
    removeDocument,
    setLoading: setLoadingDocuments,
    setError: setDocumentsError
  } = useDocuments()

  const { 
    folders, 
    isLoading: isLoadingFolders,
    error: foldersError,
    setFolders, 
    addFolder,
    setLoading: setLoadingFolders,
    setError: setFoldersError
  } = useFolders()

  const { currentFolder, setCurrentFolder } = useNavigation()
  const { uploadProgress, isUploading, setUploadProgress, setUploading } = useUpload()

  // Estado local para UI
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  // Hook de busca otimizada
  const {
    searchResults,
    isSearching,
    searchWithFilters,
    clearSearchResults
  } = useDocumentSearch({
    onSearch: async (query) => {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`/api/documents?q=${encodeURIComponent(query)}`, {
        headers
      })
      const data = await response.json()
      return data.success ? data.documents : []
    }
  })

  // Carregar documentos e pastas
  const loadDocuments = async (folderId: string = currentFolder) => {
    setLoadingDocuments(true)
    setDocumentsError(null)
    
    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }

      // Carregar documentos
      const docsResponse = await fetch(`/api/documents?folderId=${folderId}`, {
        headers
      })
      const docsData = await docsResponse.json()

      if (docsData.success) {
        setDocuments(docsData.documents)
      } else {
        setDocumentsError(docsData.error)
      }

      // Carregar pastas
      setLoadingFolders(true)
      const foldersResponse = await fetch(`/api/folders?parentId=${folderId}`, {
        headers
      })
      const foldersData = await foldersResponse.json()

      if (foldersData.success) {
        setFolders(foldersData.folders)
      } else {
        setFoldersError(foldersData.error)
      }


    } catch (err) {
      console.error('Erro ao carregar documentos:', err)
      setDocumentsError('Erro ao carregar documentos')
    } finally {
      setLoadingDocuments(false)
      setLoadingFolders(false)
    }
  }

  // Buscar documentos
  const searchDocuments = async () => {
    if (!searchQuery.trim()) {
      clearSearchResults()
      loadDocuments()
      return
    }

    try {
      await searchWithFilters(searchQuery, { folderId: currentFolder })
    } catch (err) {
      console.error('Erro ao buscar documentos:', err)
      setDocumentsError('Erro ao buscar documentos')
    }
  }

  // Upload de arquivo
  const handleUploadFile = async () => {
    if (!uploadFile) return

    setUploading(true)
    setUploadProgress(0)
    setDocumentsError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('folderId', currentFolder)

      const headers = {
        'Authorization': `Bearer ${accessToken}`
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers,
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setUploadDialogOpen(false)
        setUploadFile(null)
        addDocument(data.document)
        // Invalidar cache
        apiCache.invalidateDocuments(currentFolder)
        loadDocuments()
      } else {
        setDocumentsError(data.error)
      }

    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setDocumentsError('Erro ao fazer upload')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Criar pasta
  const createFolder = async () => {
    if (!newFolderName.trim()) return

    setLoadingFolders(true)
    setFoldersError(null)

    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolder
        })
      })

      const data = await response.json()

      if (data.success) {
        setFolderDialogOpen(false)
        setNewFolderName('')
        addFolder(data.folder)
        // Invalidar cache
        apiCache.invalidateFolders(currentFolder)
        loadDocuments()
      } else {
        setFoldersError(data.error)
      }

    } catch (err) {
      console.error('Erro ao criar pasta:', err)
      setFoldersError('Erro ao criar pasta')
    } finally {
      setLoadingFolders(false)
    }
  }

  // Excluir documento
  const deleteDocument = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    setLoadingDocuments(true)
    setDocumentsError(null)

    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`/api/documents?fileId=${documentId}`, {
        method: 'DELETE',
        headers
      })

      const data = await response.json()

      if (data.success) {
        removeDocument(documentId)
        // Invalidar cache
        apiCache.invalidateDocuments(currentFolder)
        loadDocuments()
      } else {
        setDocumentsError(data.error)
      }

    } catch (err) {
      console.error('Erro ao excluir documento:', err)
      setDocumentsError('Erro ao excluir documento')
    } finally {
      setLoadingDocuments(false)
    }
  }

  // Navegar para pasta
  const navigateToFolder = (folderId: string) => {
    setCurrentFolder(folderId)
    loadDocuments(folderId)
  }

  // Voltar para pasta pai
  const goBack = () => {
    if (currentFolder !== 'root') {
      setCurrentFolder('root')
      loadDocuments('root')
    }
  }

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'N/A'
    const size = parseInt(bytes)
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadDocuments()
  }, [])

  // Determinar quais documentos mostrar
  const displayDocuments = searchQuery.trim() ? searchResults : documents

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={goBack} disabled={currentFolder === 'root'}>
            <Folder className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-lg font-semibold">
            {currentFolder === 'root' ? 'Documentos Raiz' : 'Pasta Atual'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Arquivo</DialogTitle>
                <DialogDescription>
                  Selecione um arquivo para fazer upload
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
                {isUploading && (
                  <ProgressBar 
                    progress={uploadProgress} 
                    message="Enviando arquivo..." 
                  />
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancelar
                </Button>
                <LoadingButton
                  isLoading={isUploading}
                  loadingText="Enviando..."
                  onClick={handleUploadFile}
                  disabled={!uploadFile}
                >
                  Enviar
                </LoadingButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Pasta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Pasta</DialogTitle>
                <DialogDescription>
                  Digite o nome da nova pasta
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Nome da Pasta</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Digite o nome da pasta"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
                  Cancelar
                </Button>
                <LoadingButton
                  isLoading={isLoadingFolders}
                  loadingText="Criando..."
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                >
                  Criar
                </LoadingButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={searchDocuments} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Erros */}
      {(documentsError || foldersError) && (
        <Alert variant="destructive">
          <AlertDescription>
            {documentsError || foldersError}
          </AlertDescription>
        </Alert>
      )}

      {/* Pastas */}
      {folders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pastas</CardTitle>
            <CardDescription>
              Navegue pelas pastas para organizar seus documentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFolders ? (
              <FolderListSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <Card 
                    key={folder.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigateToFolder(folder.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Folder className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{folder.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(folder.modifiedTime)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            {searchQuery.trim() 
              ? `Resultados da busca por "${searchQuery}"` 
              : 'Seus documentos do Google Drive'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDocuments ? (
            <DocumentListSkeleton />
          ) : displayDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery.trim() 
                  ? 'Nenhum documento encontrado para sua busca'
                  : 'Nenhum documento encontrado nesta pasta'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Modificado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {doc.mimeType?.split('/')[1] || 'Arquivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>{formatDate(doc.modifiedTime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {doc.webViewLink && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.webViewLink} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
