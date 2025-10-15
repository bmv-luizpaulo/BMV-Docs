import type { Nucleo, DocumentoStatus, Documento, Fazenda, DocumentoCategory, DocumentoSubcategory } from "./types";
import { documentCategories, documentNames } from "./document-structure";

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
                const currentDocId = docId++;
                const docIdentifier = `doc-${farmId}-${currentDocId}`;
                
                // Deterministic file size based on document ID
                const fileSize = 100000 + (parseInt(farmId.replace(/\D/g, ''), 10) + currentDocId) * 1000 % 4900000;
                
                // Deterministic workflow step
                const workflowStep = category === 'Coletivo' ? (currentDocId % 15) + 1 : undefined;

                docs.push({
                    id: docIdentifier,
                    name,
                    category: category as DocumentoCategory,
                    subcategory: subcategory as DocumentoSubcategory,
                    status: "Pendente",
                    lastUpdated: "2024-01-01", // Using a fixed date to avoid hydration issues
                    dueDate: new Date(new Date("2024-01-01").setMonth(new Date("2024-01-01").getMonth() + 6)).toISOString().split('T')[0],
                    fileName: `${name.replace(/\s+/g, '_')}.pdf`,
                    fileSize: fileSize,
                    uploadedBy: 'Sistema BMV',
                    workflowStep: workflowStep
                });
            });
        });
    });

    // For demonstration, let's set some varied statuses after creation to avoid hydration errors but still show variety.
    // This is done in a way that is consistent between server and client.
    // A simple way is to do it based on a non-random value like the docId.
    const deterministicStatuses: DocumentoStatus[] = ["Completo", "Pendente", "Incompleto", "Divergência"];
    docs.forEach((doc, index) => {
        // A simple deterministic way to assign statuses
        const statusIndex = (parseInt(doc.id.split('-').pop() || '0', 10)) % deterministicStatuses.length;
        doc.status = deterministicStatuses[statusIndex];
        
        // Deterministic date
        const baseDate = new Date(2023, 0, 1);
        const dayOffset = (parseInt(doc.id.replace(/\D/g, '').slice(-4),10)) % 365;
        baseDate.setDate(baseDate.getDate() + dayOffset);
        doc.lastUpdated = baseDate.toISOString().split('T')[0];
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
  ],
  'n5': [ // Núcleo Juruena
    'Agropecuária Juruena',
    'Fazenda Rio Claro',
    'Grupo Scheffer'
  ],
  'n6': [ // Núcleo Tapajós
    'Cooperativa Tapajós',
    'Fazenda Santa Luzia',
    'Agro Tapajós'
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
        fazendas: createFarms("n1", 4),
    },
    {
        id: "n2",
        name: "Teles Pires",
        code: "02-NUCLEO_TELES_PIRES",
        nucleadores: [{id: "n2-nuc-1", name: "Nucleador Teles Pires A"}],
        fazendas: createFarms("n2", 4),
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
    {
        id: "n5",
        name: "Juruena",
        code: "05-NUCLEO_JURUENA",
        nucleadores: [{id: "n5-nuc-1", name: "Nucleador Juruena A"}],
        fazendas: createFarms("n5", 3),
    },
    {
        id: "n6",
        name: "Tapajós",
        code: "06-NUCLEO_TAPAJOS",
        nucleadores: [{id: "n6-nuc-1", name: "Nucleador Tapajós A"}],
        fazendas: createFarms("n6", 3),
    },
];

export const allData = {
    nucleos: nucleosData,
};
