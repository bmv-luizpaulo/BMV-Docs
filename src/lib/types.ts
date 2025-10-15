import type { LucideIcon } from "lucide-react";

export type DocumentoStatus = "Completo" | "Pendente" | "Incompleto" | "Divergência";

export type StatusInfo = {
  label: DocumentoStatus;
  color: string; // Tailwind color class
  icon: LucideIcon;
};

export type Documento = {
  id: string;
  name: string;
  type: 'Imóvel' | 'Pessoa Física' | 'Pessoa Jurídica' | 'Procuração';
  status: DocumentoStatus;
  dueDate?: string;
  lastUpdated: string;
  notes?: string;
  fileUrl?: string;
};

export type Produtor = {
  id: string;
  name:string;
};

export type Nucleador = {
    id: string;
    name: string;
};

export type Fazenda = {
  id: string;
  name: string;
  code: string;
  nucleadorId: string;
  produtores: Produtor[];
  documentos: Documento[];
};

export type Nucleo = {
  id: string;
  name: string;
  code: string;
  nucleadores: Nucleador[];
  fazendas: Fazenda[];
};

export type AppData = {
  nucleos: Nucleo[];
};
