"use client"

import { useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  X,
  FileText,
  Calendar,
  Folder,
  Loader2
} from 'lucide-react'
import { useDocumentSearch } from '@/hooks/use-document-search'
import { DriveDocument } from '@/lib/google-drive'
import { DocumentListSkeleton } from '@/components/ui/loading-skeletons'

interface AdvancedSearchProps {
  accessToken: string
  onDocumentSelect?: (document: DriveDocument) => void
}

export default function AdvancedSearch({ accessToken, onDocumentSelect }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    mimeType: '',
    folderId: '',
    dateRange: {
      start: '',
      end: ''
    },
    status: ''
  })

  const {
    searchResults,
    isSearching,
    searchWithFilters,
    clearSearchResults,
    hasResults,
    resultCount
  } = useDocumentSearch({
    onSearch: async (query, searchFilters) => {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }

      const params = new URLSearchParams({
        q: query,
        ...(searchFilters?.mimeType && { mimeType: searchFilters.mimeType }),
        ...(searchFilters?.folderId && { folderId: searchFilters.folderId }),
        ...(searchFilters?.status && { status: searchFilters.status })
      })

      const response = await fetch(`/api/documents?${params}`, {
        headers
      })
      const data = await response.json()
      
      let results = data.success ? data.documents : []
      
      // Aplicar filtro de data localmente se necessário
      if (searchFilters?.dateRange?.start && searchFilters?.dateRange?.end) {
        const startDate = new Date(searchFilters.dateRange.start)
        const endDate = new Date(searchFilters.dateRange.end)
        
        results = results.filter((doc: DriveDocument) => {
          const docDate = new Date(doc.modifiedTime)
          return docDate >= startDate && docDate <= endDate
        })
      }

      return results
    }
  })

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    const searchFilters = {
      mimeType: filters.mimeType || undefined,
      folderId: filters.folderId || undefined,
      dateRange: filters.dateRange.start && filters.dateRange.end ? {
        start: new Date(filters.dateRange.start),
        end: new Date(filters.dateRange.end)
      } : undefined,
      status: filters.status || undefined
    }

    await searchWithFilters(searchQuery, searchFilters)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      mimeType: '',
      folderId: '',
      dateRange: { start: '', end: '' },
      status: ''
    })
    clearSearchResults()
  }

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

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-4 w-4" />
    
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (mimeType.includes('image')) return <FileText className="h-4 w-4 text-green-500" />
    if (mimeType.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />
    if (mimeType.includes('excel')) return <FileText className="h-4 w-4 text-green-600" />
    
    return <FileText className="h-4 w-4" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Busca Avançada
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Busca Avançada de Documentos</DialogTitle>
          <DialogDescription>
            Encontre documentos usando filtros específicos
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Barra de busca */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Termo de busca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Digite o nome do documento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mimeType">Tipo de Arquivo</Label>
                  <Select value={filters.mimeType} onValueChange={(value) => setFilters(prev => ({ ...prev, mimeType: value === 'all' ? '' : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="application/pdf">PDF</SelectItem>
                      <SelectItem value="image/">Imagens</SelectItem>
                      <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word</SelectItem>
                      <SelectItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel</SelectItem>
                      <SelectItem value="text/plain">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateStart">Data Inicial</Label>
                  <Input
                    id="dateStart"
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateEnd">Data Final</Label>
                  <Input
                    id="dateEnd"
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Busca</CardTitle>
              <CardDescription>
                {hasResults 
                  ? `${resultCount} documento(s) encontrado(s)`
                  : 'Digite um termo de busca para encontrar documentos'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <DocumentListSkeleton />
              ) : hasResults ? (
                <div className="space-y-3">
                  {searchResults.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onDocumentSelect?.(doc)}
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.mimeType)}
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span>{formatDate(doc.modifiedTime)}</span>
                            {doc.mimeType && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {doc.mimeType.split('/')[1]}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.webViewLink && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.webViewLink} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Digite um termo de busca para encontrar documentos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
