import type { DocumentoCategory, DocumentoSubcategory } from "./types";

// Estrutura real baseada na análise dos documentos BMV
export const documentCategories: Record<DocumentoCategory, DocumentoSubcategory[]> = {
  'Coletivo': [
    'Elegibilidade', 'Legitimacao', 'Inventario', 'Quantificacao', 
    'Linha_Base', 'Concepcao_Projeto', 'Validacao', 'Verificacao', 
    'Certificacao', 'Registro_CPR', 'Custodia_SKR', 'Transferencias',
    'Emissao_Certificado', 'Monitoramento', 'Reemissao_Certificado'
  ],
  'Individual': ['CAR_Relatorio', 'PAPA', 'Documentos_Pessoais', 'Documentos_Propriedade', 'Financeiro'],
  'Adesão': ['TCA'],
  'Posse_Dominio': ['DPD'],
  'Aceite_Representacao': ['TAR'],
  'Transferencia': ['Transferencia_Direitos'],
  'Autorizacao': ['Autorizacoes'],
  'Diversos': ['Diversos']
};

export const documentNames: Record<DocumentoSubcategory, string[]> = {
  // Coletivos
  'Elegibilidade': [
    'Livro de registro da abertura do projeto',
    'Oficio de Solicitação Audiência Pública',
    'Ata da Audiência Pública',
    'Lei de Reconhecimento do Programa',
    'Declaração de Reconhecimento de Programa de Desenvolvimento Sustentável'
  ],
  'Legitimacao': [
    'Estatuto da Associação',
    'CNPJ da Associação',
    'Documentos do Presidente',
    'Documentos da Diretoria',
    'Atas da Associação',
    'Contratos e Termos'
  ],
  'Inventario': [
    'Relatório de Inventário Florestal',
    'Relatório de Análise de Solo',
    'Relatório de Inventário Florestal 10%'
  ],
  'Quantificacao': [
    'Relatório de Quantificação de Estoques'
  ],
  'Linha_Base': ['Documentos de Linha de Base'],
  'Concepcao_Projeto': ['Documentos de Concepção do Projeto'],
  'Validacao': ['Relatórios de Validação IDESA', 'Relatórios de Validação UNESP'],
  'Verificacao': ['Relatórios de Verificação TUV Rheinland'],
  'Certificacao': ['Certificados', 'Selos'],
  'Registro_CPR': ['Cédula de Produto Rural', 'Registro de CPR'],
  'Custodia_SKR': ['Custódias UCS'],
  'Transferencias': ['Documentos de Transferência'],
  'Emissao_Certificado': ['Certificados de Títulos'],
  'Monitoramento': ['Relatórios de Monitoramento'],
  'Reemissao_Certificado': ['Reemissão de Certificados'],
  
  // Individuais
  'CAR_Relatorio': ['CAR - Relatório de Áreas'],
  'PAPA': ['Documentos PAPA'],
  'Documentos_Pessoais': ['RG', 'CPF', 'Comprovante de Endereço', 'Certidão de Casamento'],
  'Documentos_Propriedade': ['Matrícula do Imóvel', 'CCIR', 'Memorial de Georreferenciamento'],
  'Financeiro': ['Comprovantes Financeiros', 'Relatórios de Vendas'],
  
  // Outros
  'TCA': ['Termos e Condições de Adesão ao Programa BMV'],
  'DPD': ['Declaração de Posse e Domínio'],
  'TAR': ['Termo de Aceite e Representação'],
  'Transferencia_Direitos': ['Transferência de Direitos Creditórios'],
  'Autorizacoes': ['Autorizações BMV'],
  'Diversos': ['Documentos Diversos', 'Comunicados', 'Protocolos']
};
