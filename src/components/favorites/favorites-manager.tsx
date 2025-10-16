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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  StarOff,
  Heart,
  Clock,
  FileText,
  Folder,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Loader2
} from 'lucide-react'
import { DriveDocument, DriveFolder } from '@/lib/google-drive'
import { useNotifications } from '@/hooks/use-notifications'

interface FavoriteItem {
  id: string
  name: string
  type: 'document' | 'folder'
  mimeType?: string
  size?: string
  modifiedTime: string
  webViewLink?: string
  addedAt: string
  tags: string[]
  accessCount: number
  lastAccessed?: string
}

interface FavoritesManagerProps {
  accessToken: string
  documents: DriveDocument[]
  folders: DriveFolder[]
}

export default function FavoritesManager({ accessToken, documents, folders }: FavoritesManagerProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'addedAt' | 'accessCount' | 'lastAccessed'>('addedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<'all' | 'document' | 'folder'>('all')
  const [isLoading, setIsLoading] = useState(true);
  
  const { showSuccess, showError } = useNotifications()

  // Carregar favoritos do localStorage
  useEffect(() => {
    try {
        const savedFavorites = localStorage.getItem('bmv-favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    } catch (error) {
        console.error("Failed to load favorites from localStorage", error);
    } finally {
        setIsLoading(false);
    }
  }, [])

  // Salvar favoritos no localStorage
  const saveFavorites = useCallback((newFavorites: FavoriteItem[]) => {
    setFavorites(newFavorites)
    localStorage.setItem('bmv-favorites', JSON.stringify(newFavorites))
  }, [])

  // Adicionar aos favoritos
  const addToFavorites = useCallback((item: DriveDocument | DriveFolder, type: 'document' | 'folder') => {
    const favoriteItem: FavoriteItem = {
      id: item.id,
      name: item.name,
      type,
      mimeType: 'mimeType' in item ? item.mimeType : undefined,
      size: 'size' in item ? item.size : undefined,
      modifiedTime: item.modifiedTime,
      webViewLink: 'webViewLink' in item ? item.webViewLink : undefined,
      addedAt: new Date().toISOString(),
      tags: [],
      accessCount: 0
    }

    const newFavorites = [...favorites, favoriteItem]
    saveFavorites(newFavorites)
    showSuccess('Adicionado aos Favoritos', `${item.name} foi adicionado aos seus favoritos`)
  }, [favorites, saveFavorites, showSuccess])

  // Remover dos favoritos
  const removeFromFavorites = useCallback((itemId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== itemId)
    saveFavorites(newFavorites)
    showSuccess('Removido dos Favoritos', 'Item removido dos seus favoritos')
  }, [favorites, saveFavorites, showSuccess])

  // Verificar se está nos favoritos
  const isFavorite = useCallback((itemId: string) => {
    return favorites.some(fav => fav.id === itemId)
  }, [favorites])

  // Acessar item (incrementar contador)
  const accessItem = useCallback((itemId: string) => {
    const newFavorites = favorites.map(fav => 
      fav.id === itemId 
        ? { 
            ...fav, 
            accessCount: fav.accessCount + 1,
            lastAccessed: new Date().toISOString()
          }
        : fav
    )
    saveFavorites(newFavorites)
  }, [favorites, saveFavorites])

  // Adicionar tag
  const addTag = useCallback((itemId: string, tag: string) => {
    const newFavorites = favorites.map(fav => 
      fav.id === itemId 
        ? { ...fav, tags: [...fav.tags, tag] }
        : fav
    )
    saveFavorites(newFavorites)
  }, [favorites, saveFavorites])

  // Remover tag
  const removeTag = useCallback((itemId: string, tag: string) => {
    const newFavorites = favorites.map(fav => 
      fav.id === itemId 
        ? { ...fav, tags: fav.tags.filter(t => t !== tag) }
        : fav
    )
    saveFavorites(newFavorites)
  }, [favorites, saveFavorites])

  // Filtrar e ordenar favoritos
  const filteredAndSortedFavorites = favorites
    .filter(fav => {
      if (searchQuery && !fav.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filterType !== 'all' && fav.type !== filterType) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'addedAt':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
          break
        case 'accessCount':
          comparison = a.accessCount - b.accessCount
          break
        case 'lastAccessed':
          comparison = new Date(a.lastAccessed || 0).getTime() - new Date(b.lastAccessed || 0).getTime()
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

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

  const getItemIcon = (item: FavoriteItem) => {
    if (item.type === 'folder') {
      return <Folder className="h-4 w-4 text-blue-500" />
    }
    
    if (item.mimeType?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (item.mimeType?.includes('image')) return <FileText className="h-4 w-4 text-green-500" />
    if (item.mimeType?.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />
    if (item.mimeType?.includes('excel')) return <FileText className="h-4 w-4 text-green-600" />
    
    return <FileText className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Favoritos ({favorites.length})
          </CardTitle>
          <CardDescription>
            Gerencie seus documentos e pastas favoritos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar favoritos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filterType">Tipo</Label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'document' | 'folder')}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Todos</option>
                <option value="document">Documentos</option>
                <option value="folder">Pastas</option>
              </select>
            </div>

            <div>
              <Label htmlFor="sortBy">Ordenar por</Label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="name">Nome</option>
                <option value="addedAt">Data de Adição</option>
                <option value="accessCount">Acessos</option>
                <option value="lastAccessed">Último Acesso</option>
              </select>
            </div>

            <div>
              <Label htmlFor="sortOrder">Ordem</Label>
              <div className="flex space-x-2">
                <Button
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('asc')}
                >
                  <SortAsc className="h-4 w-4" />
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                >
                  <SortDesc className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de favoritos */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Favoritos</CardTitle>
          <CardDescription>
            {filteredAndSortedFavorites.length} item(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedFavorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Nenhum favorito encontrado' : 'Nenhum favorito adicionado ainda'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Acessos</TableHead>
                  <TableHead>Adicionado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedFavorites.map((fav) => (
                  <TableRow key={fav.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getItemIcon(fav)}
                        <span>{fav.name}</span>
                        {fav.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {fav.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {fav.type === 'document' ? 'Documento' : 'Pasta'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(fav.size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{fav.accessCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(fav.addedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {fav.webViewLink && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              accessItem(fav.id)
                              window.open(fav.webViewLink, '_blank')
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeFromFavorites(fav.id)}
                        >
                          <StarOff className="h-4 w-4" />
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

      {/* Ações rápidas para documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Adicione documentos e pastas aos favoritos rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Documentos */}
            <div>
              <h4 className="font-medium mb-2">Documentos Recentes</h4>
              <div className="space-y-2">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addToFavorites(doc, 'document')}
                      disabled={isFavorite(doc.id)}
                    >
                      {isFavorite(doc.id) ? (
                        <Star className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pastas */}
            <div>
              <h4 className="font-medium mb-2">Pastas Disponíveis</h4>
              <div className="space-y-2">
                {folders.slice(0, 5).map((folder) => (
                  <div key={folder.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4" />
                      <span className="text-sm">{folder.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addToFavorites(folder, 'folder')}
                      disabled={isFavorite(folder.id)}
                    >
                      {isFavorite(folder.id) ? (
                        <Star className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
