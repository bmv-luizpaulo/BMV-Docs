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
    console.log('useGoogleDriveAuth: Hook montado. Verificando estado de autenticação...');

    // Efeito para processar o resultado do redirect do Google
    const processRedirectResult = async () => {
      console.log('useGoogleDriveAuth: Verificando resultado do redirecionamento do Google...');
      try {
        const result = await getRedirectResult(auth);
        console.log('useGoogleDriveAuth: Resultado do getRedirectResult:', result);
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          console.log('useGoogleDriveAuth: Credencial obtida:', credential);
          if (credential?.accessToken) {
            console.log('useGoogleDriveAuth: AccessToken encontrado e definido!');
            setAccessToken(credential.accessToken);
          } else {
             console.warn('useGoogleDriveAuth: Credencial obtida, mas sem accessToken.');
          }
          setUser(result.user);
        } else {
          console.log('useGoogleDriveAuth: Nenhum resultado de redirecionamento pendente.');
        }
      } catch (err: any) {
        console.error('useGoogleDriveAuth: Erro ao obter resultado do redirect:', err);
        setError(`Erro ao processar login: ${err.message}`);
      } finally {
        // Marcamos o carregamento como concluído apenas após processar o redirect.
        // Se já houver um usuário (sessão ativa), não esperamos o redirect para parar de carregar.
        if (!auth.currentUser) {
            setIsLoading(false);
            console.log('useGoogleDriveAuth: Carregamento (redirect) finalizado.');
        }
      }
    };
    
    processRedirectResult();

    // Efeito para observar mudanças no estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('useGoogleDriveAuth: onAuthStateChanged disparado. Usuário:', currentUser);
      setUser(currentUser);
      if (!currentUser) {
        // Se o usuário deslogou, limpa tudo
        setAccessToken(null);
      }
      // Se o carregamento inicial do redirect já terminou, podemos parar de carregar.
      if (isLoading) {
        setIsLoading(false);
        console.log('useGoogleDriveAuth: Carregamento (auth state) finalizado.');
      }
    });

    return () => {
      console.log('useGoogleDriveAuth: Hook desmontado. Limpando listener.');
      unsubscribe();
    }
  }, [auth]);

  const authenticate = useCallback(async () => {
    console.log('useGoogleDriveAuth: Iniciando autenticação com redirect...');
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      
      await signInWithRedirect(auth, provider);
      // A página será redirecionada, o código restante não será executado aqui.
    } catch (err: any) {
      console.error('useGoogleDriveAuth: Erro ao iniciar a autenticação:', err);
      setError('Não foi possível iniciar o processo de autenticação.');
      setIsLoading(false);
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    console.log('useGoogleDriveAuth: Realizando logout...');
    await auth.signOut();
    setUser(null);
    setAccessToken(null);
  }, [auth]);

  const isAuthenticated = !!user;
  console.log(`useGoogleDriveAuth: Estado atual - isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}, user: ${!!user}, accessToken: ${!!accessToken}`);

  return {
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    user,
    authenticate,
    signOut,
  }
}
