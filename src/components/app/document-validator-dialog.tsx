"use client";

import * as React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Documento, DocumentoStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { validateDocument } from "@/app/actions";
import { Loader2, UploadCloud, CheckCircle, XCircle } from "lucide-react";
import type { AIDocumentValidationOutput } from "@/ai/flows/ai-document-validation";

interface DocumentValidatorDialogProps {
  document: Documento;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (document: Documento) => void;
}

export function DocumentValidatorDialog({
  document,
  isOpen,
  onClose,
  onUpdate,
}: DocumentValidatorDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<DocumentoStatus>(document.status);
  const [notes, setNotes] = React.useState(document.notes || "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<AIDocumentValidationOutput | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setStatus(document.status);
    setNotes(document.notes || "");
    setFile(null);
    setFileDataUri(null);
    setAiResult(null);
  }, [document]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
    setIsLoading(true);
    setAiResult(null);
    try {
      const result = await validateDocument({ documentDataUri: fileDataUri });
      setAiResult(result);
      toast({
        title: "Análise de IA concluída",
        description: "Verifique os resultados abaixo.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const updatedDocument: Documento = {
      ...document,
      status,
      notes,
      lastUpdated: new Date().toISOString(),
    };
    onUpdate(updatedDocument);
    toast({
      title: "Documento atualizado!",
      description: `O status de "${document.name}" foi alterado para ${status}.`,
    });
    onClose();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Analisar Documento: {document.name}</DialogTitle>
          <DialogDescription>
            Faça o upload do documento para análise da IA e atualize seu status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Upload do Documento</Label>
            <div
              className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                {file ? (
                  <p className="font-semibold text-primary">{file.name}</p>
                ) : (
                  <>
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 10MB)</p>
                  </>
                )}
              </div>
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="application/pdf,image/png,image/jpeg"
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading || !file}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Analisar com IA"
              )}
            </Button>
          </div>

          {aiResult && (
            <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                <h3 className="font-semibold">Resultados da Análise de IA</h3>
                <div className="flex space-x-4">
                    <Badge variant={aiResult.isConsistent ? 'default' : 'destructive'}>
                        {aiResult.isConsistent ? <CheckCircle className="h-4 w-4 mr-1"/> : <XCircle className="h-4 w-4 mr-1"/>}
                        Consistente
                    </Badge>
                    <Badge variant={aiResult.isReadable ? 'default' : 'destructive'}>
                        {aiResult.isReadable ? <CheckCircle className="h-4 w-4 mr-1"/> : <XCircle className="h-4 w-4 mr-1"/>}
                        Legível
                    </Badge>
                    <Badge variant={aiResult.isComplete ? 'default' : 'destructive'}>
                        {aiResult.isComplete ? <CheckCircle className="h-4 w-4 mr-1"/> : <XCircle className="h-4 w-4 mr-1"/>}
                        Completo
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{aiResult.validationDetails}</p>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={(v: DocumentoStatus) => setStatus(v)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completo">Completo</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Incompleto">Incompleto</SelectItem>
                <SelectItem value="Divergência">Divergência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Adicione observações sobre o documento..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
