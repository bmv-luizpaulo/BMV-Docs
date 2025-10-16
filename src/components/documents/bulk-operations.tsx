"use client"

import { useState, useEffect, useCallback } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
import {
  Download,
  FileText,
  Calendar,
  BarChart3,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Star,
  StarOff
} from 'lucide-react'
import { DriveDocument } from '@/lib/google-drive'
import { useDocuments } from '@/store/app-store'
import { useNotifications } from '@/hooks/use-notifications'
import { DocumentListSkeleton } from '@/components/ui/loading-skeletons'

interface BulkOperationsProps {
  accessToken: string
  documents: DriveDocument[]
  onRefresh: () => void
}

export default function BulkOperations({ accessToken, documents, onRefresh }: BulkOperationsProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  
  const { removeDocument } = useDocuments()
  const { 
    showSuccess, 
    showError,
    notifyDocumentDeleted,
    notifyValidationError
  } = useNotifications()

  // Filtrar e ordenar documentos
  const filteredAndSortedDocuments = documents
    .filter(doc => {
      if (filterStatus && doc.status !== filterStatus) return false
      if (filterType && !doc.mimeType?.includes(filterType)) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = (parseInt(a.size || '0') - parseInt(b.size || '0'))
          break
        case 'modified':
          comparison = new Date(a.modifiedTime).getTime() - new Date(b.modifiedTime).getTime()
          break
        case 'type':
          comparison = (a.mimeType || '').localeCompare(b.mimeType || '')
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleSelectAll = useCallback(() => {
    if (selectedDocuments.size === filteredAndSortedDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredAndSortedDocuments.map(doc => doc.id)))
    }
  }, [selectedDocuments.size, filteredAndSortedDocuments])

  const handleSelectDocument = useCallback((docId: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(docId)) {
      newSelected.delete(docId)
    } else {
      newSelected.add(docId)
    }
    setSelectedDocuments(newSelected)
  }, [selectedDocuments])

  const handleBulkDelete = useCallback(async () => {
    if (selectedDocuments.size === 0) {
      notifyValidationError('Selecione pelo menos um documento para excluir')
      return
    }

    if (!confirm(`Tem certeza que deseja excluir ${selectedDocuments.size} documento(s)?`)) {
      return
    }

    setIsProcessing(true)
    
    try {
      const deletePromises = Array.from(selectedDocuments).map(async (docId) => {
        const doc = documents.find(d => d.id === docId)
        if (!doc) return

        const response = await fetch(`/api/documents?fileId=${docId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          removeDocument(docId)
          notifyDocumentDeleted(doc.name)
        } else {
          throw new Error(`Erro ao excluir ${doc.name}`)
        }
      })

      await Promise.all(deletePromises)
      setSelectedDocuments(new Set())
      showSuccess('Exclusão Concluída', `${selectedDocuments.size} documento(s) excluído(s) com sucesso`)
      onRefresh()

    } catch (error) {
      showError('Erro na Exclusão', 'Alguns documentos não puderam ser excluídos')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedDocuments, documents, accessToken, removeDocument, notifyDocumentDeleted, showSuccess, showError, onRefresh, notifyValidationError])

  const handleExport = useCallback(() => {
    const selectedDocs = documents.filter(doc => selectedDocuments.has(doc.id))
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalDocuments: selectedDocs.length,
      documents: selectedDocs.map(doc => ({
        name: doc.name,
        type: doc.mimeType,
        size: doc.size,
        modified: doc.modifiedTime,
        status: doc.status || 'N/A',
        link: doc.webViewLink
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `documentos-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showSuccess('Exportação Concluída', `${selectedDocs.length} documento(s) exportado(s)`)
    setIsExportDialogOpen(false)
  }, [selectedDocuments, documents, showSuccess])

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'N/A'
    const size = parseInt(bytes)
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getFileTypeIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-4 w-4" />
    
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (mimeType.includes('image')) return <FileText className="h-4 w-4 text-green-500" />
    if (mimeType.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />
    if (mimeType.includes('excel')) return <FileText className="h-4 w-4 text-green-600" />
    
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Operações em Lote</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {selectedDocuments.size} selecionado(s)
              </Badge>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filterStatus">Filtrar por Status</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Completo">Completo</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Incompleto">Incompleto</SelectItem>
                  <SelectItem value="Divergência">Divergência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterType">Filtrar por Tipo</Label>
              <Select value={filterType} onValueChange={(value) => setFilterType(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Imagens</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortBy">Ordenar por</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="size">Tamanho</SelectItem>
                  <SelectItem value="modified">Data de Modificação</SelectItem>
                  <SelectItem value="type">Tipo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortOrder">Ordem</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Crescente</SelectItem>
                  <SelectItem value="desc">Decrescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ações em lote */}
          {selectedDocuments.size > 0 && (
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Selecionados ({selectedDocuments.size})
              </Button>

              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Selecionados ({selectedDocuments.size})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Exportar Documentos</DialogTitle>
                    <DialogDescription>
                      Exportar {selectedDocuments.size} documento(s) selecionado(s) para JSON
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos ({filteredAndSortedDocuments.length})</CardTitle>
          <CardDescription>
            Selecione documentos para realizar operações em lote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.size === filteredAndSortedDocuments.length && filteredAndSortedDocuments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Modificado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(doc.id)}
                      onChange={() => handleSelectDocument(doc.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getFileTypeIcon(doc.mimeType)}
                      <span>{doc.name}</span>
                    </div>
                  </TableCell>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAndSortedDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum documento encontrado com os filtros aplicados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
