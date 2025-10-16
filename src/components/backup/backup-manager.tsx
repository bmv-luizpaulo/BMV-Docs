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
import { Progress } from '@/components/ui/progress'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Download,
  Upload,
  Clock,
  Calendar,
  HardDrive,
  Cloud,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Folder
} from 'lucide-react'
import { DriveDocument, DriveFolder } from '@/lib/google-drive'
import { useSystemNotifications } from '@/hooks/use-notifications'

interface BackupConfig {
  id: string
  name: string
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual'
  time: string
  includeDocuments: boolean
  includeFolders: boolean
  includeTags: boolean
  includeFavorites: boolean
  includeActivity: boolean
  compression: boolean
  encryption: boolean
  lastBackup?: string
  nextBackup?: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  progress?: number
  errorMessage?: string
}

interface BackupJob {
  id: string
  configId: string
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  totalItems: number
  processedItems: number
  errorMessage?: string
  backupSize?: number
  items: {
    documents: DriveDocument[]
    folders: DriveFolder[]
    tags: any[]
    favorites: any[]
    activity: any[]
  }
}

interface BackupManagerProps {
  accessToken: string
  documents: DriveDocument[]
  folders: DriveFolder[]
}

export default function BackupManager({ accessToken, documents, folders }: BackupManagerProps) {
  const [backupConfigs, setBackupConfigs] = useState<BackupConfig[]>([])
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([])
  const [isCreateConfigOpen, setIsCreateConfigOpen] = useState(false)
  const [isRunningBackup, setIsRunningBackup] = useState(false)
  const [newConfig, setNewConfig] = useState<Partial<BackupConfig>>({
    name: '',
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    includeDocuments: true,
    includeFolders: true,
    includeTags: true,
    includeFavorites: true,
    includeActivity: true,
    compression: true,
    encryption: false
  })

  const { showSuccess, showError, showInfo } = useSystemNotifications()

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedConfigs = localStorage.getItem('bmv-backup-configs')
    const savedJobs = localStorage.getItem('bmv-backup-jobs')
    
    if (savedConfigs) {
      setBackupConfigs(JSON.parse(savedConfigs))
    }
    
    if (savedJobs) {
      setBackupJobs(JSON.parse(savedJobs))
    }
  }, [])

  // Salvar configurações
  const saveConfigs = useCallback((configs: BackupConfig[]) => {
    setBackupConfigs(configs)
    localStorage.setItem('bmv-backup-configs', JSON.stringify(configs))
  }, [])

  // Salvar jobs
  const saveJobs = useCallback((jobs: BackupJob[]) => {
    setBackupJobs(jobs)
    localStorage.setItem('bmv-backup-jobs', JSON.stringify(jobs))
  }, [])

  // Criar nova configuração
  const createConfig = useCallback(() => {
    if (!newConfig.name?.trim()) {
      showError('Nome da configuração é obrigatório')
      return
    }

    const config: BackupConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: newConfig.name.trim(),
      enabled: newConfig.enabled || true,
      frequency: newConfig.frequency || 'daily',
      time: newConfig.time || '02:00',
      includeDocuments: newConfig.includeDocuments || true,
      includeFolders: newConfig.includeFolders || true,
      includeTags: newConfig.includeTags || true,
      includeFavorites: newConfig.includeFavorites || true,
      includeActivity: newConfig.includeActivity || true,
      compression: newConfig.compression || true,
      encryption: newConfig.encryption || false,
      status: 'idle'
    }

    const newConfigs = [...backupConfigs, config]
    saveConfigs(newConfigs)
    
    setNewConfig({
      name: '',
      enabled: true,
      frequency: 'daily',
      time: '02:00',
      includeDocuments: true,
      includeFolders: true,
      includeTags: true,
      includeFavorites: true,
      includeActivity: true,
      compression: true,
      encryption: false
    })
    setIsCreateConfigOpen(false)
    showSuccess('Configuração Criada', `A configuração "${config.name}" foi criada com sucesso`)
  }, [newConfig, backupConfigs, saveConfigs, showSuccess, showError])

  // Executar backup
  const runBackup = useCallback(async (configId: string) => {
    const config = backupConfigs.find(c => c.id === configId)
    if (!config) return

    setIsRunningBackup(true)
    
    const job: BackupJob = {
      id: Math.random().toString(36).substr(2, 9),
      configId,
      startTime: new Date().toISOString(),
      status: 'running',
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      items: {
        documents: [],
        folders: [],
        tags: [],
        favorites: [],
        activity: []
      }
    }

    const newJobs = [job, ...backupJobs]
    saveJobs(newJobs)

    try {
      // Simular processo de backup
      const itemsToBackup = {
        documents: config.includeDocuments ? documents : [],
        folders: config.includeFolders ? folders : [],
        tags: config.includeTags ? JSON.parse(localStorage.getItem('bmv-document-tags') || '[]') : [],
        favorites: config.includeFavorites ? JSON.parse(localStorage.getItem('bmv-favorites') || '[]') : [],
        activity: config.includeActivity ? JSON.parse(localStorage.getItem('bmv-activity-log') || '[]') : []
      }

      const totalItems = Object.values(itemsToBackup).reduce((sum, arr) => sum + arr.length, 0)
      
      // Atualizar job com total de itens
      job.totalItems = totalItems
      job.items = itemsToBackup

      // Simular progresso
      for (let i = 0; i <= totalItems; i++) {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        job.progress = Math.round((i / totalItems) * 100)
        job.processedItems = i
        
        const updatedJobs = backupJobs.map(j => j.id === job.id ? { ...job } : j)
        saveJobs(updatedJobs)
      }

      // Finalizar backup
      job.status = 'completed'
      job.endTime = new Date().toISOString()
      job.backupSize = Math.floor(Math.random() * 1000000) + 100000 // Simular tamanho

      const finalJobs = backupJobs.map(j => j.id === job.id ? { ...job } : j)
      saveJobs(finalJobs)

      // Atualizar configuração
      const updatedConfigs = backupConfigs.map(c => 
        c.id === configId 
          ? { ...c, lastBackup: new Date().toISOString(), status: 'completed' }
          : c
      )
      saveConfigs(updatedConfigs)

      showSuccess('Backup Concluído', `Backup "${config.name}" foi concluído com sucesso`)
      
    } catch (error) {
      job.status = 'failed'
      job.endTime = new Date().toISOString()
      job.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

      const failedJobs = backupJobs.map(j => j.id === job.id ? { ...job } : j)
      saveJobs(failedJobs)

      const failedConfigs = backupConfigs.map(c => 
        c.id === configId 
          ? { ...c, status: 'failed', errorMessage: job.errorMessage }
          : c
      )
      saveConfigs(failedConfigs)

      showError('Erro no Backup', job.errorMessage || 'Erro desconhecido')
    } finally {
      setIsRunningBackup(false)
    }
  }, [backupConfigs, backupJobs, documents, folders, saveConfigs, saveJobs, showSuccess, showError])

  // Excluir configuração
  const deleteConfig = useCallback((configId: string) => {
    const config = backupConfigs.find(c => c.id === configId)
    if (!config) return

    if (confirm(`Tem certeza que deseja excluir a configuração "${config.name}"?`)) {
      const newConfigs = backupConfigs.filter(c => c.id !== configId)
      saveConfigs(newConfigs)
      showSuccess('Configuração Excluída', `A configuração "${config.name}" foi excluída`)
    }
  }, [backupConfigs, saveConfigs, showSuccess])

  // Excluir job
  const deleteJob = useCallback((jobId: string) => {
    const newJobs = backupJobs.filter(j => j.id !== jobId)
    saveJobs(newJobs)
    showSuccess('Job Excluído', 'O job de backup foi excluído')
  }, [backupJobs, saveJobs, showSuccess])

  // Download do backup
  const downloadBackup = useCallback((jobId: string) => {
    const job = backupJobs.find(j => j.id === jobId)
    if (!job || job.status !== 'completed') return

    const backupData = {
      exportDate: new Date().toISOString(),
      jobId: job.id,
      configId: job.configId,
      startTime: job.startTime,
      endTime: job.endTime,
      totalItems: job.totalItems,
      backupSize: job.backupSize,
      items: job.items
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${job.configId}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showSuccess('Download Iniciado', 'O download do backup foi iniciado')
  }, [backupJobs, showSuccess])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              Gerenciador de Backup
            </span>
            <Dialog open={isCreateConfigOpen} onOpenChange={setIsCreateConfigOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Nova Configuração
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Configuração de Backup</DialogTitle>
                  <DialogDescription>
                    Configure um novo backup automático
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="configName">Nome da Configuração</Label>
                    <Input
                      id="configName"
                      value={newConfig.name || ''}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome da configuração"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequência</Label>
                      <Select
                        value={newConfig.frequency || 'daily'}
                        onValueChange={(value) => setNewConfig(prev => ({ ...prev, frequency: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newConfig.time || '02:00'}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Itens para Backup</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newConfig.includeDocuments || false}
                          onChange={(e) => setNewConfig(prev => ({ ...prev, includeDocuments: e.target.checked }))}
                        />
                        <span className="text-sm">Documentos</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newConfig.includeFolders || false}
                          onChange={(e) => setNewConfig(prev => ({ ...prev, includeFolders: e.target.checked }))}
                        />
                        <span className="text-sm">Pastas</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newConfig.includeTags || false}
                          onChange={(e) => setNewConfig(prev => ({ ...prev, includeTags: e.target.checked }))}
                        />
                        <span className="text-sm">Tags</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newConfig.includeFavorites || false}
                          onChange={(e) => setNewConfig(prev => ({ ...prev, includeFavorites: e.target.checked }))}
                        />
                        <span className="text-sm">Favoritos</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newConfig.includeActivity || false}
                          onChange={(e) => setNewConfig(prev => ({ ...prev, includeActivity: e.target.checked }))}
                        />
                        <span className="text-sm">Histórico</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Opções</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newConfig.compression || false}
                          onChange={(e) => setNewConfig(prev => ({ ...prev, compression: e.target.checked }))}
                        />
                        <span className="text-sm">Compressão</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newConfig.encryption || false}
                          onChange={(e) => setNewConfig(prev => ({ ...prev, encryption: e.target.checked }))}
                        />
                        <span className="text-sm">Criptografia</span>
                      </label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateConfigOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createConfig}>
                    Criar Configuração
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Backup</CardTitle>
          <CardDescription>
            {backupConfigs.length} configuração(ões) ativa(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupConfigs.length === 0 ? (
            <div className="text-center py-8">
              <HardDrive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma configuração de backup criada ainda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {backupConfigs.map(config => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(config.status)}
                        <span className="font-medium">{config.name}</span>
                      </div>
                      <Badge className={getStatusColor(config.status)}>
                        {config.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runBackup(config.id)}
                        disabled={isRunningBackup}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Executar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteConfig(config.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Frequência:</span>
                      <p className="font-medium">{config.frequency}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horário:</span>
                      <p className="font-medium">{config.time}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Último Backup:</span>
                      <p className="font-medium">
                        {config.lastBackup ? formatDate(config.lastBackup) : 'Nunca'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">{config.status}</p>
                    </div>
                  </div>

                  {config.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      {config.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs de Backup */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>
            {backupJobs.length} job(s) executado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupJobs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum backup executado ainda
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Configuração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backupJobs.map(job => {
                  const config = backupConfigs.find(c => c.id === job.configId)
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {config?.name || 'Configuração não encontrada'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.status === 'running' ? (
                          <div className="space-y-1">
                            <Progress value={job.progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">
                              {job.processedItems}/{job.totalItems} itens
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm">{job.progress}%</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm">{formatDate(job.startTime)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.backupSize ? formatFileSize(job.backupSize) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {job.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadBackup(job.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
