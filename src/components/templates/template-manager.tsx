"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Folder,
  File,
  Image,
  Video,
  Music,
  Archive,
  Code,
  BookOpen,
  Briefcase,
  Calendar,
  CheckSquare,
  List,
  BarChart3,
  PieChart,
  Settings,
  Eye,
  EyeOff,
  Share,
  Tag,
  Calendar as CalendarIcon,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link,
  Paperclip,
  Save,
  RefreshCw
} from 'lucide-react'
import { DriveDocument, DriveFolder } from '@/lib/google-drive'
import { useSystemNotifications } from '@/hooks/use-notifications'

interface DocumentTemplate {
  id: string
  name: string
  description: string
  category: 'contract' | 'report' | 'proposal' | 'invoice' | 'letter' | 'memo' | 'presentation' | 'form' | 'custom'
  type: 'document' | 'spreadsheet' | 'presentation' | 'form'
  content: string
  variables: TemplateVariable[]
  metadata: {
    author: string
    createdAt: string
    updatedAt: string
    version: string
    tags: string[]
    isPublic: boolean
    usageCount: number
    lastUsed?: string
  }
  preview?: string
  thumbnail?: string
}

interface TemplateVariable {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'select' | 'multiselect' | 'boolean' | 'file'
  label: string
  placeholder: string
  required: boolean
  defaultValue?: string
  options?: string[] // Para select e multiselect
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
}

interface TemplateManagerProps {
  accessToken: string
  documents: DriveDocument[]
  folders: DriveFolder[]
}

