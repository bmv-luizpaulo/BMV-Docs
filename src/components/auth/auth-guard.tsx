"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AuthErrorHandler from "./auth-error-handler";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "loading") return; // Ainda carregando

    if (!session) {
      router.push("/login");
    }
  }, [session, status, router, mounted]);

  // Evita hidratação mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar loading enquanto verifica autenticação
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderiza nada (será redirecionado)
  if (!session) {
    return null;
  }

  // Se está autenticado, renderiza o conteúdo com tratamento de erro
  return (
    <AuthErrorHandler>
      {children}
    </AuthErrorHandler>
  );
}