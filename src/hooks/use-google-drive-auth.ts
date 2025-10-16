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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setUser(user);
        try {
          const credential = GoogleAuthProvider.credentialFromResult(await getRedirectResult(auth));
          if (credential?.accessToken) {
            setAccessToken(credential.accessToken);
          } else {
             // If there's no redirect result, try to get token from the user object
            const idToken = await user.getIdToken(true);
            // This is not the Drive access token, but we need to handle auth properly.
            // Let's get the proper access token after sign-in.
          }
        } catch (err: any) {
            // This error is expected if the user is already signed in and there's no redirect to process.
            if (err.code !== 'auth/no-redirect-operation') {
                 console.error('Erro ao obter resultado do redirect:', err);
                 setError('Erro ao processar autenticação.');
            }
        }
        // Always try to get a fresh OAuth access token from the credential if it exists
        try {
            const credential = GoogleAuthProvider.credentialFromResult(await getRedirectResult(auth));
            if (credential?.accessToken) {
              setAccessToken(credential.accessToken);
            }
        } catch (e) {
            // Ignore no-redirect-operation error
        }


      } else {
        setUser(null);
        setAccessToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleCredential = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setAccessToken(credential.accessToken);
          return;
        }
      }
      // If no result, maybe the user is already logged in
      if (auth.currentUser) {
         const idTokenResult = await auth.currentUser.getIdTokenResult();
         // This gives us the Firebase ID token, not the Google Drive access token.
         // For Drive, we need the OAuth access token which is best obtained right after sign-in.
      }
    } catch (err: any) {
      console.error('Erro no handleCredential:', err);
      setError('Falha ao obter credenciais do Google.');
    } finally {
      setIsLoading(false);
    }
  }, [auth]);


  useEffect(() => {
    handleCredential();
  }, [handleCredential]);

  const authenticate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/drive.metadata');
      await signInWithRedirect(auth, provider);
      // O resultado será processado pelo `getRedirectResult` no useEffect
    } catch (err: any) {
      console.error('Erro ao iniciar a autenticação Google Drive:', err);
      setError('Não foi possível iniciar o processo de autenticação. Tente novamente.');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await auth.signOut();
    setAccessToken(null);
    setUser(null);
  }

  // Effect to get OAuth Access Token from redirect result
  useEffect(() => {
    const processRedirect = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential?.accessToken) {
                    setAccessToken(credential.accessToken);
                }
            }
        } catch (error) {
            console.error("Auth redirect error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    processRedirect();
  }, [auth]);

  return {
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    error,
    authenticate,
    signOut,
  }
}
