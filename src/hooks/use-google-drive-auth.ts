"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/firebase/provider'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, GoogleAuthProvider, User } from 'firebase/auth'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleAuthResult = useCallback(async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          const token = credential.accessToken;
          setAccessToken(token);
          localStorage.setItem('google_drive_token', token);
          setError(null);
        } else {
          throw new Error("Não foi possível obter o token de acesso do Google após o redirect.");
        }
      } else {
        // Se não houver resultado de redirect, checa se já existe um token salvo
        const storedToken = localStorage.getItem('google_drive_token');
        if (storedToken) {
          setAccessToken(storedToken);
        }
      }
    } catch (err: any) {
      console.error('Erro ao processar o resultado do redirect:', err);
      let errorMessage = 'Erro ao autenticar com Google Drive. Tente novamente.';
      if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Já existe uma conta com este e-mail, mas com um método de login diferente.';
      }
      setError(errorMessage);
      setAccessToken(null);
      localStorage.removeItem('google_drive_token');
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    const storedToken = localStorage.getItem('google_drive_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsLoading(false);
    } else {
      handleAuthResult();
    }
  }, [handleAuthResult]);

  const authenticate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.metadata');
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error('Erro ao iniciar a autenticação Google Drive:', err);
      setError('Não foi possível iniciar o processo de autenticação. Tente novamente.');
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setAccessToken(null)
    localStorage.removeItem('google_drive_token')
    auth.signOut();
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
