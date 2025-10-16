import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Skeleton para lista de documentos
export function DocumentListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Skeleton para tabela de documentos
export function DocumentTableSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  )
}

// Skeleton para dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <DocumentTableSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}

// Skeleton para pastas
export function FolderListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Loading spinner centralizado
export function CenteredLoader({ 
  message = "Carregando...", 
  size = "default" 
}: { 
  message?: string
  size?: "sm" | "default" | "lg" 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// Loading overlay
export function LoadingOverlay({ 
  isVisible, 
  message = "Processando..." 
}: { 
  isVisible: boolean
  message?: string 
}) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// Progress bar
export function ProgressBar({ 
  progress, 
  message 
}: { 
  progress: number
  message?: string 
}) {
  return (
    <div className="space-y-2">
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {Math.round(progress)}%
      </p>
    </div>
  )
}

// Loading state para botões
export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = "Carregando...",
  ...props 
}: {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      {...props} 
      disabled={isLoading || props.disabled}
      className={`${props.className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
