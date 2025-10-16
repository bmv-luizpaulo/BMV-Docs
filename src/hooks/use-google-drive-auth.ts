"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/firebase/provider'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, getAdditionalUserInfo } from 'firebase/auth'

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

  // Função para extrair e salvar o token
  const handleAuthSuccess = useCallback((user) => {
    if (user && user.providerData) {
      const googleProviderData = user.providerData.find(
        (provider: any) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
      );
      
      // Tenta pegar o token do localStorage primeiro, se disponível
      const storedToken = localStorage.getItem('google_drive_token');
      if (storedToken) {
          setAccessToken(storedToken);
          setIsLoading(false);
          return;
      }
    }
    // Se não houver token, força o re-login para obter os escopos
    setError("Token de acesso do Google Drive não encontrado. Por favor, autorize novamente.");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleAuthSuccess(user);
      } else {
        setIsLoading(false);
        setAccessToken(null);
        localStorage.removeItem('google_drive_token');
      }
    });

    return () => unsubscribe();
  }, [auth, handleAuthSuccess]);

  const authenticate = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.metadata');
  
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
  
      if (credential?.accessToken) {
        const token = credential.accessToken;
        setAccessToken(token);
        localStorage.setItem('google_drive_token', token);
        setError(null);
      } else {
        throw new Error("Não foi possível obter o token de acesso do Google.");
      }
    } catch (err: any) {
      console.error('Erro na autenticação Google Drive:', err);
      let errorMessage = 'Erro ao autenticar com Google Drive. Tente novamente.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'A janela de autenticação foi fechada antes da conclusão.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Múltiplas tentativas de autenticação. Por favor, tente novamente.';
      }
      setError(errorMessage);
      setAccessToken(null);
      localStorage.removeItem('google_drive_token');
    } finally {
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
