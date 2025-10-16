"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Configurações
            </CardTitle>
            <CardDescription>
                Gerencie as configurações da sua conta e da aplicação.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Página de Configurações em construção.</p>
            </div>
        </CardContent>
    </Card>
  );
}
