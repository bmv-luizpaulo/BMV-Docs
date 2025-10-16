import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DriveDocument, DriveFolder } from '@/lib/google-drive'

interface AppState {
  // Estado dos documentos
  documents: DriveDocument[]
  folders: DriveFolder[]
  currentFolder: string
  
  // Estado de loading
  isLoading: boolean
  isLoadingDocuments: boolean
  isLoadingFolders: boolean
  
  // Estado de erro
  error: string | null
  
  // Estado de busca
  searchQuery: string
  searchResults: DriveDocument[]
  isSearching: boolean
  
  // Estado de upload
  uploadProgress: number
  isUploading: boolean
  
  // Ações para documentos
  setDocuments: (documents: DriveDocument[]) => void
  addDocument: (document: DriveDocument) => void
  updateDocument: (id: string, updates: Partial<DriveDocument>) => void
  removeDocument: (id: string) => void
  
  // Ações para pastas
  setFolders: (folders: DriveFolder[]) => void
  addFolder: (folder: DriveFolder) => void
  updateFolder: (id: string, updates: Partial<DriveFolder>) => void
  removeFolder: (id: string) => void
  
  // Ações de navegação
  setCurrentFolder: (folderId: string) => void
  
  // Ações de loading
  setLoading: (loading: boolean) => void
  setLoadingDocuments: (loading: boolean) => void
  setLoadingFolders: (loading: boolean) => void
  
  // Ações de erro
  setError: (error: string | null) => void
  clearError: () => void
  
  // Ações de busca
  setSearchQuery: (query: string) => void
  setSearchResults: (results: DriveDocument[]) => void
  setSearching: (searching: boolean) => void
  clearSearch: () => void
  
  // Ações de upload
  setUploadProgress: (progress: number) => void
  setUploading: (uploading: boolean) => void
  
  // Ações de cache
  invalidateCache: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      documents: [],
      folders: [],
      currentFolder: 'root',
      isLoading: false,
      isLoadingDocuments: false,
      isLoadingFolders: false,
      error: null,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      uploadProgress: 0,
      isUploading: false,

      // Ações para documentos
      setDocuments: (documents) => set({ documents }),
      
      addDocument: (document) => set((state) => ({
        documents: [...state.documents, document]
      })),
      
      updateDocument: (id, updates) => set((state) => ({
        documents: state.documents.map(doc =>
          doc.id === id ? { ...doc, ...updates } : doc
        )
      })),
      
      removeDocument: (id) => set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id)
      })),

      // Ações para pastas
      setFolders: (folders) => set({ folders }),
      
      addFolder: (folder) => set((state) => ({
        folders: [...state.folders, folder]
      })),
      
      updateFolder: (id, updates) => set((state) => ({
        folders: state.folders.map(folder =>
          folder.id === id ? { ...folder, ...updates } : folder
        )
      })),
      
      removeFolder: (id) => set((state) => ({
        folders: state.folders.filter(folder => folder.id !== id)
      })),

      // Ações de navegação
      setCurrentFolder: (folderId) => set({ currentFolder: folderId }),

      // Ações de loading
      setLoading: (loading) => set({ isLoading: loading }),
      setLoadingDocuments: (loading) => set({ isLoadingDocuments: loading }),
      setLoadingFolders: (loading) => set({ isLoadingFolders: loading }),

      // Ações de erro
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Ações de busca
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSearching: (searching) => set({ isSearching: searching }),
      clearSearch: () => set({ 
        searchQuery: '', 
        searchResults: [], 
        isSearching: false 
      }),

      // Ações de upload
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      setUploading: (uploading) => set({ isUploading: uploading }),

      // Ações de cache
      invalidateCache: () => set({
        documents: [],
        folders: [],
        searchResults: []
      })
    }),
    {
      name: 'bmv-docs-store',
      partialize: (state) => ({
        // Persistir apenas dados essenciais
        currentFolder: state.currentFolder,
        searchQuery: state.searchQuery
      })
    }
  )
)

// Hooks específicos para diferentes partes da aplicação
export const useDocuments = () => {
  const documents = useAppStore(state => state.documents)
  const isLoading = useAppStore(state => state.isLoadingDocuments)
  const error = useAppStore(state => state.error)
  const setDocuments = useAppStore(state => state.setDocuments)
  const addDocument = useAppStore(state => state.addDocument)
  const updateDocument = useAppStore(state => state.updateDocument)
  const removeDocument = useAppStore(state => state.removeDocument)
  const setLoading = useAppStore(state => state.setLoadingDocuments)
  const setError = useAppStore(state => state.setError)

  return {
    documents,
    isLoading,
    error,
    setDocuments,
    addDocument,
    updateDocument,
    removeDocument,
    setLoading,
    setError
  }
}

export const useFolders = () => {
  const folders = useAppStore(state => state.folders)
  const isLoading = useAppStore(state => state.isLoadingFolders)
  const error = useAppStore(state => state.error)
  const setFolders = useAppStore(state => state.setFolders)
  const addFolder = useAppStore(state => state.addFolder)
  const updateFolder = useAppStore(state => state.updateFolder)
  const removeFolder = useAppStore(state => state.removeFolder)
  const setLoading = useAppStore(state => state.setLoadingFolders)
  const setError = useAppStore(state => state.setError)

  return {
    folders,
    isLoading,
    error,
    setFolders,
    addFolder,
    updateFolder,
    removeFolder,
    setLoading,
    setError
  }
}

export const useSearch = () => {
  const searchQuery = useAppStore(state => state.searchQuery)
  const searchResults = useAppStore(state => state.searchResults)
  const isSearching = useAppStore(state => state.isSearching)
  const setSearchQuery = useAppStore(state => state.setSearchQuery)
  const setSearchResults = useAppStore(state => state.setSearchResults)
  const setSearching = useAppStore(state => state.setSearching)
  const clearSearch = useAppStore(state => state.clearSearch)

  return {
    searchQuery,
    searchResults,
    isSearching,
    setSearchQuery,
    setSearchResults,
    setSearching,
    clearSearch
  }
}

export const useNavigation = () => {
  const currentFolder = useAppStore(state => state.currentFolder)
  const setCurrentFolder = useAppStore(state => state.setCurrentFolder)

  return {
    currentFolder,
    setCurrentFolder
  }
}

export const useUpload = () => {
  const uploadProgress = useAppStore(state => state.uploadProgress)
  const isUploading = useAppStore(state => state.isUploading)
  const setUploadProgress = useAppStore(state => state.setUploadProgress)
  const setUploading = useAppStore(state => state.setUploading)

  return {
    uploadProgress,
    isUploading,
    setUploadProgress,
    setUploading
  }
}
