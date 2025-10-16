"use client";

import { FirebaseClientProvider } from "@/firebase/client-provider";
import { NotificationProvider } from "@/hooks/use-notifications";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <NotificationProvider>
        {children}
        <Toaster />
      </NotificationProvider>
    </FirebaseClientProvider>
  );
}
