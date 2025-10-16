"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/firebase/provider'
import { signInWithRedirect, GoogleAuthProvider, getRedirectResult } from 'firebase/auth'

interface GoogleDriveAuth {
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  authenticate: () => Promise<void>
  signOut: () => void
}

export function useGoogleDriveAuth(): GoogleDriveAuth {
  const auth = useAuth()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar se já tem token salvo e resultado de redirect
  useEffect(() => {
    const savedToken = localStorage.getItem('google_drive_token')
    if (savedToken) {
      setAccessToken(savedToken)
    }

    // Verificar se há resultado de redirect
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result)
          if (credential?.accessToken) {
            setAccessToken(credential.accessToken)
            localStorage.setItem('google_drive_token', credential.accessToken)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar resultado de redirect:', error)
      }
    }

    checkRedirectResult()
  }, [auth])

  const authenticate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      
      // Adicionar escopos do Google Drive
      provider.addScope('https://www.googleapis.com/auth/drive')
      provider.addScope('https://www.googleapis.com/auth/drive.file')
      provider.addScope('https://www.googleapis.com/auth/drive.metadata')

      // Usar redirect em vez de popup para evitar problemas de COOP
      await signInWithRedirect(auth, provider)

    } catch (err: any) {
      console.error('Erro na autenticação Google Drive:', err)
      setError('Erro ao autenticar com Google Drive')
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setAccessToken(null)
    localStorage.removeItem('google_drive_token')
  }

  return {
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    error,
    authenticate,
    signOut
  }
}
