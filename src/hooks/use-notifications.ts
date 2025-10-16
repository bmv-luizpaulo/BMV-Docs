"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newNotification = { ...notification, id }
      
      setNotifications((prev) => [...prev, newNotification])

      const duration = notification.duration || 5000
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    },
    [removeNotification]
  )

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const showSuccess = useCallback((title: string, message?: string) => {
    addNotification({ type: 'success', title, message })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string) => {
    addNotification({ type: 'error', title, message })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string) => {
    addNotification({ type: 'warning', title, message })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string) => {
    addNotification({ type: 'info', title, message })
  }, [addNotification])

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return React.createElement(
    NotificationContext.Provider,
    { value: contextValue },
    children
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Hook para notificacoes especificas do sistema
export function useSystemNotifications() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()

  const notifyDocumentUploaded = useCallback((fileName: string) => {
    showSuccess('Upload Concluido', `O arquivo "${fileName}" foi enviado com sucesso`)
  }, [showSuccess])

  const notifyDocumentDeleted = useCallback((fileName: string) => {
    showSuccess('Documento Excluido', `O arquivo "${fileName}" foi removido`)
  }, [showSuccess])

  const notifyFolderCreated = useCallback((folderName: string) => {
    showSuccess('Pasta Criada', `A pasta "${folderName}" foi criada com sucesso`)
  }, [showSuccess])

  const notifySearchCompleted = useCallback((count: number) => {
    showInfo('Busca Concluida', `${count} documento(s) encontrado(s)`)
  }, [showInfo])

  const notifyCacheCleared = useCallback(() => {
    showInfo('Cache Limpo', 'Os dados em cache foram atualizados')
  }, [showInfo])

  const notifyAuthError = useCallback((message: string) => {
    showError('Erro de Autenticacao', message)
  }, [showError])

  const notifyNetworkError = useCallback(() => {
    showError('Erro de Conexao', 'Verifique sua conexao com a internet')
  }, [showError])

  const notifyValidationError = useCallback((message: string) => {
    showWarning('Erro de Validacao', message)
  }, [showWarning])

  const notifyPermissionDenied = useCallback(() => {
    showError('Permissao Negada', 'Voce nao tem permissao para realizar esta acao')
  }, [showError])

  const notifyFileTooLarge = useCallback((maxSize: string) => {
    showError('Arquivo Muito Grande', `O arquivo excede o limite de ${maxSize}`)
  }, [showError])

  const notifyUnsupportedFileType = useCallback((fileType: string) => {
    showError('Tipo de Arquivo Nao Suportado', `O tipo "${fileType}" nao e suportado`)
  }, [showError])

  return {
    notifyDocumentUploaded,
    notifyDocumentDeleted,
    notifyFolderCreated,
    notifySearchCompleted,
    notifyCacheCleared,
    notifyAuthError,
    notifyNetworkError,
    notifyValidationError,
    notifyPermissionDenied,
    notifyFileTooLarge,
    notifyUnsupportedFileType
  }
}