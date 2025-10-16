"use client"

import DocumentManager from '@/components/documents/document-manager'

export default function DocumentsPage() {
  // Mock accessToken, em um app real, viria do contexto de autenticação
  const accessToken = 'mock-token';

  return (
    <DocumentManager accessToken={accessToken} />
  )
}
