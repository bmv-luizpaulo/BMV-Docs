import type { LucideIcon } from "lucide-react";

export type DocumentoStatus = "Completo" | "Pendente" | "Incompleto" | "Divergência";

export type StatusInfo = {
  label: DocumentoStatus;
  color: string; // Tailwind color class
  icon: LucideIcon;
};

export type DocumentoCategory = 
  | 'Coletivo' 
  | 'Individual' 
  | 'Adesão' 
  | 'Posse_Dominio' 
  | 'Aceite_Representacao' 
  | 'Transferencia' 
  | 'Autorizacao' 
  | 'Diversos';

export type DocumentoSubcategory = 
  // Coletivos
  | 'Elegibilidade'
  | 'Legitimacao'
  | 'Inventario'
  | 'Quantificacao'
  | 'Linha_Base'
  | 'Concepcao_Projeto'
  | 'Validacao'
  | 'Verificacao'
  | 'Certificacao'
  | 'Registro_CPR'
  | 'Custodia_SKR'
  | 'Transferencias'
  | 'Emissao_Certificado'
  | 'Monitoramento'
  | 'Reemissao_Certificado'
  // Individuais
  | 'CAR_Relatorio'
  | 'PAPA'
  | 'Documentos_Pessoais'
  | 'Documentos_Propriedade'
  | 'Financeiro'
  // Outros
  | 'TCA'
  | 'DPD'
  | 'TAR'
  | 'Transferencia_Direitos'
  | 'Autorizacoes'
  | 'Diversos';

export type Documento = {
  id: string;
  name: string;
  category: DocumentoCategory;
  subcategory: DocumentoSubcategory;
  status: DocumentoStatus;
  dueDate?: string;
  lastUpdated: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedBy?: string;
  workflowStep?: number; // Para documentos coletivos que seguem fluxo sequencial
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
