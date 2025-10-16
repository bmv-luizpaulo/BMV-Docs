"use client"

import FavoritesManager from '@/components/favorites/favorites-manager'
import { useDocuments, useFolders } from '@/store/app-store'
import { useEffect } from 'react';

export default function FavoritesPage() {
  const { documents, setDocuments } = useDocuments();
  const { folders, setFolders } = useFolders();
  
  // Mock de dados, pois não temos API real integrada
  useEffect(() => {
    // Simular o carregamento de documentos e pastas
    const mockDocs = [
        { id: 'doc1', name: 'Contrato.pdf', mimeType: 'application/pdf', size: '1024', modifiedTime: new Date().toISOString(), webViewLink: '#' },
        { id: 'doc2', name: 'Relatorio.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: '2048', modifiedTime: new Date().toISOString(), webViewLink: '#' },
    ];
    const mockFolders = [
        { id: 'folder1', name: 'Projetos', modifiedTime: new Date().toISOString() },
        { id: 'folder2', name: 'Clientes', modifiedTime: new Date().toISOString() },
    ];
    // @ts-ignore
    setDocuments(mockDocs);
    // @ts-ignore
    setFolders(mockFolders);
  }, [setDocuments, setFolders]);

  return (
    <FavoritesManager accessToken="mock-token" documents={documents} folders={folders} />
  )
}
