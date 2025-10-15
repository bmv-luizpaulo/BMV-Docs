import type { Nucleo, DocumentoStatus, Documento, Fazenda } from "./types";

const documentTypes = {
  imovel: ["Matrícula do Imóvel", "CAR", "CCIR", "Memorial de Georreferenciamento"],
  pf: ["RG", "CPF", "Comprovante de Endereço", "Certidão de Casamento"],
  pj: ["Cartão CNPJ", "Ato Constitutivo", "Documentos do Representante Legal"],
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

    documentTypes.imovel.forEach(name => {
        docs.push({ 
            id: `doc-${farmId}-${docId++}`, 
            name, 
            type: 'Imóvel', 
            status: getRandomStatus(), 
            lastUpdated: getRandomDate(),
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        });
    });

    documentTypes.pf.forEach(name => {
        docs.push({ 
            id: `doc-${farmId}-${docId++}`, 
            name, 
            type: 'Pessoa Física', 
            status: getRandomStatus(),
            lastUpdated: getRandomDate(),
        });
    });

    if (Math.random() > 0.5) { // 50% chance of being a PJ
        documentTypes.pj.forEach(name => {
            docs.push({ 
                id: `doc-${farmId}-${docId++}`, 
                name, 
                type: 'Pessoa Jurídica', 
                status: getRandomStatus(),
                lastUpdated: getRandomDate(),
            });
        });
    }

    return docs;
};

const createFarms = (nucleoId: string, count: number): Fazenda[] => {
    const farms: Fazenda[] = [];
    for (let i = 1; i <= count; i++) {
        const farmId = `${nucleoId}-faz-${i}`;
        farms.push({
            id: farmId,
            name: `Fazenda ${String.fromCharCode(64 + i)}`,
            code: `FZ-${nucleoId.toUpperCase()}-${String(i).padStart(3, '0')}`,
            nucleadorId: `${nucleoId}-nuc-1`,
            produtores: [{ id: `${farmId}-prod-1`, name: `Produtor ${i}` }],
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
