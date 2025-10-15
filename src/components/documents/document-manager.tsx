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

interface DocumentManagerProps {
  accessToken: string
}

export default function DocumentManager({ accessToken }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DriveDocument[]>([])
  const [folders, setFolders] = useState<DriveFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFolder, setCurrentFolder] = useState<string>('root')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  // Carregar documentos e pastas
  const loadDocuments = async (folderId: string = currentFolder) => {
    setLoading(true)
    setError(null)
    
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
        setError(docsData.error)
      }

      // Carregar pastas
      const foldersResponse = await fetch(`/api/folders?parentId=${folderId}`, {
        headers
      })
      const foldersData = await foldersResponse.json()

      if (foldersData.success) {
        setFolders(foldersData.folders)
      }

    } catch (err) {
      console.error('Erro ao carregar documentos:', err)
      setError('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }

  // Buscar documentos
  const searchDocuments = async () => {
    if (!searchQuery.trim()) {
      loadDocuments()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`/api/documents?q=${encodeURIComponent(searchQuery)}`, {
        headers
      })
      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents)
      } else {
        setError(data.error)
      }

    } catch (err) {
      console.error('Erro ao buscar documentos:', err)
      setError('Erro ao buscar documentos')
    } finally {
      setLoading(false)
    }
  }

  // Upload de arquivo
  const uploadFile = async () => {
    if (!uploadFile) return

    setLoading(true)
    setError(null)

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
        loadDocuments()
      } else {
        setError(data.error)
      }

    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setError('Erro ao fazer upload')
    } finally {
      setLoading(false)
    }
  }

  // Criar pasta
  const createFolder = async () => {
    if (!newFolderName.trim()) return

    setLoading(true)
    setError(null)

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
        loadDocuments()
      } else {
        setError(data.error)
      }

    } catch (err) {
      console.error('Erro ao criar pasta:', err)
      setError('Erro ao criar pasta')
    } finally {
      setLoading(false)
    }
  }

  // Excluir documento
  const deleteDocument = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    setLoading(true)
    setError(null)

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
        loadDocuments()
      } else {
        setError(data.error)
      }

    } catch (err) {
      console.error('Erro ao excluir documento:', err)
      setError('Erro ao excluir documento')
    } finally {
      setLoading(false)
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

  // Obter ícone do arquivo
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊'
    if (mimeType.includes('image')) return '🖼️'
    return '📄'
  }

  useEffect(() => {
    loadDocuments()
  }, [currentFolder])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciador de Documentos</h2>
          <p className="text-gray-600">Organize e gerencie seus documentos do Google Drive</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
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
              </div>
              <DialogFooter>
                <Button onClick={uploadFile} disabled={!uploadFile || loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
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
                <Button onClick={createFolder} disabled={!newFolderName.trim() || loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome do documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchDocuments()}
            />
            <Button onClick={searchDocuments} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pastas */}
      {folders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pastas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setCurrentFolder(folder.id)}
                >
                  <Folder className="mr-3 h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{folder.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(folder.createdTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            {documents.length} documento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
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
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span className="mr-2">{getFileIcon(doc.mimeType)}</span>
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>{formatDate(doc.modifiedTime)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {doc.webViewLink && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={doc.webViewLink} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {doc.webContentLink && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={doc.webContentLink} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
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

          {documents.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Nenhum documento encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
