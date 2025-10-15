"use client";

import { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { firebaseApp } from './config';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const firestore = useMemo(() => getFirestore(firebaseApp), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
