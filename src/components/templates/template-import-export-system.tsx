"use client";

import { useState, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  FileText, 
  Archive, 
  CheckCircle, 
  AlertCircle,
  Info,
  Trash2,
  Eye,
  Copy
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

interface TemplateStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  margin: number;
  padding: number;
}

interface Template {
  id: string;
  name: string;
  content: string;
  variables: TemplateVariable[];
  styles: TemplateStyle;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
  isPublic: boolean;
  description: string;
}

interface ImportResult {
  success: boolean;
  template?: Template;
  error?: string;
  warnings?: string[];
}

export function TemplateImportExportSystem() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [exportFormat, setExportFormat] = useState<'json' | 'zip' | 'csv'>('json');
  const [importFormat, setImportFormat] = useState<'json' | 'zip' | 'csv'>('json');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  // Selecionar/deselecionar template
  const toggleTemplateSelection = useCallback((templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  }, []);

  // Selecionar todos
  const selectAllTemplates = useCallback(() => {
    setSelectedTemplates(templates.map(t => t.id));
  }, [templates]);

  // Desmarcar todos
  const deselectAllTemplates = useCallback(() => {
    setSelectedTemplates([]);
  }, []);

  // Exportar templates selecionados
  const exportTemplates = useCallback(() => {
    if (selectedTemplates.length === 0) {
      showError('Erro', 'Selecione pelo menos um template para exportar');
      return;
    }

    const templatesToExport = templates.filter(t => selectedTemplates.includes(t.id));
    
    switch (exportFormat) {
      case 'json':
        exportAsJSON(templatesToExport);
        break;
      case 'zip':
        exportAsZIP(templatesToExport);
        break;
      case 'csv':
        exportAsCSV(templatesToExport);
        break;
    }
  }, [selectedTemplates, templates, exportFormat, showError]);

  // Exportar como JSON
  const exportAsJSON = useCallback((templatesToExport: Template[]) => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      templates: templatesToExport
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Exportação Concluída', `${templatesToExport.length} template(s) exportado(s) como JSON`);
  }, [showSuccess]);

  // Exportar como ZIP
  const exportAsZIP = useCallback((templatesToExport: Template[]) => {
    // Simulação de exportação ZIP (em produção, usar uma biblioteca como JSZip)
    const zipContent = templatesToExport.map(template => 
      `Template: ${template.name}\n` +
      `Categoria: ${template.category}\n` +
      `Descrição: ${template.description}\n` +
      `Conteúdo:\n${template.content}\n` +
      `Variáveis: ${template.variables.map(v => `${v.name} (${v.type})`).join(', ')}\n` +
      `---\n`
    ).join('\n');

    const blob = new Blob([zipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Exportação Concluída', `${templatesToExport.length} template(s) exportado(s) como ZIP`);
  }, [showSuccess]);

  // Exportar como CSV
  const exportAsCSV = useCallback((templatesToExport: Template[]) => {
    const headers = ['Nome', 'Categoria', 'Descrição', 'Variáveis', 'Tags', 'Versão'];
    const csvContent = [
      headers.join(','),
      ...templatesToExport.map(template => [
        `"${template.name}"`,
        `"${template.category}"`,
        `"${template.description}"`,
        `"${template.variables.map(v => v.name).join('; ')}"`,
        `"${template.tags.join('; ')}"`,
        template.version
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Exportação Concluída', `${templatesToExport.length} template(s) exportado(s) como CSV`);
  }, [showSuccess]);

  // Importar templates
  const importTemplates = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedTemplates: Template[] = [];

        switch (importFormat) {
          case 'json':
            const jsonData = JSON.parse(content);
            if (jsonData.templates && Array.isArray(jsonData.templates)) {
              importedTemplates = jsonData.templates;
            } else if (Array.isArray(jsonData)) {
              importedTemplates = jsonData;
            } else {
              throw new Error('Formato JSON inválido');
            }
            break;
          case 'csv':
            importedTemplates = parseCSV(content);
            break;
          case 'zip':
            showError('Erro', 'Importação ZIP não implementada ainda');
            return;
        }

        // Validar e processar templates
        const results: ImportResult[] = importedTemplates.map(template => {
          const validation = validateTemplate(template);
          if (validation.isValid) {
            const newTemplate = {
              ...template,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1
            };
            setTemplates(prev => [...prev, newTemplate]);
            return { success: true, template: newTemplate };
          } else {
            return { success: false, error: validation.error };
          }
        });

        setImportResults(results);
        const successCount = results.filter(r => r.success).length;
        showSuccess('Importação Concluída', `${successCount} de ${importedTemplates.length} templates importados com sucesso`);

      } catch (error) {
        showError('Erro na Importação', `Erro ao processar arquivo: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    reader.readAsText(file);
  }, [importFormat, showSuccess, showError]);

  // Validar template
  const validateTemplate = useCallback((template: any): { isValid: boolean; error?: string } => {
    if (!template.name || typeof template.name !== 'string') {
      return { isValid: false, error: 'Nome do template é obrigatório' };
    }
    if (!template.content || typeof template.content !== 'string') {
      return { isValid: false, error: 'Conteúdo do template é obrigatório' };
    }
    if (!template.variables || !Array.isArray(template.variables)) {
      return { isValid: false, error: 'Variáveis devem ser um array' };
    }
    return { isValid: true };
  }, []);

  // Parse CSV
  const parseCSV = useCallback((content: string): Template[] => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const templates: Template[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      if (values.length >= headers.length) {
        const template: Template = {
          id: '',
          name: values[0] || 'Template Importado',
          content: values[1] || '',
          variables: [],
          styles: {
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'normal',
            color: '#000000',
            backgroundColor: '#ffffff',
            textAlign: 'left',
            lineHeight: 1.5,
            margin: 0,
            padding: 0
          },
          category: values[2] || 'documentos',
          tags: values[3] ? values[3].split(';').map(t => t.trim()) : [],
          createdAt: '',
          updatedAt: '',
          version: 1,
          isPublic: false,
          description: values[4] || ''
        };
        templates.push(template);
      }
    }

    return templates;
  }, []);

  // Limpar resultados de importação
  const clearImportResults = useCallback(() => {
    setImportResults([]);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-6 w-6" /> Exportar Templates
          </CardTitle>
          <CardDescription>
            Selecione os templates que deseja exportar e escolha o formato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controles de seleção */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={selectAllTemplates}>
                Selecionar Todos
              </Button>
              <Button variant="outline" onClick={deselectAllTemplates}>
                Desmarcar Todos
              </Button>
            </div>

            {/* Lista de templates para exportação */}
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <div className="p-4 space-y-2">
                {templates.length === 0 ? (
                  <p className="text-center text-muted-foreground">Nenhum template disponível para exportação</p>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        checked={selectedTemplates.includes(template.id)}
                        onCheckedChange={() => toggleTemplateSelection(template.id)}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary">{template.category}</Badge>
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Formato de exportação */}
            <div className="flex gap-4 items-center">
              <Label>Formato de Exportação:</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="zip">ZIP</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={exportTemplates}
                disabled={selectedTemplates.length === 0}
              >
                <Download className="mr-2 h-4 w-4" /> Exportar ({selectedTemplates.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Importação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" /> Importar Templates
          </CardTitle>
          <CardDescription>
            Importe templates de arquivos JSON, ZIP ou CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Formato de importação */}
            <div className="flex gap-4 items-center">
              <Label>Formato do Arquivo:</Label>
              <Select value={importFormat} onValueChange={(value: any) => setImportFormat(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="zip">ZIP</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upload de arquivo */}
            <div className="flex gap-4 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept={importFormat === 'json' ? '.json' : importFormat === 'csv' ? '.csv' : '.zip'}
                onChange={importTemplates}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Selecionar Arquivo
              </Button>
            </div>

            {/* Resultados da importação */}
            {importResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" /> Resultados da Importação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full rounded-md border">
                    <div className="p-4 space-y-2">
                      {importResults.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div className="flex-1">
                            {result.success ? (
                              <p className="text-sm">Template "{result.template?.name}" importado com sucesso</p>
                            ) : (
                              <p className="text-sm text-red-600">Erro: {result.error}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={clearImportResults}>
                      Limpar Resultados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Biblioteca de Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-6 w-6" /> Biblioteca de Templates
          </CardTitle>
          <CardDescription>
            Gerencie sua coleção de templates importados e exportados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="p-4 space-y-4">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum template na biblioteca</p>
                  <p className="text-sm text-muted-foreground">Importe templates para começar</p>
                </div>
              ) : (
                templates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{template.category}</Badge>
                          <Badge variant="outline">v{template.version}</Badge>
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Criado em: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
