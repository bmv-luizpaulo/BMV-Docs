"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification extends ToastProps {
  id: string
  type: NotificationType
  title: React.ReactNode
  message?: React.ReactNode
  action?: ToastActionElement
}

interface NotificationContextType {
  notifications: Notification[]
  showToast: (toast: Omit<Notification, 'id' | 'type'> & { type: NotificationType }) => void
  dismiss: (id: string) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showToast = useCallback((toast: Omit<Notification, 'id' | 'type'> & { type: NotificationType }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications((prev) => [{ ...toast, id }, ...prev])
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message })
  }, [showToast])

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message })
  }, [showToast])

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])

  const contextValue: NotificationContextType = {
    notifications,
    showToast,
    dismiss,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

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

