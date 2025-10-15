import type { Nucleo, DocumentoStatus, Documento, Fazenda, DocumentoCategory, DocumentoSubcategory } from "./types";

// Estrutura real baseada na análise dos documentos BMV
const documentCategories: Record<DocumentoCategory, DocumentoSubcategory[]> = {
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

const documentNames: Record<DocumentoSubcategory, string[]> = {
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

const statuses: DocumentoStatus[] = ["Completo", "Pendente", "Incompleto", "Divergência"];

const getRandomStatus = (): DocumentoStatus => statuses[Math.floor(Math.random() * statuses.length)];
const getRandomDate = () => {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

const createDocuments = (farmId: string): Documento[] => {
    let docId = 1;
    const docs: Documento[] = [];

    // Criar documentos baseados na estrutura real
    Object.entries(documentCategories).forEach(([category, subcategories]) => {
        subcategories.forEach(subcategory => {
            const names = documentNames[subcategory];
            names.forEach(name => {
                docs.push({
                    id: `doc-${farmId}-${docId++}`,
                    name,
                    category: category as DocumentoCategory,
                    subcategory: subcategory as DocumentoSubcategory,
                    status: getRandomStatus(),
                    lastUpdated: getRandomDate(),
                    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
                    fileName: `${name.replace(/\s+/g, '_')}.pdf`,
                    fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB a 5MB
                    uploadedBy: 'Sistema BMV',
                    workflowStep: category === 'Coletivo' ? Math.floor(Math.random() * 15) + 1 : undefined
                });
            });
        });
    });

    return docs;
};

// Produtores reais baseados na análise dos documentos
const produtoresReais = {
  'n1': [ // Núcleo Xingu
    'Breno Miranda de Freitas',
    'Carlos Alberto Guimarães', 
    'Daniela e Danilo',
    'Silvio Xavier de Souza'
  ],
  'n2': [ // Núcleo Teles Pires
    'Acacio Massaro Yoshida',
    'Antonio Fischer',
    'Bedin Ind de Madeiras Ltda',
    'Carrenho Administradora de Bens'
  ],
  'n3': [ // Núcleo Madeira
    'Produtor Madeira A',
    'Produtor Madeira B',
    'Produtor Madeira C'
  ],
  'n4': [ // Núcleo Arinos
    'Produtor Arinos A',
    'Produtor Arinos B',
    'Produtor Arinos C',
    'Produtor Arinos D',
    'Produtor Arinos E',
    'Produtor Arinos F'
  ]
};

const createFarms = (nucleoId: string, count: number): Fazenda[] => {
    const farms: Fazenda[] = [];
    const produtoresNucleo = produtoresReais[nucleoId as keyof typeof produtoresReais] || [];
    
    for (let i = 1; i <= count; i++) {
        const farmId = `${nucleoId}-faz-${i}`;
        const produtorNome = produtoresNucleo[i - 1] || `Produtor ${nucleoId.toUpperCase()} ${i}`;
        
        farms.push({
            id: farmId,
            name: `Fazenda ${produtorNome}`,
            code: `FZ-${nucleoId.toUpperCase()}-${String(i).padStart(3, '0')}`,
            nucleadorId: `${nucleoId}-nuc-1`,
            produtores: [{ 
                id: `${farmId}-prod-1`, 
                name: produtorNome 
            }],
            documentos: createDocuments(farmId),
        });
    }
    return farms;
};

const nucleosData: Nucleo[] = [
    {
        id: "n1",
        name: "Xingu",
        code: "01-NUCLEO_XINGU",
        nucleadores: [{id: "n1-nuc-1", name: "Nucleador Xingu A"}],
        fazendas: createFarms("n1", 5),
    },
    {
        id: "n2",
        name: "Teles Pires",
        code: "02-NUCLEO_TELES_PIRES",
        nucleadores: [{id: "n2-nuc-1", name: "Nucleador Teles Pires A"}],
        fazendas: createFarms("n2", 8),
    },
    {
        id: "n3",
        name: "Madeira",
        code: "03-NUCLEO_MADEIRA",
        nucleadores: [{id: "n3-nuc-1", name: "Nucleador Madeira A"}],
        fazendas: createFarms("n3", 3),
    },
    {
        id: "n4",
        name: "Arinos",
        code: "04-NUCLEO_ARINOS",
        nucleadores: [{id: "n4-nuc-1", name: "Nucleador Arinos A"}],
        fazendas: createFarms("n4", 6),
    },
];

export const allData = {
    nucleos: nucleosData,
};
