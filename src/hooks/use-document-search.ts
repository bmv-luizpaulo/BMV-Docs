import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './use-debounce'
import { DriveDocument } from '@/lib/google-drive'
import { useSearch } from '@/store/app-store'

interface UseSearchOptions {
  debounceMs?: number
  minQueryLength?: number
  onSearch?: (query: string) => Promise<DriveDocument[]>
}

export function useDocumentSearch(options: UseSearchOptions = {}) {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    onSearch
  } = options

  const {
    searchQuery,
    searchResults,
    isSearching,
    setSearchQuery,
    setSearchResults,
    setSearching,
    clearSearch
  } = useSearch()

  const debouncedQuery = useDebounce(searchQuery, debounceMs)
  const [localResults, setLocalResults] = useState<DriveDocument[]>([])

  // Função de busca padrão se não fornecida
  const defaultSearch = useCallback(async (query: string): Promise<DriveDocument[]> => {
    try {
      const response = await fetch(`/api/documents?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('google_drive_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      return data.success ? data.documents : []
    } catch (error) {
      console.error('Erro na busca:', error)
      return []
    }
  }, [])

  // Executar busca quando query debounced mudar
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      setSearching(false)
      setLocalResults([])
      return
    }

    const performSearch = async () => {
      setSearching(true)
      try {
        const searchFunction = onSearch || defaultSearch
        const results = await searchFunction(debouncedQuery)
        setLocalResults(results)
        setSearchResults(results)
      } catch (error) {
        console.error('Erro na busca:', error)
        setLocalResults([])
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery, minQueryLength, onSearch, defaultSearch, setSearching, setSearchResults])

  // Função para buscar com filtros avançados
  const searchWithFilters = useCallback(async (
    query: string,
    filters: {
      mimeType?: string
      folderId?: string
      dateRange?: { start: Date; end: Date }
      status?: string
    } = {}
  ) => {
    if (!query || query.length < minQueryLength) return []

    setSearching(true)
    try {
      const params = new URLSearchParams({
        q: query,
        ...(filters.mimeType && { mimeType: filters.mimeType }),
        ...(filters.folderId && { folderId: filters.folderId }),
        ...(filters.status && { status: filters.status })
      })

      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('google_drive_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      const results = data.success ? data.documents : []
      
      // Aplicar filtro de data localmente se necessário
      let filteredResults = results
      if (filters.dateRange) {
        filteredResults = results.filter((doc: DriveDocument) => {
          const docDate = new Date(doc.modifiedTime)
          return docDate >= filters.dateRange!.start && docDate <= filters.dateRange!.end
        })
      }

      setLocalResults(filteredResults)
      setSearchResults(filteredResults)
      return filteredResults
    } catch (error) {
      console.error('Erro na busca com filtros:', error)
      setLocalResults([])
      setSearchResults([])
      return []
    } finally {
      setSearching(false)
    }
  }, [minQueryLength, setSearching, setSearchResults])

  // Função para buscar sugestões (autocomplete)
  const getSuggestions = useCallback(async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) return []

    try {
      // Buscar documentos que contenham a query
      const results = await defaultSearch(query)
      
      // Extrair nomes únicos que contenham a query
      const suggestions = results
        .map(doc => doc.name)
        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5) // Limitar a 5 sugestões

      return [...new Set(suggestions)] // Remover duplicatas
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
      return []
    }
  }, [defaultSearch])

  // Função para limpar busca
  const clearSearchResults = useCallback(() => {
    setLocalResults([])
    clearSearch()
  }, [clearSearch])

  // Função para buscar documentos recentes
  const getRecentDocuments = useCallback(async (limit: number = 10): Promise<DriveDocument[]> => {
    try {
      const response = await fetch(`/api/documents?recent=true&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('google_drive_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      return data.success ? data.documents : []
    } catch (error) {
      console.error('Erro ao buscar documentos recentes:', error)
      return []
    }
  }, [])

  return {
    // Estado
    searchQuery,
    searchResults: localResults,
    isSearching,
    
    // Ações
    setSearchQuery,
    searchWithFilters,
    getSuggestions,
    clearSearchResults,
    getRecentDocuments,
    
    // Utilitários
    hasResults: localResults.length > 0,
    hasQuery: searchQuery.length >= minQueryLength,
    resultCount: localResults.length
  }
}

// Hook para busca em tempo real com WebSocket (futuro)
export function useRealtimeSearch() {
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeResults, setRealtimeResults] = useState<DriveDocument[]>([])

  useEffect(() => {
    // Implementação futura para busca em tempo real
    // const ws = new WebSocket('ws://localhost:3001/search')
    // 
    // ws.onopen = () => setIsConnected(true)
    // ws.onclose = () => setIsConnected(false)
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data)
    //   setRealtimeResults(data.results)
    // }
    // 
    // return () => ws.close()
  }, [])

  return {
    isConnected,
    realtimeResults,
    setRealtimeResults
  }
}
