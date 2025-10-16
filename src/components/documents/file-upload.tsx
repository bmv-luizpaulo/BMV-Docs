"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  X
} from 'lucide-react'
import { useUpload } from '@/store/app-store'
import { apiCache } from '@/lib/api-cache'

interface FileUploadProps {
  accessToken: string
  folderId?: string
  onUploadComplete?: (document: any) => void
  onUploadError?: (error: string) => void
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  result?: any
}

export default function FileUpload({ 
  accessToken, 
  folderId = 'root', 
  onUploadComplete,
  onUploadError 
}: FileUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [description, setDescription] = useState('')
  const { isUploading, setUploading } = useUpload()

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const uploadFile = useCallback(async (uploadFile: UploadFile) => {
    const formData = new FormData()
    formData.append('file', uploadFile.file)
    formData.append('folderId', folderId)
    if (description.trim()) {
      formData.append('description', description.trim())
    }

    try {
      const xhr = new XMLHttpRequest()

      // Configurar progresso
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress, status: 'uploading' }
              : f
          ))
        }
      })

      // Configurar resposta
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText)
          if (result.success) {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress: 100, status: 'completed', result: result.document }
                : f
            ))
            onUploadComplete?.(result.document)
          } else {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'error', error: result.error }
                : f
            ))
            onUploadError?.(result.error)
          }
        } else {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error: 'Erro no servidor' }
              : f
          ))
          onUploadError?.('Erro no servidor')
        }
      })

      // Configurar erro
      xhr.addEventListener('error', () => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: 'Erro de conexão' }
            : f
        ))
        onUploadError?.('Erro de conexão')
      })

      // Iniciar upload
      xhr.open('POST', '/api/documents')
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      xhr.send(formData)

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: 'Erro inesperado' }
          : f
      ))
      onUploadError?.('Erro inesperado')
    }
  }, [accessToken, folderId, description, onUploadComplete, onUploadError])

  const handleUploadAll = useCallback(async () => {
    if (files.length === 0) return

    setUploading(true)
    
    // Invalidar cache antes do upload
    apiCache.invalidateDocuments(folderId)

    // Upload todos os arquivos pendentes
    const pendingFiles = files.filter(f => f.status === 'pending')
    await Promise.all(pendingFiles.map(uploadFile))

    setUploading(false)
  }, [files, uploadFile, folderId, setUploading])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setFiles([])
    setDescription('')
  }, [])

  const getFileIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const completedFiles = files.filter(f => f.status === 'completed').length
  const totalFiles = files.length
  const hasErrors = files.some(f => f.status === 'error')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload de Arquivos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload de Arquivos</DialogTitle>
          <DialogDescription>
            Selecione um ou mais arquivos para fazer upload
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de arquivos */}
          <div>
            <Label htmlFor="files">Arquivos</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição para os arquivos..."
              className="mt-1"
            />
          </div>

          {/* Lista de arquivos */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Arquivos Selecionados</h4>
                <div className="text-sm text-muted-foreground">
                  {completedFiles}/{totalFiles} concluídos
                </div>
              </div>

              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.status)}
                      <div>
                        <p className="font-medium text-sm">{file.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-2" />
                  )}

                  {file.status === 'error' && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-xs">
                        {file.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {file.status === 'completed' && (
                    <Alert className="mt-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Upload concluído com sucesso
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Erros gerais */}
          {hasErrors && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Alguns arquivos falharam no upload. Verifique os erros acima.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
          <Button 
            onClick={handleUploadAll}
            disabled={files.length === 0 || isUploading || files.every(f => f.status !== 'pending')}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Todos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
