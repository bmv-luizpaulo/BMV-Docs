"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";

export default function SupportPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-6 w-6" />
                Suporte
            </CardTitle>
            <CardDescription>
                Precisa de ajuda? Entre em contato com nossa equipe de suporte.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Página de Suporte em construção.</p>
            </div>
        </CardContent>
    </Card>
  );
}
