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
  History,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Eye,
  Star,
  Folder,
  FileText,
  Calendar,
  Clock,
  User,
  Activity,
  Loader2
} from 'lucide-react'

interface ActivityLog {
  id: string
  action: 'upload' | 'download' | 'delete' | 'view' | 'favorite' | 'search' | 'create_folder' | 'move'
  itemName: string
  itemType: 'document' | 'folder'
  itemId: string
  timestamp: string
  userAgent?: string
  ipAddress?: string
  details?: Record<string, any>
  success: boolean
  errorMessage?: string
}

interface ActivityHistoryProps {
  accessToken: string
}

export default function ActivityHistory({ accessToken }: ActivityHistoryProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAction, setFilterAction] = useState<string>('')
  const [filterDateRange, setFilterDateRange] = useState({
    start: '',
    end: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  // Carregar atividades do localStorage
  useEffect(() => {
    try {
      const savedActivities = localStorage.getItem('bmv-activity-log')
      if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities)
        setActivities(parsedActivities)
        setFilteredActivities(parsedActivities)
      }
    } catch (error) {
      console.error("Failed to load activities from localStorage", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filtrar atividades
  useEffect(() => {
    if (isLoading) return;
    let filtered = activities

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtro por ação
    if (filterAction) {
      filtered = filtered.filter(activity => activity.action === filterAction)
    }

    // Filtro por data
    if (filterDateRange.start && filterDateRange.end) {
      const startDate = new Date(filterDateRange.start)
      const endDate = new Date(filterDateRange.end)
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp)
        return activityDate >= startDate && activityDate <= endDate
      })
    }

    setFilteredActivities(filtered)
  }, [activities, searchQuery, filterAction, filterDateRange, isLoading])

  // Adicionar nova atividade
  const addActivity = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    }

    const updatedActivities = [newActivity, ...activities].slice(0, 1000) // Manter apenas 1000 atividades
    setActivities(updatedActivities)
    localStorage.setItem('bmv-activity-log', JSON.stringify(updatedActivities))
  }, [activities])

  // Limpar histórico
  const clearHistory = useCallback(() => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de atividades?')) {
      setActivities([])
      setFilteredActivities([])
      localStorage.removeItem('bmv-activity-log')
    }
  }, [])

  // Exportar histórico
  const exportHistory = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalActivities: filteredActivities.length,
      activities: filteredActivities.map(activity => ({
        action: activity.action,
        itemName: activity.itemName,
        itemType: activity.itemType,
        timestamp: activity.timestamp,
        success: activity.success,
        errorMessage: activity.errorMessage,
        details: activity.details
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico-atividades-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [filteredActivities])

  // Obter ícone da ação
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload':
        return <Upload className="h-4 w-4 text-green-500" />
      case 'download':
        return <Download className="h-4 w-4 text-blue-500" />
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />
      case 'view':
        return <Eye className="h-4 w-4 text-purple-500" />
      case 'favorite':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'search':
        return <Search className="h-4 w-4 text-indigo-500" />
      case 'create_folder':
        return <Folder className="h-4 w-4 text-orange-500" />
      case 'move':
        return <Activity className="h-4 w-4 text-cyan-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  // Obter cor do status
  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600'
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  // Obter estatísticas
  const getStats = () => {
    const total = filteredActivities.length
    const successful = filteredActivities.filter(a => a.success).length
    const failed = total - successful
    
    const actionCounts = filteredActivities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, successful, failed, actionCounts }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Histórico de Atividades
          </CardTitle>
          <CardDescription>
            Acompanhe todas as ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-sm text-muted-foreground">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Falhas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.actionCounts).length}
              </div>
              <div className="text-sm text-muted-foreground">Tipos de Ação</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar atividades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filterAction">Ação</Label>
              <select
                id="filterAction"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todas as ações</option>
                <option value="upload">Upload</option>
                <option value="download">Download</option>
                <option value="delete">Exclusão</option>
                <option value="view">Visualização</option>
                <option value="favorite">Favorito</option>
                <option value="search">Busca</option>
                <option value="create_folder">Criar Pasta</option>
                <option value="move">Mover</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dateStart">Data Inicial</Label>
              <Input
                id="dateStart"
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dateEnd">Data Final</Label>
              <Input
                id="dateEnd"
                type="date"
                value={filterDateRange.end}
                onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2 mt-4">
            <Button variant="outline" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Histórico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            {filteredActivities.length} atividade(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterAction || filterDateRange.start || filterDateRange.end
                  ? 'Nenhuma atividade encontrada com os filtros aplicados'
                  : 'Nenhuma atividade registrada ainda'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ação</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(activity.action)}
                        <span className="capitalize">{activity.action}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{activity.itemName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {activity.itemType === 'document' ? 'Documento' : 'Pasta'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{formatDate(activity.timestamp)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={activity.success ? 'default' : 'destructive'}
                        className={getStatusColor(activity.success)}
                      >
                        {activity.success ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {activity.errorMessage && (
                        <span className="text-sm text-red-600">{activity.errorMessage}</span>
                      )}
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {Object.keys(activity.details).length} detalhe(s)
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de ações */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Ações</CardTitle>
          <CardDescription>
            Quantidade de cada tipo de ação realizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.actionCounts).map(([action, count]) => (
              <div key={action} className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {getActionIcon(action)}
                </div>
                <div className="text-lg font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{action}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para usar o histórico de atividades
export function useActivityHistory() {
  const addActivity = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const savedActivities = localStorage.getItem('bmv-activity-log')
    const activities = savedActivities ? JSON.parse(savedActivities) : []
    
    const newActivity: ActivityLog = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    }

    const updatedActivities = [newActivity, ...activities].slice(0, 1000)
    localStorage.setItem('bmv-activity-log', JSON.stringify(updatedActivities))
  }, [])

  return { addActivity }
}

    