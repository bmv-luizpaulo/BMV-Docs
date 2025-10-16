interface CacheItem<T> {
  value: T
  timestamp: number
  ttl: number
}

class APICache {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutos

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Gerar chave de cache baseada nos parâmetros
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    return `${prefix}:${sortedParams}`
  }

  // Cache específico para documentos
  getDocuments(folderId: string): any[] | null {
    return this.get(`documents:${folderId}`)
  }

  setDocuments(folderId: string, documents: any[], ttl?: number): void {
    this.set(`documents:${folderId}`, documents, ttl)
  }

  // Cache específico para pastas
  getFolders(parentId: string): any[] | null {
    return this.get(`folders:${parentId}`)
  }

  setFolders(parentId: string, folders: any[], ttl?: number): void {
    this.set(`folders:${parentId}`, folders, ttl)
  }

  // Invalidar cache relacionado a documentos
  invalidateDocuments(folderId?: string): void {
    if (folderId) {
      this.delete(`documents:${folderId}`)
    } else {
      // Invalidar todos os caches de documentos
      for (const key of this.cache.keys()) {
        if (key.startsWith('documents:')) {
          this.cache.delete(key)
        }
      }
    }
  }

  // Invalidar cache relacionado a pastas
  invalidateFolders(parentId?: string): void {
    if (parentId) {
      this.delete(`folders:${parentId}`)
    } else {
      // Invalidar todos os caches de pastas
      for (const key of this.cache.keys()) {
        if (key.startsWith('folders:')) {
          this.cache.delete(key)
        }
      }
    }
  }

  // Estatísticas do cache
  getStats(): {
    size: number
    keys: string[]
    memoryUsage: number
  } {
    const keys = Array.from(this.cache.keys())
    const memoryUsage = JSON.stringify(Array.from(this.cache.values())).length
    
    return {
      size: this.cache.size,
      keys,
      memoryUsage
    }
  }
}

// Instância global do cache
export const apiCache = new APICache()

// Hook para usar o cache em componentes React
export function useAPICache() {
  return {
    get: apiCache.get.bind(apiCache),
    set: apiCache.set.bind(apiCache),
    has: apiCache.has.bind(apiCache),
    delete: apiCache.delete.bind(apiCache),
    clear: apiCache.clear.bind(apiCache),
    getDocuments: apiCache.getDocuments.bind(apiCache),
    setDocuments: apiCache.setDocuments.bind(apiCache),
    getFolders: apiCache.getFolders.bind(apiCache),
    setFolders: apiCache.setFolders.bind(apiCache),
    invalidateDocuments: apiCache.invalidateDocuments.bind(apiCache),
    invalidateFolders: apiCache.invalidateFolders.bind(apiCache),
    getStats: apiCache.getStats.bind(apiCache)
  }
}

// Utilitário para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
