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
  const [user, setUser] = useState<User | null>(null);

  // Efeito para lidar com o resultado do redirecionamento de login
  useEffect(() => {
    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setAccessToken(credential.accessToken);
          }
          setUser(result.user);
        }
      } catch (err: any) {
        console.error('Erro ao obter resultado do redirect:', err);
        setError('Erro ao processar autenticação via Google.');
      }
      // Apenas definimos loading como false depois de tentar obter o resultado do redirect
      setIsLoading(false);
    };

    processRedirectResult();
  }, [auth]);

  // Efeito para ouvir mudanças no estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Se o usuário faz logout, limpa o token de acesso
        setAccessToken(null);
      }
      // Não definimos isLoading aqui para esperar o processamento do redirect
    });

    return () => unsubscribe();
  }, [auth]);

  const authenticate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Adicionar escopos necessários para o Google Drive
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
      
      await signInWithRedirect(auth, provider);
      // O resultado será processado pelo useEffect que chama `getRedirectResult`
    } catch (err: any) {
      console.error('Erro ao iniciar a autenticação Google Drive:', err);
      setError('Não foi possível iniciar o processo de autenticação. Tente novamente.');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setAccessToken(null);
  };

  return {
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    error,
    authenticate,
    signOut,
  }
}
