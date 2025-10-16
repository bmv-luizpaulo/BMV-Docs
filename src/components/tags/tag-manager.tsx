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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tag,
  Plus,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  FileText,
  Folder,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'
import { DriveDocument, DriveFolder } from '@/lib/google-drive'
import { useSystemNotifications } from '@/hooks/use-notifications'

interface DocumentTag {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
  usageCount: number
  lastUsed?: string
  category: 'general' | 'project' | 'status' | 'priority' | 'custom'
}

interface TaggedItem {
  id: string
  name: string
  type: 'document' | 'folder'
  tags: string[]
  mimeType?: string
  size?: string
  modifiedTime: string
  webViewLink?: string
}

interface TagManagerProps {
  accessToken: string
  documents: DriveDocument[]
  folders: DriveFolder[]
}

export default function TagManager({ accessToken, documents, folders }: TagManagerProps) {
  const [tags, setTags] = useState<DocumentTag[]>([])
  const [taggedItems, setTaggedItems] = useState<TaggedItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false)
  const [isEditTagOpen, setIsEditTagOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<DocumentTag | null>(null)
  const [newTag, setNewTag] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
    category: 'general' as DocumentTag['category']
  })

  const { showSuccess, showError } = useSystemNotifications()

  // Cores predefinidas para tags
  const tagColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]

  // Carregar tags do localStorage
  useEffect(() => {
    const savedTags = localStorage.getItem('bmv-document-tags')
    const savedTaggedItems = localStorage.getItem('bmv-tagged-items')
    
    if (savedTags) {
      setTags(JSON.parse(savedTags))
    }
    
    if (savedTaggedItems) {
      setTaggedItems(JSON.parse(savedTaggedItems))
    }
  }, [])

  // Salvar tags no localStorage
  const saveTags = useCallback((newTags: DocumentTag[]) => {
    setTags(newTags)
    localStorage.setItem('bmv-document-tags', JSON.stringify(newTags))
  }, [])

  // Salvar itens com tags no localStorage
  const saveTaggedItems = useCallback((newItems: TaggedItem[]) => {
    setTaggedItems(newItems)
    localStorage.setItem('bmv-tagged-items', JSON.stringify(newItems))
  }, [])

  // Criar nova tag
  const createTag = useCallback(() => {
    if (!newTag.name.trim()) {
      showError('Nome da tag é obrigatório')
      return
    }

    if (tags.some(tag => tag.name.toLowerCase() === newTag.name.toLowerCase())) {
      showError('Já existe uma tag com este nome')
      return
    }

    const tag: DocumentTag = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTag.name.trim(),
      color: newTag.color,
      description: newTag.description.trim(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      category: newTag.category
    }

    const newTags = [...tags, tag]
    saveTags(newTags)
    
    setNewTag({ name: '', color: '#3B82F6', description: '', category: 'general' })
    setIsCreateTagOpen(false)
    showSuccess('Tag Criada', `A tag "${tag.name}" foi criada com sucesso`)
  }, [newTag, tags, saveTags, showSuccess, showError])

  // Editar tag
  const editTag = useCallback(() => {
    if (!editingTag || !newTag.name.trim()) return

    const updatedTags = tags.map(tag => 
      tag.id === editingTag.id 
        ? { 
            ...tag, 
            name: newTag.name.trim(),
            color: newTag.color,
            description: newTag.description.trim(),
            category: newTag.category
          }
        : tag
    )

    saveTags(updatedTags)
    setIsEditTagOpen(false)
    setEditingTag(null)
    setNewTag({ name: '', color: '#3B82F6', description: '', category: 'general' })
    showSuccess('Tag Atualizada', 'A tag foi atualizada com sucesso')
  }, [editingTag, newTag, tags, saveTags, showSuccess])

  // Excluir tag
  const deleteTag = useCallback((tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (!tag) return

    if (tag.usageCount > 0) {
      showError('Não é possível excluir uma tag que está sendo usada')
      return
    }

    if (confirm(`Tem certeza que deseja excluir a tag "${tag.name}"?`)) {
      const newTags = tags.filter(t => t.id !== tagId)
      saveTags(newTags)
      showSuccess('Tag Excluída', `A tag "${tag.name}" foi excluída`)
    }
  }, [tags, saveTags, showSuccess, showError])

  // Adicionar tag a um item
  const addTagToItem = useCallback((itemId: string, tagId: string) => {
    const item = [...documents, ...folders].find(i => i.id === itemId)
    if (!item) return

    const existingItem = taggedItems.find(ti => ti.id === itemId)
    const tag = tags.find(t => t.id === tagId)
    if (!tag) return

    if (existingItem) {
      if (existingItem.tags.includes(tagId)) {
        showError('Este item já possui esta tag')
        return
      }

      const updatedItems = taggedItems.map(ti => 
        ti.id === itemId 
          ? { ...ti, tags: [...ti.tags, tagId] }
          : ti
      )
      saveTaggedItems(updatedItems)
    } else {
      const newTaggedItem: TaggedItem = {
        id: item.id,
        name: item.name,
        type: 'mimeType' in item ? 'document' : 'folder',
        tags: [tagId],
        mimeType: 'mimeType' in item ? item.mimeType : undefined,
        size: 'size' in item ? item.size : undefined,
        modifiedTime: item.modifiedTime,
        webViewLink: 'webViewLink' in item ? item.webViewLink : undefined
      }

      const updatedItems = [...taggedItems, newTaggedItem]
      saveTaggedItems(updatedItems)
    }

    // Atualizar contador de uso da tag
    const updatedTags = tags.map(t => 
      t.id === tagId 
        ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() }
        : t
    )
    saveTags(updatedTags)

    showSuccess('Tag Adicionada', `A tag "${tag.name}" foi adicionada ao item`)
  }, [documents, folders, taggedItems, tags, saveTaggedItems, saveTags, showSuccess, showError])

  // Remover tag de um item
  const removeTagFromItem = useCallback((itemId: string, tagId: string) => {
    const updatedItems = taggedItems.map(ti => 
      ti.id === itemId 
        ? { ...ti, tags: ti.tags.filter(t => t !== tagId) }
        : ti
    ).filter(ti => ti.tags.length > 0) // Remove itens sem tags

    saveTaggedItems(updatedItems)

    // Atualizar contador de uso da tag
    const tag = tags.find(t => t.id === tagId)
    if (tag) {
      const updatedTags = tags.map(t => 
        t.id === tagId 
          ? { ...t, usageCount: Math.max(0, t.usageCount - 1) }
          : t
      )
      saveTags(updatedTags)
    }

    showSuccess('Tag Removida', 'A tag foi removida do item')
  }, [taggedItems, tags, saveTaggedItems, saveTags, showSuccess])

  // Filtrar itens por tag
  const filteredItems = taggedItems.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filterTag && !item.tags.includes(filterTag)) {
      return false
    }
    return true
  })

  // Filtrar tags por categoria
  const filteredTags = tags.filter(tag => {
    if (filterCategory && tag.category !== filterCategory) {
      return false
    }
    return true
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

  const getItemIcon = (item: TaggedItem) => {
    if (item.type === 'folder') {
      return <Folder className="h-4 w-4 text-blue-500" />
    }
    
    if (item.mimeType?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (item.mimeType?.includes('image')) return <FileText className="h-4 w-4 text-green-500" />
    if (item.mimeType?.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />
    if (item.mimeType?.includes('excel')) return <FileText className="h-4 w-4 text-green-600" />
    
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Gerenciador de Tags ({tags.length})
            </span>
            <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Tag</DialogTitle>
                  <DialogDescription>
                    Crie uma nova tag para organizar seus documentos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tagName">Nome da Tag</Label>
                    <Input
                      id="tagName"
                      value={newTag.name}
                      onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome da tag"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagDescription">Descrição (opcional)</Label>
                    <Input
                      id="tagDescription"
                      value={newTag.description}
                      onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da tag"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagCategory">Categoria</Label>
                    <select
                      id="tagCategory"
                      value={newTag.category}
                      onChange={(e) => setNewTag(prev => ({ ...prev, category: e.target.value as DocumentTag['category'] }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="general">Geral</option>
                      <option value="project">Projeto</option>
                      <option value="status">Status</option>
                      <option value="priority">Prioridade</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  <div>
                    <Label>Cor da Tag</Label>
                    <div className="flex space-x-2 mt-2">
                      {tagColors.map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newTag.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTag(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateTagOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createTag}>
                    Criar Tag
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar Itens</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar itens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filterTag">Filtrar por Tag</Label>
              <select
                id="filterTag"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todas as tags</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="filterCategory">Categoria</Label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todas as categorias</option>
                <option value="general">Geral</option>
                <option value="project">Projeto</option>
                <option value="status">Status</option>
                <option value="priority">Prioridade</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags Disponíveis</CardTitle>
          <CardDescription>
            {filteredTags.length} tag(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map(tag => (
              <div key={tag.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTag(tag)
                        setNewTag({
                          name: tag.name,
                          color: tag.color,
                          description: tag.description || '',
                          category: tag.category
                        })
                        setIsEditTagOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTag(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {tag.description && (
                  <p className="text-sm text-muted-foreground mb-2">{tag.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{tag.category}</Badge>
                  <span className="text-muted-foreground">
                    {tag.usageCount} uso(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Itens com tags */}
      <Card>
        <CardHeader>
          <CardTitle>Itens com Tags</CardTitle>
          <CardDescription>
            {filteredItems.length} item(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum item encontrado com os filtros aplicados
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getItemIcon(item)}
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.type === 'document' ? 'Documento' : 'Pasta'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(item.size)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map(tagId => {
                          const tag = tags.find(t => t.id === tagId)
                          return tag ? (
                            <Badge 
                              key={tagId} 
                              variant="secondary"
                              className="text-xs"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <select
                          className="text-xs p-1 border rounded"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addTagToItem(item.id, e.target.value)
                              e.target.value = ''
                            }
                          }}
                        >
                          <option value="">Adicionar tag</option>
                          {tags.filter(tag => !item.tags.includes(tag.id)).map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                          ))}
                        </select>
                        {item.tags.map(tagId => (
                          <Button
                            key={tagId}
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTagFromItem(item.id, tagId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={isEditTagOpen} onOpenChange={setIsEditTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tag</DialogTitle>
            <DialogDescription>
              Edite as informações da tag
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTagName">Nome da Tag</Label>
              <Input
                id="editTagName"
                value={newTag.name}
                onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da tag"
              />
            </div>
            <div>
              <Label htmlFor="editTagDescription">Descrição</Label>
              <Input
                id="editTagDescription"
                value={newTag.description}
                onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da tag"
              />
            </div>
            <div>
              <Label htmlFor="editTagCategory">Categoria</Label>
              <select
                id="editTagCategory"
                value={newTag.category}
                onChange={(e) => setNewTag(prev => ({ ...prev, category: e.target.value as DocumentTag['category'] }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="general">Geral</option>
                <option value="project">Projeto</option>
                <option value="status">Status</option>
                <option value="priority">Prioridade</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            <div>
              <Label>Cor da Tag</Label>
              <div className="flex space-x-2 mt-2">
                {tagColors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTag.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTag(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTagOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editTag}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
