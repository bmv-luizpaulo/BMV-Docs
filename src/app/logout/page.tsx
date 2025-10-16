"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await auth.signOut();
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      } finally {
        // Redireciona para a página de login, independentemente de sucesso ou falha no logout
        router.push('/login');
      }
    };

    performLogout();
  }, [auth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-bold text-gray-800">Saindo...</h1>
        <p className="text-gray-600">Você está sendo desconectado. Aguarde um momento.</p>
      </div>
    </div>
  );
}
