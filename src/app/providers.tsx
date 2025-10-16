"use client";

import { FirebaseClientProvider } from "@/firebase/client-provider";
import { NotificationProvider } from "@/hooks/use-notifications";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </FirebaseClientProvider>
  );
}
