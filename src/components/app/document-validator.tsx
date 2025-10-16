"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { validateDocument } from "@/app/actions";
import { Loader2, UploadCloud, CheckCircle, XCircle, File as FileIcon, Trash2, Sparkles, Tag, Save, Folder, RefreshCw } from "lucide-react";
import type { AIDocumentValidationOutput } from "@/ai/flows/ai-document-validation";
import { useSystemNotifications } from "@/hooks/use-notifications";
import { apiCache } from "@/lib/api-cache";
import { documentCategories } from "@/lib/document-structure";


// Mapeamento simplificado de subcategorias para nomes de pastas (deve ser mais robusto em produção)
const categoryToFolderIdMap: Record<string, string> = {
  // Coletivo
  'Elegibilidade': '1-Elegibilidade',
  'Legitimacao': '2-Legitimacao',
  'Inventario': '3-Inventario',
  'Quantificacao': '4-Quantificacao',
  'Linha_Base': '5-Linha_Base',
  'Concepcao_Projeto': '6-Concepcao_Projeto',
  'Validacao': '7-Validacao',
  'Verificacao': '8-Verificacao',
  'Certificacao': '9-Certificacao',
  'Registro_CPR': '10-Registro_CPR',
  'Custodia_SKR': '11-Custodia_SKR',
  'Transferencias': '12-Transferencias',
  'Emissao_Certificado': '13-Emissao_Certificado',
  'Monitoramento': '14-Monitoramento',
  'Reemissao_Certificado': '15-Reemissao_Certificado',
  // Individual
  'CAR_Relatorio': 'CAR',
  'PAPA': 'PAPA',
  'Documentos_Pessoais': 'Documentos Pessoais',
  'Documentos_Propriedade': 'Documentos da Propriedade',
  'Financeiro': 'Financeiro',
  // Outros
  'TCA': 'TCA',
  'DPD': 'DPD',
  'TAR': 'TAR',
  'Transferencia_Direitos': 'Transferencia de Direitos',
  'Autorizacoes': 'Autorizacoes',
  'Diversos': 'Diversos'
};


interface DocumentValidatorProps {
  accessToken: string;
}

export default function DocumentValidator({ accessToken }: DocumentValidatorProps) {
  const { toast } = useToast();
  const { showSuccess, showError } = useSystemNotifications();
  const [file, setFile] = React.useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<AIDocumentValidationOutput | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetState = React.useCallback(() => {
    setFile(null);
    setFileDataUri(null);
    setAiResult(null);
    setIsAnalyzing(false);
    setIsSaving(false);
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
    if (!file || !aiResult?.suggestedCategory) {
      showError("Erro", "Análise de IA necessária para determinar a pasta de destino.");
      return;
    }

    setIsSaving(true);
    
    // Simulação de busca de ID da pasta
    // Em um app real, você teria uma lógica para mapear `suggestedCategory` para um folderId
    const targetFolderId = categoryToFolderIdMap[aiResult.suggestedCategory] || 'root'; // fallback para a raiz
    
    console.log(`Tentando salvar na pasta: ${aiResult.suggestedCategory} (ID: ${targetFolderId})`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', targetFolderId);
      formData.append('description', `Tags sugeridas: ${aiResult.suggestedTags.join(', ')}`);

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
        showSuccess("Documento Salvo!", `"${file.name}" foi salvo com sucesso na pasta "${aiResult.suggestedCategory}".`);
        apiCache.invalidateDocuments(targetFolderId);
        resetState();
      } else {
        throw new Error(data.error || "Falha no upload para o Google Drive.");
      }

    } catch (err: any) {
      console.error('Erro ao salvar no Drive:', err);
      showError("Erro ao Salvar", err.message || "Não foi possível salvar o documento no Google Drive.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      resetState(); // Reset previous state
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
                  <Button variant="ghost" size="icon" onClick={resetState} aria-label="Remover arquivo">
                      <RefreshCw className="w-4 h-4 text-primary" />
                  </Button>
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
                
                {aiResult.suggestedCategory && (
                  <div className="space-y-2">
                      <h4 className="font-medium text-sm">Categoria Sugerida:</h4>
                      <Badge variant="outline" className="text-base py-1 px-3">
                        <Folder className="h-4 w-4 mr-2"/>
                        {aiResult.suggestedCategory.replace(/_/g, ' ')}
                      </Badge>
                  </div>
                )}
                
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
                  Salvar na Pasta Sugerida
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
                O documento será salvo na pasta correspondente à categoria sugerida pela IA.
            </p>
        </div>

      </CardContent>
    </Card>
  );
}
