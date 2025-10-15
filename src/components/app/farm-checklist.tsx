"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  File,
  Home,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { allData } from "@/lib/data";
import type { Documento, DocumentoStatus, Fazenda, StatusInfo } from "@/lib/types";
import { DocumentValidatorDialog } from "./document-validator-dialog";

const statusMap: Record<DocumentoStatus, StatusInfo> = {
  Completo: { label: "Completo", color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800", icon: CheckCircle2 },
  Pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800", icon: Clock },
  Incompleto: { label: "Incompleto", color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800", icon: XCircle },
  Divergência: { label: "Divergência", color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800", icon: AlertTriangle },
};

interface FarmChecklistProps {
  farm: Fazenda;
  onBack: () => void;
}

export default function FarmChecklist({ farm, onBack }: FarmChecklistProps) {
  const nucleo = allData.nucleos.find(n => n.fazendas.some(f => f.id === farm.id));
  const nucleador = nucleo?.nucleadores.find(nuc => nuc.id === farm.nucleadorId);

  const [documents, setDocuments] = React.useState(farm.documentos);
  const [selectedDocument, setSelectedDocument] = React.useState<Documento | null>(null);

  const handleUpdateDocument = (updatedDoc: Documento) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc))
    );
  };

  const docsByCategory = documents.reduce((acc, doc) => {
    (acc[doc.category] = acc[doc.category] || []).push(doc);
    return acc;
  }, {} as Record<Documento['category'], Documento[]>);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {farm.name}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Informações da Fazenda</CardTitle>
            <CardDescription>{farm.code}</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-muted-foreground" />
                <strong>Núcleo:</strong>
                <span>{nucleo?.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <strong>Nucleador:</strong>
                <span>{nucleador?.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <strong>Produtor:</strong>
                <span>{farm.produtores[0]?.name}</span>
            </div>
        </CardContent>
      </Card>
      
      {Object.entries(docsByCategory).map(([category, docs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>Checklist de documentos da categoria {category.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Documento</TableHead>
                  <TableHead className="w-[20%]">Subcategoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc) => {
                  const statusInfo = statusMap[doc.status];
                  const Icon = statusInfo.icon;
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {doc.subcategory.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border ${statusInfo.color}`}>
                          <Icon className="mr-1 h-3 w-3" />
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(doc.lastUpdated).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          Analisar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {selectedDocument && (
        <DocumentValidatorDialog
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onUpdate={handleUpdateDocument}
        />
      )}
    </div>
  );
}