export default function TemplateManager({ accessToken, documents, folders }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false)
  const [isUseTemplateOpen, setIsUseTemplateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({})
  const [newTemplate, setNewTemplate] = useState<Partial<DocumentTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    type: 'document',
    content: '',
    variables: [],
    metadata: {
      author: 'Usuário',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      tags: [],
      isPublic: false,
      usageCount: 0
    }
  })

  const { showSuccess, showError, showInfo } = useSystemNotifications()

  // Carregar templates do localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('bmv-document-templates')
    if (savedTemplates) {
      const parsedTemplates = JSON.parse(savedTemplates)
      setTemplates(parsedTemplates)
      setFilteredTemplates(parsedTemplates)
    } else {
      // Templates padrão
      const defaultTemplates = createDefaultTemplates()
      setTemplates(defaultTemplates)
      setFilteredTemplates(defaultTemplates)
      localStorage.setItem('bmv-document-templates', JSON.stringify(defaultTemplates))
    }
  }, [])

  // Filtrar templates
  useEffect(() => {
    let filtered = templates

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (filterCategory) {
      filtered = filtered.filter(template => template.category === filterCategory)
    }

    if (filterType) {
      filtered = filtered.filter(template => template.type === filterType)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, filterCategory, filterType])

  // Salvar templates
  const saveTemplates = useCallback((newTemplates: DocumentTemplate[]) => {
    setTemplates(newTemplates)
    localStorage.setItem('bmv-document-templates', JSON.stringify(newTemplates))
  }, [])

  // Criar template padrão
  const createDefaultTemplates = (): DocumentTemplate[] => {
    return [
      {
        id: 'contract-template',
        name: 'Contrato de Prestação de Serviços',
        description: 'Template padrão para contratos de prestação de serviços',
        category: 'contract',
        type: 'document',
        content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: {{companyName}}
CNPJ: {{companyCnpj}}
Endereço: {{companyAddress}}

CONTRATADO: {{serviceProviderName}}
CPF/CNPJ: {{serviceProviderDocument}}
Endereço: {{serviceProviderAddress}}

OBJETO DO CONTRATO
O presente contrato tem por objeto a prestação de serviços de {{serviceDescription}}.

VALOR E FORMA DE PAGAMENTO
O valor total dos serviços é de R$ {{serviceValue}}, a ser pago em {{paymentTerms}}.

PRAZO
O prazo para execução dos serviços é de {{serviceDeadline}} dias, contados a partir da assinatura deste contrato.

CONDIÇÕES GERAIS
{{additionalTerms}}

Data: {{contractDate}}
Local: {{contractLocation}}

_________________________        _________________________
Contratante                        Contratado`,
        variables: [
          { id: 'companyName', name: 'companyName', type: 'text', label: 'Nome da Empresa', placeholder: 'Digite o nome da empresa', required: true },
          { id: 'companyCnpj', name: 'companyCnpj', type: 'text', label: 'CNPJ', placeholder: '00.000.000/0000-00', required: true },
          { id: 'companyAddress', name: 'companyAddress', type: 'text', label: 'Endereço da Empresa', placeholder: 'Rua, número, cidade, estado', required: true },
          { id: 'serviceProviderName', name: 'serviceProviderName', type: 'text', label: 'Nome do Prestador', placeholder: 'Digite o nome do prestador', required: true },
          { id: 'serviceProviderDocument', name: 'serviceProviderDocument', type: 'text', label: 'CPF/CNPJ do Prestador', placeholder: '000.000.000-00', required: true },
          { id: 'serviceProviderAddress', name: 'serviceProviderAddress', type: 'text', label: 'Endereço do Prestador', placeholder: 'Rua, número, cidade, estado', required: true },
          { id: 'serviceDescription', name: 'serviceDescription', type: 'text', label: 'Descrição do Serviço', placeholder: 'Descreva o serviço a ser prestado', required: true },
          { id: 'serviceValue', name: 'serviceValue', type: 'text', label: 'Valor do Serviço', placeholder: '0,00', required: true },
          { id: 'paymentTerms', name: 'paymentTerms', type: 'text', label: 'Condições de Pagamento', placeholder: 'Ex: à vista, parcelado em 3x', required: true },
          { id: 'serviceDeadline', name: 'serviceDeadline', type: 'number', label: 'Prazo (dias)', placeholder: '30', required: true },
          { id: 'additionalTerms', name: 'additionalTerms', type: 'text', label: 'Condições Adicionais', placeholder: 'Termos específicos do contrato', required: false },
          { id: 'contractDate', name: 'contractDate', type: 'date', label: 'Data do Contrato', placeholder: '', required: true },
          { id: 'contractLocation', name: 'contractLocation', type: 'text', label: 'Local', placeholder: 'Cidade, Estado', required: true }
        ],
        metadata: {
          author: 'Sistema',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0',
          tags: ['contrato', 'serviços', 'jurídico'],
          isPublic: true,
          usageCount: 0
        }
      },
      {
        id: 'report-template',
        name: 'Relatório de Atividades',
        description: 'Template para relatórios mensais de atividades',
        category: 'report',
        type: 'document',
        content: `RELATÓRIO DE ATIVIDADES - {{month}}/{{year}}

RESUMO EXECUTIVO
{{executiveSummary}}

OBJETIVOS ALCANÇADOS
{{achievedObjectives}}

ATIVIDADES REALIZADAS
{{activitiesPerformed}}

RESULTADOS OBTIDOS
{{resultsObtained}}

DIFICULDADES ENFRENTADAS
{{challengesFaced}}

PRÓXIMOS PASSOS
{{nextSteps}}

CONCLUSÃO
{{conclusion}}

Relatório elaborado por: {{authorName}}
Data: {{reportDate}}
Departamento: {{department}}`,
        variables: [
          { id: 'month', name: 'month', type: 'text', label: 'Mês', placeholder: 'Janeiro', required: true },
          { id: 'year', name: 'year', type: 'number', label: 'Ano', placeholder: '2024', required: true },
          { id: 'executiveSummary', name: 'executiveSummary', type: 'text', label: 'Resumo Executivo', placeholder: 'Resumo das principais atividades do período', required: true },
          { id: 'achievedObjectives', name: 'achievedObjectives', type: 'text', label: 'Objetivos Alcançados', placeholder: 'Liste os objetivos alcançados', required: true },
          { id: 'activitiesPerformed', name: 'activitiesPerformed', type: 'text', label: 'Atividades Realizadas', placeholder: 'Descreva as atividades realizadas', required: true },
          { id: 'resultsObtained', name: 'resultsObtained', type: 'text', label: 'Resultados Obtidos', placeholder: 'Descreva os resultados obtidos', required: true },
          { id: 'challengesFaced', name: 'challengesFaced', type: 'text', label: 'Dificuldades Enfrentadas', placeholder: 'Descreva as dificuldades enfrentadas', required: false },
          { id: 'nextSteps', name: 'nextSteps', type: 'text', label: 'Próximos Passos', placeholder: 'Descreva os próximos passos', required: true },
          { id: 'conclusion', name: 'conclusion', type: 'text', label: 'Conclusão', placeholder: 'Conclusão do relatório', required: true },
          { id: 'authorName', name: 'authorName', type: 'text', label: 'Autor', placeholder: 'Nome do autor', required: true },
          { id: 'reportDate', name: 'reportDate', type: 'date', label: 'Data do Relatório', placeholder: '', required: true },
          { id: 'department', name: 'department', type: 'text', label: 'Departamento', placeholder: 'Nome do departamento', required: true }
        ],
        metadata: {
          author: 'Sistema',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0',
          tags: ['relatório', 'atividades', 'mensal'],
          isPublic: true,
          usageCount: 0
        }
      },
      {
        id: 'invoice-template',
        name: 'Nota Fiscal de Serviços',
        description: 'Template para notas fiscais de serviços prestados',
        category: 'invoice',
        type: 'document',
        content: `NOTA FISCAL DE SERVIÇOS

PRESTADOR DE SERVIÇOS
{{providerName}}
CNPJ: {{providerCnpj}}
Endereço: {{providerAddress}}
Telefone: {{providerPhone}}
Email: {{providerEmail}}

TOMADOR DE SERVIÇOS
{{clientName}}
CPF/CNPJ: {{clientDocument}}
Endereço: {{clientAddress}}

SERVIÇOS PRESTADOS
{{servicesDescription}}

VALORES
Valor dos Serviços: R$ {{serviceValue}}
Impostos: R$ {{taxes}}
Valor Total: R$ {{totalValue}}

FORMA DE PAGAMENTO
{{paymentMethod}}

DATA DE EMISSÃO: {{issueDate}}
DATA DE VENCIMENTO: {{dueDate}}

OBSERVAÇÕES
{{observations}}`,
        variables: [
          { id: 'providerName', name: 'providerName', type: 'text', label: 'Nome do Prestador', placeholder: 'Nome da empresa', required: true },
          { id: 'providerCnpj', name: 'providerCnpj', type: 'text', label: 'CNPJ do Prestador', placeholder: '00.000.000/0000-00', required: true },
          { id: 'providerAddress', name: 'providerAddress', type: 'text', label: 'Endereço do Prestador', placeholder: 'Endereço completo', required: true },
          { id: 'providerPhone', name: 'providerPhone', type: 'phone', label: 'Telefone do Prestador', placeholder: '(00) 00000-0000', required: true },
          { id: 'providerEmail', name: 'providerEmail', type: 'email', label: 'Email do Prestador', placeholder: 'email@exemplo.com', required: true },
          { id: 'clientName', name: 'clientName', type: 'text', label: 'Nome do Cliente', placeholder: 'Nome do cliente', required: true },
          { id: 'clientDocument', name: 'clientDocument', type: 'text', label: 'CPF/CNPJ do Cliente', placeholder: '000.000.000-00', required: true },
          { id: 'clientAddress', name: 'clientAddress', type: 'text', label: 'Endereço do Cliente', placeholder: 'Endereço completo', required: true },
          { id: 'servicesDescription', name: 'servicesDescription', type: 'text', label: 'Descrição dos Serviços', placeholder: 'Descreva os serviços prestados', required: true },
          { id: 'serviceValue', name: 'serviceValue', type: 'text', label: 'Valor dos Serviços', placeholder: '0,00', required: true },
          { id: 'taxes', name: 'taxes', type: 'text', label: 'Impostos', placeholder: '0,00', required: true },
          { id: 'totalValue', name: 'totalValue', type: 'text', label: 'Valor Total', placeholder: '0,00', required: true },
          { id: 'paymentMethod', name: 'paymentMethod', type: 'text', label: 'Forma de Pagamento', placeholder: 'PIX, Transferência, etc.', required: true },
          { id: 'issueDate', name: 'issueDate', type: 'date', label: 'Data de Emissão', placeholder: '', required: true },
          { id: 'dueDate', name: 'dueDate', type: 'date', label: 'Data de Vencimento', placeholder: '', required: true },
          { id: 'observations', name: 'observations', type: 'text', label: 'Observações', placeholder: 'Observações adicionais', required: false }
        ],
        metadata: {
          author: 'Sistema',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0',
          tags: ['nota fiscal', 'serviços', 'financeiro'],
          isPublic: true,
          usageCount: 0
        }
      }
    ]
  }

  // Criar novo template
  const createTemplate = useCallback(() => {
    if (!newTemplate.name?.trim()) {
      showError('Nome do template é obrigatório')
      return
    }

    const template: DocumentTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTemplate.name.trim(),
      description: newTemplate.description?.trim() || '',
      category: newTemplate.category || 'custom',
      type: newTemplate.type || 'document',
      content: newTemplate.content || '',
      variables: newTemplate.variables || [],
      metadata: {
        author: 'Usuário',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        tags: newTemplate.metadata?.tags || [],
        isPublic: newTemplate.metadata?.isPublic || false,
        usageCount: 0
      }
    }

    const newTemplates = [...templates, template]
    saveTemplates(newTemplates)
    
    setNewTemplate({
      name: '',
      description: '',
      category: 'custom',
      type: 'document',
      content: '',
      variables: [],
      metadata: {
        author: 'Usuário',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        tags: [],
        isPublic: false,
        usageCount: 0
      }
    })
    setIsCreateTemplateOpen(false)
    showSuccess('Template Criado', `O template "${template.name}" foi criado com sucesso`)
  }, [newTemplate, templates, saveTemplates, showSuccess, showError])

  // Editar template
  const editTemplate = useCallback(() => {
    if (!editingTemplate) return

    const updatedTemplates = templates.map(template => 
      template.id === editingTemplate.id 
        ? { 
            ...template, 
            ...newTemplate,
            metadata: {
              ...template.metadata,
              updatedAt: new Date().toISOString(),
              version: (parseFloat(template.metadata.version) + 0.1).toFixed(1)
            }
          }
        : template
    )

    saveTemplates(updatedTemplates)
    setIsEditTemplateOpen(false)
    setEditingTemplate(null)
    setNewTemplate({
      name: '',
      description: '',
      category: 'custom',
      type: 'document',
      content: '',
      variables: [],
      metadata: {
        author: 'Usuário',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        tags: [],
        isPublic: false,
        usageCount: 0
      }
    })
    showSuccess('Template Atualizado', 'O template foi atualizado com sucesso')
  }, [editingTemplate, newTemplate, templates, saveTemplates, showSuccess])

  // Excluir template
  const deleteTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    if (confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      const newTemplates = templates.filter(t => t.id !== templateId)
      saveTemplates(newTemplates)
      showSuccess('Template Excluído', `O template "${template.name}" foi excluído`)
    }
  }, [templates, saveTemplates, showSuccess])

  // Usar template
  const useTemplate = useCallback(() => {
    if (!selectedTemplate) return

    // Processar template com valores
    let processedContent = selectedTemplate.content
    
    Object.entries(templateValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processedContent = processedContent.replace(regex, value)
    })

    // Criar documento
    const documentName = `${selectedTemplate.name} - ${new Date().toLocaleDateString('pt-BR')}`
    
    // Simular criação de documento
    showSuccess('Documento Criado', `O documento "${documentName}" foi criado com sucesso`)
    
    // Atualizar contador de uso
    const updatedTemplates = templates.map(template => 
      template.id === selectedTemplate.id 
        ? { 
            ...template, 
            metadata: { 
              ...template.metadata, 
              usageCount: template.metadata.usageCount + 1,
              lastUsed: new Date().toISOString()
            }
          }
        : template
    )
    saveTemplates(updatedTemplates)

    setIsUseTemplateOpen(false)
    setSelectedTemplate(null)
    setTemplateValues({})
  }, [selectedTemplate, templateValues, templates, saveTemplates, showSuccess])

  // Adicionar variável
  const addVariable = useCallback(() => {
    const newVariable: TemplateVariable = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'text',
      label: '',
      placeholder: '',
      required: false
    }

    setNewTemplate(prev => ({
      ...prev,
      variables: [...(prev.variables || []), newVariable]
    }))
  }, [])

  // Remover variável
  const removeVariable = useCallback((variableId: string) => {
    setNewTemplate(prev => ({
      ...prev,
      variables: (prev.variables || []).filter(v => v.id !== variableId)
    }))
  }, [])

  // Obter ícone da categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contract':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'report':
        return <BarChart3 className="h-4 w-4 text-green-500" />
      case 'proposal':
        return <Briefcase className="h-4 w-4 text-purple-500" />
      case 'invoice':
        return <CheckSquare className="h-4 w-4 text-orange-500" />
      case 'letter':
        return <Mail className="h-4 w-4 text-red-500" />
      case 'memo':
        return <List className="h-4 w-4 text-indigo-500" />
      case 'presentation':
        return <PieChart className="h-4 w-4 text-pink-500" />
      case 'form':
        return <CheckSquare className="h-4 w-4 text-cyan-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  // Obter ícone do tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'spreadsheet':
        return <BarChart3 className="h-4 w-4" />
      case 'presentation':
        return <PieChart className="h-4 w-4" />
      case 'form':
        return <CheckSquare className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Gerenciador de Templates ({templates.length})
            </span>
            <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription>
                    Crie um novo template de documento
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Nome do Template</Label>
                      <Input
                        id="templateName"
                        value={newTemplate.name || ''}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Digite o nome do template"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateCategory">Categoria</Label>
                      <Select
                        value={newTemplate.category || 'custom'}
                        onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contract">Contrato</SelectItem>
                          <SelectItem value="report">Relatório</SelectItem>
                          <SelectItem value="proposal">Proposta</SelectItem>
                          <SelectItem value="invoice">Nota Fiscal</SelectItem>
                          <SelectItem value="letter">Carta</SelectItem>
                          <SelectItem value="memo">Memorando</SelectItem>
                          <SelectItem value="presentation">Apresentação</SelectItem>
                          <SelectItem value="form">Formulário</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="templateDescription">Descrição</Label>
                    <Textarea
                      id="templateDescription"
                      value={newTemplate.description || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o template"
                    />
                  </div>

                  {/* Conteúdo do template */}
                  <div>
                    <Label htmlFor="templateContent">Conteúdo do Template</Label>
                    <Textarea
                      id="templateContent"
                      value={newTemplate.content || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Digite o conteúdo do template. Use {{variavel}} para variáveis."
                      rows={10}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Use {{nomeDaVariavel}} para criar variáveis que serão preenchidas pelo usuário
                    </p>
                  </div>

                  {/* Variáveis */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Variáveis do Template</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Variável
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(newTemplate.variables || []).map((variable, index) => (
                        <div key={variable.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <Label htmlFor={`var-name-${index}`}>Nome da Variável</Label>
                              <Input
                                id={`var-name-${index}`}
                                value={variable.name}
                                onChange={(e) => {
                                  const newVariables = [...(newTemplate.variables || [])]
                                  newVariables[index] = { ...variable, name: e.target.value }
                                  setNewTemplate(prev => ({ ...prev, variables: newVariables }))
                                }}
                                placeholder="nomeDaVariavel"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`var-type-${index}`}>Tipo</Label>
                              <Select
                                value={variable.type}
                                onValueChange={(value) => {
                                  const newVariables = [...(newTemplate.variables || [])]
                                  newVariables[index] = { ...variable, type: value as any }
                                  setNewTemplate(prev => ({ ...prev, variables: newVariables }))
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Texto</SelectItem>
                                  <SelectItem value="number">Número</SelectItem>
                                  <SelectItem value="date">Data</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="phone">Telefone</SelectItem>
                                  <SelectItem value="url">URL</SelectItem>
                                  <SelectItem value="select">Seleção</SelectItem>
                                  <SelectItem value="multiselect">Múltipla Seleção</SelectItem>
                                  <SelectItem value="boolean">Sim/Não</SelectItem>
                                  <SelectItem value="file">Arquivo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <Label htmlFor={`var-label-${index}`}>Rótulo</Label>
                              <Input
                                id={`var-label-${index}`}
                                value={variable.label}
                                onChange={(e) => {
                                  const newVariables = [...(newTemplate.variables || [])]
                                  newVariables[index] = { ...variable, label: e.target.value }
                                  setNewTemplate(prev => ({ ...prev, variables: newVariables }))
                                }}
                                placeholder="Rótulo da variável"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`var-placeholder-${index}`}>Placeholder</Label>
                              <Input
                                id={`var-placeholder-${index}`}
                                value={variable.placeholder}
                                onChange={(e) => {
                                  const newVariables = [...(newTemplate.variables || [])]
                                  newVariables[index] = { ...variable, placeholder: e.target.value }
                                  setNewTemplate(prev => ({ ...prev, variables: newVariables }))
                                }}
                                placeholder="Texto de ajuda"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={variable.required}
                                onChange={(e) => {
                                  const newVariables = [...(newTemplate.variables || [])]
                                  newVariables[index] = { ...variable, required: e.target.checked }
                                  setNewTemplate(prev => ({ ...prev, variables: newVariables }))
                                }}
                              />
                              <span className="text-sm">Obrigatório</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeVariable(variable.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createTemplate}>
                    Criar Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filterCategory">Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="report">Relatório</SelectItem>
                  <SelectItem value="proposal">Proposta</SelectItem>
                  <SelectItem value="invoice">Nota Fiscal</SelectItem>
                  <SelectItem value="letter">Carta</SelectItem>
                  <SelectItem value="memo">Memorando</SelectItem>
                  <SelectItem value="presentation">Apresentação</SelectItem>
                  <SelectItem value="form">Formulário</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterType">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="spreadsheet">Planilha</SelectItem>
                  <SelectItem value="presentation">Apresentação</SelectItem>
                  <SelectItem value="form">Formulário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de templates */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Disponíveis</CardTitle>
          <CardDescription>
            {filteredTemplates.length} template(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum template encontrado com os filtros aplicados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(template.category)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setIsUseTemplateOpen(true)
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTemplate(template)
                            setNewTemplate(template)
                            setIsEditTemplateOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Categoria:</span>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tipo:</span>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(template.type)}
                          <span>{template.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Variáveis:</span>
                        <span>{template.variables.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Usos:</span>
                        <span>{template.metadata.usageCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Versão:</span>
                        <span>{template.metadata.version}</span>
                      </div>
                      {template.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.metadata.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de uso do template */}
      <Dialog open={isUseTemplateOpen} onOpenChange={setIsUseTemplateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Usar Template: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preencha as variáveis para criar o documento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTemplate?.variables.map(variable => (
              <div key={variable.id}>
                <Label htmlFor={variable.id}>
                  {variable.label}
                  {variable.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {variable.type === 'text' && (
                  <Input
                    id={variable.id}
                    value={templateValues[variable.name] || ''}
                    onChange={(e) => setTemplateValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                    placeholder={variable.placeholder}
                  />
                )}
                {variable.type === 'number' && (
                  <Input
                    id={variable.id}
                    type="number"
                    value={templateValues[variable.name] || ''}
                    onChange={(e) => setTemplateValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                    placeholder={variable.placeholder}
                  />
                )}
                {variable.type === 'date' && (
                  <Input
                    id={variable.id}
                    type="date"
                    value={templateValues[variable.name] || ''}
                    onChange={(e) => setTemplateValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                  />
                )}
                {variable.type === 'email' && (
                  <Input
                    id={variable.id}
                    type="email"
                    value={templateValues[variable.name] || ''}
                    onChange={(e) => setTemplateValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                    placeholder={variable.placeholder}
                  />
                )}
                {variable.type === 'phone' && (
                  <Input
                    id={variable.id}
                    type="tel"
                    value={templateValues[variable.name] || ''}
                    onChange={(e) => setTemplateValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                    placeholder={variable.placeholder}
                  />
                )}
                {variable.type === 'url' && (
                  <Input
                    id={variable.id}
                    type="url"
                    value={templateValues[variable.name] || ''}
                    onChange={(e) => setTemplateValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                    placeholder={variable.placeholder}
                  />
                )}
                {variable.type === 'select' && (
                  <Select
                    value={templateValues[variable.name] || ''}
                    onValueChange={(value) => setTemplateValues(prev => ({ ...prev, [variable.name]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={variable.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {variable.options?.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {variable.type === 'boolean' && (
                  <Select
                    value={templateValues[variable.name] || ''}
                    onValueChange={(value) => setTemplateValues(prev => ({ ...prev, [variable.name]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {variable.type === 'file' && (
                  <Input
                    id={variable.id}
                    type="file"
                    onChange={(e) => setTemplateValues(prev => ({ ...prev, [variable.name]: e.target.files?.[0]?.name || '' }))}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUseTemplateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={useTemplate}>
              Criar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>
              Edite as informações do template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Mesmo conteúdo do dialog de criação */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTemplateName">Nome do Template</Label>
                <Input
                  id="editTemplateName"
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do template"
                />
              </div>
              <div>
                <Label htmlFor="editTemplateCategory">Categoria</Label>
                <Select
                  value={newTemplate.category || 'custom'}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="report">Relatório</SelectItem>
                    <SelectItem value="proposal">Proposta</SelectItem>
                    <SelectItem value="invoice">Nota Fiscal</SelectItem>
                    <SelectItem value="letter">Carta</SelectItem>
                    <SelectItem value="memo">Memorando</SelectItem>
                    <SelectItem value="presentation">Apresentação</SelectItem>
                    <SelectItem value="form">Formulário</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="editTemplateDescription">Descrição</Label>
              <Textarea
                id="editTemplateDescription"
                value={newTemplate.description || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o template"
              />
            </div>

            <div>
              <Label htmlFor="editTemplateContent">Conteúdo do Template</Label>
              <Textarea
                id="editTemplateContent"
                value={newTemplate.content || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Digite o conteúdo do template. Use {{variavel}} para variáveis."
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTemplateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editTemplate}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
