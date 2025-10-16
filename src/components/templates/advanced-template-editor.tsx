"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
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
  Save, 
  Undo, 
  Redo, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Eye,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { useNotifications } from '@/hooks/use-notifications';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface AdvancedTemplate {
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

export function AdvancedTemplateEditor() {
  const [templates, setTemplates] = useState<AdvancedTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<AdvancedTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { showSuccess, showError, showInfo } = useNotifications();

  // Categorias pré-definidas
  const categories = [
    'all', 'contratos', 'relatorios', 'propostas', 'emails', 'documentos', 'apresentacoes', 'outros'
  ];

  // Estilos pré-definidos
  const predefinedStyles: Record<string, TemplateStyle> = {
    'default': {
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
    'formal': {
      fontFamily: 'Times New Roman',
      fontSize: 12,
      fontWeight: 'normal',
      color: '#000000',
      backgroundColor: '#ffffff',
      textAlign: 'justify',
      lineHeight: 1.6,
      margin: 20,
      padding: 20
    },
    'modern': {
      fontFamily: 'Helvetica',
      fontSize: 14,
      fontWeight: 'normal',
      color: '#333333',
      backgroundColor: '#ffffff',
      textAlign: 'left',
      lineHeight: 1.4,
      margin: 15,
      padding: 15
    }
  };

  // Salvar estado no histórico
  const saveToHistory = useCallback((content: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Desfazer
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (currentTemplate) {
        setCurrentTemplate({ ...currentTemplate, content: history[newIndex] });
      }
    }
  }, [historyIndex, history, currentTemplate]);

  // Refazer
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      if (currentTemplate) {
        setCurrentTemplate({ ...currentTemplate, content: history[newIndex] });
      }
    }
  }, [historyIndex, history, currentTemplate]);

  // Aplicar formatação
  const applyFormatting = useCallback((format: string) => {
    if (!editorRef.current || !currentTemplate) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](URL)`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'ordered-list':
        formattedText = `1. ${selectedText}`;
        break;
    }

    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    setCurrentTemplate({ ...currentTemplate, content: newContent });
    saveToHistory(newContent);
  }, [currentTemplate, saveToHistory]);

  // Adicionar variável
  const addVariable = useCallback(() => {
    if (!currentTemplate) return;

    const newVariable: TemplateVariable = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'text',
      placeholder: '',
      required: false,
      defaultValue: ''
    };

    setCurrentTemplate({
      ...currentTemplate,
      variables: [...currentTemplate.variables, newVariable]
    });
  }, [currentTemplate]);

  // Atualizar variável
  const updateVariable = useCallback((variableId: string, updates: Partial<TemplateVariable>) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      variables: currentTemplate.variables.map(v => 
        v.id === variableId ? { ...v, ...updates } : v
      )
    });
  }, [currentTemplate]);

  // Remover variável
  const removeVariable = useCallback((variableId: string) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      variables: currentTemplate.variables.filter(v => v.id !== variableId)
    });
  }, [currentTemplate]);

  // Aplicar estilo
  const applyStyle = useCallback((styleName: string) => {
    if (!currentTemplate) return;

    const style = predefinedStyles[styleName];
    if (style) {
      setCurrentTemplate({
        ...currentTemplate,
        styles: { ...style }
      });
    }
  }, [currentTemplate]);

  // Salvar template
  const saveTemplate = useCallback(() => {
    if (!currentTemplate || !currentTemplate.name.trim()) {
      showError('Erro ao Salvar', 'Nome do template é obrigatório');
      return;
    }

    const templateToSave = {
      ...currentTemplate,
      updatedAt: new Date().toISOString(),
      version: currentTemplate.version + 1
    };

    if (currentTemplate.id) {
      // Atualizar template existente
      setTemplates(prev => prev.map(t => t.id === currentTemplate.id ? templateToSave : t));
      showSuccess('Template Atualizado', `Template "${currentTemplate.name}" foi atualizado com sucesso`);
    } else {
      // Criar novo template
      const newTemplateWithId = {
        ...templateToSave,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        version: 1
      };
      setTemplates(prev => [...prev, newTemplateWithId]);
      setCurrentTemplate(newTemplateWithId);
      showSuccess('Template Criado', `Template "${currentTemplate.name}" foi criado com sucesso`);
    }

    setIsEditing(false);
  }, [currentTemplate, showSuccess, showError]);

  // Criar novo template
  const createNewTemplate = useCallback(() => {
    const newTemplate: AdvancedTemplate = {
      id: '',
      name: '',
      content: '',
      variables: [],
      styles: predefinedStyles.default,
      category: 'documentos',
      tags: [],
      createdAt: '',
      updatedAt: '',
      version: 0,
      isPublic: false,
      description: ''
    };

    setCurrentTemplate(newTemplate);
    setIsEditing(true);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-6 w-6" /> Editor de Templates Avançado
          </CardTitle>
          <CardDescription>
            Crie e edite templates profissionais com variáveis, estilos e formatação avançada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Aba de Templates */}
            <TabsContent value="templates" className="space-y-4">
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
                <Button onClick={createNewTemplate}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Template
                </Button>
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border">
                <div className="p-4 space-y-4">
                  {filteredTemplates.length === 0 ? (
                    <p className="text-center text-muted-foreground">Nenhum template encontrado.</p>
                  ) : (
                    filteredTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setCurrentTemplate(template);
                                  setIsEditing(true);
                                }}
                              >
                                <Type className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Aba do Editor */}
            <TabsContent value="editor" className="space-y-4">
              {currentTemplate ? (
                <div className="space-y-4">
                  {/* Barra de Ferramentas */}
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                        <Undo className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                        <Redo className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-px h-6 bg-border mx-2" />
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => applyFormatting('bold')}>
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyFormatting('italic')}>
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyFormatting('underline')}>
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-px h-6 bg-border mx-2" />
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => applyFormatting('list')}>
                        <List className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyFormatting('ordered-list')}>
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyFormatting('quote')}>
                        <Quote className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-px h-6 bg-border mx-2" />
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => applyFormatting('code')}>
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyFormatting('link')}>
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-px h-6 bg-border mx-2" />
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => applyStyle('default')}>
                        Padrão
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyStyle('formal')}>
                        Formal
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyStyle('modern')}>
                        Moderno
                      </Button>
                    </div>
                  </div>

                  {/* Informações do Template */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Nome do Template</Label>
                      <Input
                        id="templateName"
                        value={currentTemplate.name}
                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                        placeholder="Nome do template"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateCategory">Categoria</Label>
                      <Select 
                        value={currentTemplate.category} 
                        onValueChange={(value) => setCurrentTemplate({ ...currentTemplate, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c !== 'all').map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="templateDescription">Descrição</Label>
                    <Textarea
                      id="templateDescription"
                      value={currentTemplate.description}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                      placeholder="Descrição do template"
                      rows={2}
                    />
                  </div>

                  {/* Editor de Conteúdo */}
                  <div>
                    <Label htmlFor="templateContent">Conteúdo do Template</Label>
                    <Textarea
                      ref={editorRef}
                      id="templateContent"
                      value={currentTemplate.content}
                      onChange={(e) => {
                        setCurrentTemplate({ ...currentTemplate, content: e.target.value });
                        saveToHistory(e.target.value);
                      }}
                      placeholder="Digite o conteúdo do template aqui..."
                      rows={15}
                      className="font-mono"
                    />
                  </div>

                  {/* Variáveis */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label>Variáveis do Template</Label>
                      <Button variant="outline" size="sm" onClick={addVariable}>
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Variável
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {currentTemplate.variables.map((variable) => (
                        <Card key={variable.id} className="p-4">
                          <div className="grid grid-cols-6 gap-2 items-center">
                            <Input
                              placeholder="Nome da variável"
                              value={variable.name}
                              onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                            />
                            <Select 
                              value={variable.type} 
                              onValueChange={(value: any) => updateVariable(variable.id, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                                <SelectItem value="date">Data</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="url">URL</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Placeholder"
                              value={variable.placeholder}
                              onChange={(e) => updateVariable(variable.id, { placeholder: e.target.value })}
                            />
                            <Input
                              placeholder="Valor padrão"
                              value={variable.defaultValue || ''}
                              onChange={(e) => updateVariable(variable.id, { defaultValue: e.target.value })}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={variable.required}
                                onChange={(e) => updateVariable(variable.id, { required: e.target.checked })}
                              />
                              <Label className="text-sm">Obrigatório</Label>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeVariable(variable.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={saveTemplate}>
                      <Save className="mr-2 h-4 w-4" /> Salvar Template
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Type className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Selecione um template para editar ou crie um novo</p>
                  <Button onClick={createNewTemplate} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Criar Novo Template
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Aba de Preview */}
            <TabsContent value="preview" className="space-y-4">
              {currentTemplate ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Preview do Template</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" /> Exportar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" /> Copiar
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div 
                        style={{
                          fontFamily: currentTemplate.styles.fontFamily,
                          fontSize: `${currentTemplate.styles.fontSize}px`,
                          fontWeight: currentTemplate.styles.fontWeight,
                          color: currentTemplate.styles.color,
                          backgroundColor: currentTemplate.styles.backgroundColor,
                          textAlign: currentTemplate.styles.textAlign,
                          lineHeight: currentTemplate.styles.lineHeight,
                          margin: `${currentTemplate.styles.margin}px`,
                          padding: `${currentTemplate.styles.padding}px`,
                        }}
                      >
                        <pre className="whitespace-pre-wrap">{currentTemplate.content}</pre>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview das Variáveis */}
                  {currentTemplate.variables.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Variáveis do Template</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {currentTemplate.variables.map((variable) => (
                            <div key={variable.id} className="space-y-2">
                              <Label htmlFor={`preview-${variable.id}`}>
                                {variable.name} {variable.required && <span className="text-red-500">*</span>}
                              </Label>
                              <Input
                                id={`preview-${variable.id}`}
                                type={variable.type === 'number' ? 'number' : 
                                      variable.type === 'date' ? 'date' : 
                                      variable.type === 'email' ? 'email' : 'text'}
                                placeholder={variable.placeholder}
                                defaultValue={variable.defaultValue}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Selecione um template para visualizar o preview</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
