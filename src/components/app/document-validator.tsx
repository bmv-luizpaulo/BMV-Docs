"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { validateDocument } from "@/app/actions";
import { Loader2, UploadCloud, CheckCircle, XCircle, File as FileIcon, RefreshCw, Sparkles, Tag, Save, Folder, Edit, Eye, Search } from "lucide-react";
import type { AIDocumentValidationOutput } from "@/ai/flows/ai-document-validation";
import { apiCache } from "@/lib/api-cache";
import { documentCategories } from "@/lib/document-structure";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useFolders } from "@/store/app-store";


const allCategories = Object.values(documentCategories).flat();


interface DocumentValidatorProps {
  accessToken: string;
}

export default function DocumentValidator({ accessToken }: DocumentValidatorProps) {
  const { toast } = useToast();
  const { folders } = useFolders();
  const [file, setFile] = React.useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<AIDocumentValidationOutput | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = React.useState(false);
  const [selectedFolder, setSelectedFolder] = React.useState<string>('');
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (aiResult?.suggestedCategory) {
      setSelectedFolder(aiResult.suggestedCategory);
    }
  }, [aiResult]);

  const resetState = React.useCallback(() => {
    setFile(null);
    setFileDataUri(null);
    setAiResult(null);
    setIsAnalyzing(false);
    setIsSaving(false);
    setSelectedFolder('');
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      resetState(); // Reset previous state
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFileDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleAnalyze = async () => {
    if (!fileDataUri) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para análise.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const result = await validateDocument({ documentDataUri: fileDataUri });
      setAiResult(result);
      toast({
        title: "Análise de IA concluída",
        description: "A IA analisou o documento e forneceu algumas sugestões.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!file || !selectedFolder) {
      toast({ variant: 'destructive', title: "Erro", description: "Categoria de destino necessária para salvar." });
      return;
    }

    setIsSaving(true);
    
    // Find the folder ID from the global state based on the selected folder name
    const targetFolder = folders.find(f => f.name === selectedFolder.replace(/_/g, ' '));
    const targetFolderId = targetFolder ? targetFolder.id : 'root';
    
    console.log(`Tentando salvar na pasta: ${selectedFolder} (ID: ${targetFolderId})`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', targetFolderId);
      if (aiResult?.suggestedTags) {
        formData.append('description', `Tags sugeridas: ${aiResult.suggestedTags.join(', ')}`);
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: "Documento Salvo!", description: `"${file.name}" foi salvo com sucesso na pasta "${selectedFolder}".` });
        apiCache.invalidateDocuments(targetFolderId);
        resetState();
      } else {
        throw new Error(data.error || "Falha no upload para o Google Drive.");
      }

    } catch (err: any) {
      console.error('Erro ao salvar no Drive:', err);
      toast({ variant: 'destructive', title: "Erro ao Salvar", description: err.message || "Não foi possível salvar o documento no Google Drive." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      resetState();
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFileDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Analisador e Organizador de Documentos
          </CardTitle>
          <CardDescription>
            Faça o upload de um documento, analise com IA e salve-o na pasta correta do Google Drive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Etapa 1: Upload */}
          <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Etapa 1: Fazer Upload do Documento</h3>
              {!file && (
                  <div
                  className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-1 text-base text-muted-foreground">
                      <span className="font-semibold text-primary">Clique para enviar</span> ou arraste e solte
                    </p>
                    <p className="text-sm text-muted-foreground">PDF, PNG, JPG, DOCX (MAX. 10MB)</p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="application/pdf,image/png,image/jpeg,.doc,.docx"
                  />
                </div>
              )}

              {file && (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-3 text-sm font-medium text-green-800 dark:text-green-300">
                        <FileIcon className="w-5 h-5" />
                        <div>
                          <p>{file.name}</p>
                          <p className="text-xs font-normal">({(file.size / 1024).toFixed(2)} KB)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} aria-label="Visualizar arquivo">
                            <Eye className="w-4 h-4 mr-1"/>
                            Visualizar
                        </Button>
                        <Button variant="ghost" size="icon" onClick={resetState} aria-label="Remover arquivo">
                            <RefreshCw className="w-4 h-4 text-primary" />
                        </Button>
                    </div>
                </div>
              )}
          </div>

          {/* Etapa 2: Análise */}
          <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Etapa 2: Análise com Inteligência Artificial</h3>
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !fileDataUri}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analisar Documento
                  </>
                )}
              </Button>

              {isAnalyzing && <div className="text-center text-muted-foreground">A IA está processando o documento...</div>}

              {aiResult && (
              <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                  <h3 className="font-semibold text-lg">Resultados da Análise</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">Validação:</span>
                      <Badge variant={aiResult.isConsistent ? 'default' : 'destructive'}>
                          {aiResult.isConsistent ? <CheckCircle className="h-3 w-3 mr-1"/> : <XCircle className="h-3 w-3 mr-1"/>}
                          Consistente
                      </Badge>
                      <Badge variant={aiResult.isReadable ? 'default' : 'destructive'}>
                          {aiResult.isReadable ? <CheckCircle className="h-3 w-3 mr-1"/> : <XCircle className="h-3 w-3 mr-1"/>}
                          Legível
                      </Badge>
                      <Badge variant={aiResult.isComplete ? 'default' : 'destructive'}>
                          {aiResult.isComplete ? <CheckCircle className="h-3 w-3 mr-1"/> : <XCircle className="h-3 w-3 mr-1"/>}
                          Completo
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{aiResult.validationDetails}"</p>
                  </div>
                  
                  <hr/>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Organização Sugerida:</h4>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-base py-1 px-3">
                        <Folder className="h-4 w-4 mr-2"/>
                        {selectedFolder.replace(/_/g, ' ')}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => setIsFolderModalOpen(true)}>
                        <Edit className="h-3 w-3 mr-1"/> Alterar
                      </Button>
                    </div>
                  </div>
                  
                  {aiResult.suggestedTags && aiResult.suggestedTags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tags Sugeridas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.suggestedTags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            <Tag className="h-3 w-3 mr-1"/>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Etapa 3: Salvar */}
          <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Etapa 3: Salvar no Google Drive</h3>
              <Button onClick={handleSaveToDrive} disabled={isSaving || !aiResult || !file}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar na Pasta Selecionada
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                  O documento será salvo na pasta <span className="font-semibold">{selectedFolder.replace(/_/g, ' ')}</span>.
              </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{file?.name}</DialogTitle>
            <DialogDescription>
              Visualização do documento.
            </DialogDescription>
          </DialogHeader>
          <div className="h-full w-full flex-grow mt-4">
            {fileDataUri && (
                <iframe src={fileDataUri} width="100%" height="100%" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Folder Modal */}
      <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Pasta de Destino</DialogTitle>
            <DialogDescription>
              Selecione uma nova pasta para salvar o documento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pasta" />
                </SelectTrigger>
                <SelectContent>
                    <ScrollArea className="h-72">
                        {allCategories.map(category => (
                            <SelectItem key={category} value={category}>
                                {category.replace(/_/g, ' ')}
                            </SelectItem>
                        ))}
                    </ScrollArea>
                </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => setIsFolderModalOpen(false)}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
