"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/firebase/provider'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, GoogleAuthProvider, User } from 'firebase/auth'

interface GoogleDriveAuth {
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: User | null
  authenticate: () => Promise<void>
  signOut: () => Promise<void>
}

export function useGoogleDriveAuth(): GoogleDriveAuth {
  const auth = useAuth()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    // Este efeito lida com o resultado do redirecionamento do login do Google
    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Credencial obtida com sucesso após o redirecionamento
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setAccessToken(credential.accessToken);
          }
          setUser(result.user);
        }
      } catch (err: any) {
        console.error('Erro ao obter resultado do redirect:', err);
        setError('Erro ao processar autenticação via Google.');
      } finally {
        // Marcamos o carregamento como concluído apenas após processar o redirect
        setIsLoading(false);
      }
    };
    
    processRedirectResult();

    // Este efeito observa as mudanças de estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccessToken(null);
      }
       if(!isLoading) {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, isLoading]);

  const authenticate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Adicionar escopos necessários para o Google Drive
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error('Erro ao iniciar a autenticação Google Drive:', err);
      setError('Não foi possível iniciar o processo de autenticação.');
      setIsLoading(false);
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setAccessToken(null);
  }, [auth]);

  return {
    accessToken,
    isAuthenticated: !!user, // A autenticação depende apenas do usuário do Firebase
    isLoading,
    error,
    user,
    authenticate,
    signOut,
  }
}
