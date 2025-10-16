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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Folder,
  Clock,
  Download,
  Upload,
  Eye,
  Star,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import { DriveDocument, DriveFolder } from '@/lib/google-drive'

interface AnalyticsData {
  documents: {
    total: number
    byType: Record<string, number>
    bySize: Record<string, number>
    byDate: Array<{ date: string; count: number }>
  }
  folders: {
    total: number
    byDate: Array<{ date: string; count: number }>
  }
  activity: {
    totalActions: number
    byAction: Record<string, number>
    byDate: Array<{ date: string; count: number }>
    byHour: Array<{ hour: number; count: number }>
  }
  favorites: {
    total: number
    mostAccessed: Array<{ name: string; count: number }>
  }
  tags: {
    total: number
    mostUsed: Array<{ name: string; count: number }>
  }
  performance: {
    averageLoadTime: number
    cacheHitRate: number
    errorRate: number
  }
}

interface AnalyticsDashboardProps {
  accessToken: string
  documents: DriveDocument[]
  folders: DriveFolder[]
}

export default function AnalyticsDashboard({ accessToken, documents, folders }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Cores para gráficos
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]

  // Carregar dados de analytics
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Carregar dados do localStorage
      const activityLog = JSON.parse(localStorage.getItem('bmv-activity-log') || '[]')
      const favorites = JSON.parse(localStorage.getItem('bmv-favorites') || '[]')
      const tags = JSON.parse(localStorage.getItem('bmv-document-tags') || '[]')

      // Processar dados de documentos
      const documentsByType = documents.reduce((acc, doc) => {
        const type = doc.mimeType?.split('/')[1] || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const documentsBySize = documents.reduce((acc, doc) => {
        const size = parseInt(doc.size || '0')
        let category = 'Pequeno'
        if (size > 1024 * 1024) category = 'Grande'
        else if (size > 100 * 1024) category = 'Médio'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Processar dados de atividade
      const activityByAction = activityLog.reduce((acc: Record<string, number>, activity: any) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1
        return acc
      }, {})

      const activityByDate = activityLog.reduce((acc: Record<string, number>, activity: any) => {
        const date = new Date(activity.timestamp).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const activityByHour = activityLog.reduce((acc: Record<number, number>, activity: any) => {
        const hour = new Date(activity.timestamp).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {})

      // Processar favoritos
      const mostAccessed = favorites
        .sort((a: any, b: any) => b.accessCount - a.accessCount)
        .slice(0, 10)
        .map((fav: any) => ({ name: fav.name, count: fav.accessCount }))

      // Processar tags
      const mostUsedTags = tags
        .sort((a: any, b: any) => b.usageCount - a.usageCount)
        .slice(0, 10)
        .map((tag: any) => ({ name: tag.name, count: tag.usageCount }))

      // Gerar dados de performance simulados
      const performance = {
        averageLoadTime: Math.random() * 2000 + 500, // 500-2500ms
        cacheHitRate: Math.random() * 30 + 70, // 70-100%
        errorRate: Math.random() * 5 // 0-5%
      }

      const data: AnalyticsData = {
        documents: {
          total: documents.length,
          byType: documentsByType,
          bySize: documentsBySize,
          byDate: Object.entries(activityByDate).map(([date, count]) => ({ date, count }))
        },
        folders: {
          total: folders.length,
          byDate: Object.entries(activityByDate).map(([date, count]) => ({ date, count }))
        },
        activity: {
          totalActions: activityLog.length,
          byAction: activityByAction,
          byDate: Object.entries(activityByDate).map(([date, count]) => ({ date, count })),
          byHour: Object.entries(activityByHour).map(([hour, count]) => ({ hour: parseInt(hour), count }))
        },
        favorites: {
          total: favorites.length,
          mostAccessed
        },
        tags: {
          total: tags.length,
          mostUsed: mostUsedTags
        },
        performance
      }

      setAnalyticsData(data)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [documents, folders])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Carregando Analytics...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Erro ao Carregar Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Não foi possível carregar os dados de analytics
            </p>
            <Button onClick={loadAnalyticsData} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics Dashboard
            </span>
            <div className="flex items-center space-x-2">
              <Label htmlFor="dateRange">Período:</Label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.documents.total}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pastas</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.folders.total}</div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activity.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              +25% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.favorites.total}</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentos por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Tipo</CardTitle>
            <CardDescription>
              Distribuição dos documentos por tipo de arquivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analyticsData.documents.byType).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(analyticsData.documents.byType).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividades por Ação */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades por Ação</CardTitle>
            <CardDescription>
              Distribuição das atividades por tipo de ação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(analyticsData.activity.byAction).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividades por Hora */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades por Hora</CardTitle>
            <CardDescription>
              Distribuição das atividades ao longo do dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.activity.byHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Documentos por Tamanho */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Tamanho</CardTitle>
            <CardDescription>
              Distribuição dos documentos por tamanho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(analyticsData.documents.bySize).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas de Dados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favoritos Mais Acessados */}
        <Card>
          <CardHeader>
            <CardTitle>Favoritos Mais Acessados</CardTitle>
            <CardDescription>
              Documentos e pastas mais acessados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.favorites.mostAccessed.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-medium">{item.name}</span>
                  <Badge variant="outline">{item.count} acessos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags Mais Usadas */}
        <Card>
          <CardHeader>
            <CardTitle>Tags Mais Usadas</CardTitle>
            <CardDescription>
              Tags mais utilizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.tags.mostUsed.slice(0, 10).map((tag, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-medium">{tag.name}</span>
                  <Badge variant="outline">{tag.count} usos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
          <CardDescription>
            Indicadores de performance do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.performance.averageLoadTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Tempo Médio de Carregamento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.performance.cacheHitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Cache Hit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analyticsData.performance.errorRate.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Erro</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
