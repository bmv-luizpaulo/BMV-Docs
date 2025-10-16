"use client";

import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Upload, 
  Copy, 
  Save, 
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useNotifications } from '@/hooks/use-notifications';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface TemplateVariable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'url';
  placeholder: string;
  required: boolean;
  defaultValue?: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  variables: TemplateVariable[];
  category: string;
  tags: string[];
  description: string;
}

interface AppliedTemplate {
  id: string;
  templateId: string;
  templateName: string;
  content: string;
  variables: Record<string, string>;
  appliedAt: string;
  fileName?: string;
}

export function TemplateApplicationSystem() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [appliedTemplates, setAppliedTemplates] = useState<AppliedTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fileName, setFileName] = useState('');
  const { showSuccess, showError, showInfo } = useNotifications();

  // Categorias
  const categories = [
    'all', 'contratos', 'relatorios', 'propostas', 'emails', 'documentos', 'apresentacoes', 'outros'
  ];

  // Carregar templates (simulado)
  useEffect(() => {
    // Simular carregamento de templates
    const mockTemplates: Template[] = [
      {
        id: '1',
        name: 'Contrato de Prestação de Serviços',
        content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Contratante: {{contratante}}
Contratado: {{contratado}}
Data: {{data}}
Valor: R$ {{valor}}

OBJETO
O presente contrato tem por objeto a prestação de serviços de {{servico}}.

CLÁUSULAS
1. O contratado se compromete a prestar os serviços conforme especificado.
2. O pagamento será realizado em {{forma_pagamento}}.
3. O prazo para execução é de {{prazo}} dias.

Data: {{data_assinatura}}
_________________    _________________
Contratante         Contratado`,
        variables: [
          { id: '1', name: 'contratante', type: 'text', placeholder: 'Nome do contratante', required: true },
          { id: '2', name: 'contratado', type: 'text', placeholder: 'Nome do contratado', required: true },
          { id: '3', name: 'data', type: 'date', placeholder: 'Data do contrato', required: true },
          { id: '4', name: 'valor', type: 'number', placeholder: 'Valor do serviço', required: true },
          { id: '5', name: 'servico', type: 'text', placeholder: 'Tipo de serviço', required: true },
          { id: '6', name: 'forma_pagamento', type: 'text', placeholder: 'Forma de pagamento', required: true },
          { id: '7', name: 'prazo', type: 'number', placeholder: 'Prazo em dias', required: true },
          { id: '8', name: 'data_assinatura', type: 'date', placeholder: 'Data de assinatura', required: true }
        ],
        category: 'contratos',
        tags: ['contrato', 'serviços', 'jurídico'],
        description: 'Template para contratos de prestação de serviços'
      },
      {
        id: '2',
        name: 'Relatório de Atividades',
        content: `RELATÓRIO DE ATIVIDADES

Período: {{periodo_inicio}} a {{periodo_fim}}
Responsável: {{responsavel}}
Departamento: {{departamento}}

ATIVIDADES REALIZADAS
{{atividades}}

RESULTADOS ALCANÇADOS
{{resultados}}

PRÓXIMOS PASSOS
{{proximos_passos}}

Observações: {{observacoes}}

Data: {{data_relatorio}}
_________________
{{responsavel}}`,
        variables: [
          { id: '1', name: 'periodo_inicio', type: 'date', placeholder: 'Data início', required: true },
          { id: '2', name: 'periodo_fim', type: 'date', placeholder: 'Data fim', required: true },
          { id: '3', name: 'responsavel', type: 'text', placeholder: 'Nome do responsável', required: true },
          { id: '4', name: 'departamento', type: 'text', placeholder: 'Departamento', required: true },
          { id: '5', name: 'atividades', type: 'text', placeholder: 'Atividades realizadas', required: true },
          { id: '6', name: 'resultados', type: 'text', placeholder: 'Resultados alcançados', required: true },
          { id: '7', name: 'proximos_passos', type: 'text', placeholder: 'Próximos passos', required: true },
          { id: '8', name: 'observacoes', type: 'text', placeholder: 'Observações', required: false },
          { id: '9', name: 'data_relatorio', type: 'date', placeholder: 'Data do relatório', required: true }
        ],
        category: 'relatorios',
        tags: ['relatório', 'atividades', 'gestão'],
        description: 'Template para relatórios de atividades mensais'
      }
    ];
    setTemplates(mockTemplates);
  }, []);

  // Atualizar valor de variável
  const updateVariableValue = useCallback((variableName: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  }, []);

  // Gerar conteúdo
  const generateContent = useCallback(() => {
    if (!selectedTemplate) return;

    let content = selectedTemplate.content;
    
    // Substituir variáveis pelos valores
    selectedTemplate.variables.forEach(variable => {
      const value = variableValues[variable.name] || variable.defaultValue || '';
      const placeholder = new RegExp(`{{${variable.name}}}`, 'g');
      content = content.replace(placeholder, value);
    });

    setGeneratedContent(content);
  }, [selectedTemplate, variableValues]);

  // Aplicar template
  const applyTemplate = useCallback(() => {
    if (!selectedTemplate) {
      showError('Erro', 'Selecione um template primeiro');
      return;
    }

    // Validar variáveis obrigatórias
    const missingRequired = selectedTemplate.variables.filter(variable => 
      variable.required && (!variableValues[variable.name] || variableValues[variable.name].trim() === '')
    );

    if (missingRequired.length > 0) {
      showError('Campos Obrigatórios', `Preencha os campos: ${missingRequired.map(v => v.name).join(', ')}`);
      return;
    }

    generateContent();

    const appliedTemplate: AppliedTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      content: generatedContent,
      variables: { ...variableValues },
      appliedAt: new Date().toISOString(),
      fileName: fileName || `${selectedTemplate.name}_${new Date().toISOString().split('T')[0]}.txt`
    };

    setAppliedTemplates(prev => [appliedTemplate, ...prev]);
    showSuccess('Template Aplicado', `Template "${selectedTemplate.name}" foi aplicado com sucesso`);
  }, [selectedTemplate, variableValues, generatedContent, fileName, generateContent, showSuccess, showError]);

  // Copiar conteúdo
  const copyContent = useCallback(() => {
    navigator.clipboard.writeText(generatedContent);
    showSuccess('Copiado', 'Conteúdo copiado para a área de transferência');
  }, [generatedContent, showSuccess]);

  // Baixar arquivo
  const downloadFile = useCallback(() => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `${selectedTemplate?.name || 'documento'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Download', 'Arquivo baixado com sucesso');
  }, [generatedContent, fileName, selectedTemplate, showSuccess]);

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Limpar formulário
  const clearForm = useCallback(() => {
    setSelectedTemplate(null);
    setVariableValues({});
    setGeneratedContent('');
    setFileName('');
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Seleção de Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" /> Aplicar Template
          </CardTitle>
          <CardDescription>
            Selecione um template e preencha as variáveis para gerar seu documento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Todas as Categorias' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Templates */}
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <div className="p-4 space-y-2">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setVariableValues({});
                      setGeneratedContent('');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{template.category}</Badge>
                            {template.tags.map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {template.variables.length} variáveis
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Variáveis */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" /> Preencher Variáveis
            </CardTitle>
            <CardDescription>
              Preencha as variáveis do template "{selectedTemplate.name}".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Nome do arquivo */}
              <div>
                <Label htmlFor="fileName">Nome do Arquivo (opcional)</Label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder={`${selectedTemplate.name}_${new Date().toISOString().split('T')[0]}.txt`}
                />
              </div>

              {/* Variáveis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable.id} className="space-y-2">
                    <Label htmlFor={variable.id}>
                      {variable.name} {variable.required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={variable.id}
                      type={variable.type === 'number' ? 'number' : 
                            variable.type === 'date' ? 'date' : 
                            variable.type === 'email' ? 'email' : 'text'}
                      placeholder={variable.placeholder}
                      value={variableValues[variable.name] || ''}
                      onChange={(e) => updateVariableValue(variable.name, e.target.value)}
                      required={variable.required}
                    />
                    {variable.defaultValue && (
                      <p className="text-xs text-muted-foreground">
                        Valor padrão: {variable.defaultValue}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button onClick={generateContent} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Gerar Preview
                </Button>
                <Button onClick={applyTemplate}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Aplicar Template
                </Button>
                <Button onClick={clearForm} variant="outline">
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview do Conteúdo */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6" /> Preview do Documento
            </CardTitle>
            <CardDescription>
              Visualize o documento gerado antes de salvar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Button onClick={copyContent} variant="outline">
                  <Copy className="mr-2 h-4 w-4" /> Copiar Conteúdo
                </Button>
                <Button onClick={downloadFile}>
                  <Download className="mr-2 h-4 w-4" /> Baixar Arquivo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Templates Aplicados */}
      {appliedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" /> Histórico de Templates Aplicados
            </CardTitle>
            <CardDescription>
              Documentos gerados recentemente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <div className="p-4 space-y-2">
                {appliedTemplates.map((applied) => (
                  <Card key={applied.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{applied.templateName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Aplicado em: {new Date(applied.appliedAt).toLocaleString()}
                        </p>
                        {applied.fileName && (
                          <p className="text-sm text-muted-foreground">
                            Arquivo: {applied.fileName}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
