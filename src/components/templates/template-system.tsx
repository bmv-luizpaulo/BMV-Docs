"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Type, Upload, Download, Archive } from "lucide-react";
import TemplateManager from './template-manager';
import { AdvancedTemplateEditor } from './advanced-template-editor';
import { TemplateApplicationSystem } from './template-application-system';
import { TemplateImportExportSystem } from './template-import-export-system';

export function TemplateSystem() {
  const [activeTab, setActiveTab] = useState('manager');

  return (
    <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manager" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Gerenciador
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Editor Avançado
            </TabsTrigger>
            <TabsTrigger value="application" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Aplicar Templates
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Importar/Exportar
            </TabsTrigger>
        </TabsList>

        <TabsContent value="manager" className="mt-6">
            <TemplateManager accessToken="mock-token" documents={[]} folders={[]} />
        </TabsContent>

        <TabsContent value="editor" className="mt-6">
            <AdvancedTemplateEditor />
        </TabsContent>

        <TabsContent value="application" className="mt-6">
            <TemplateApplicationSystem />
        </TabsContent>

        <TabsContent value="import-export" className="mt-6">
            <TemplateImportExportSystem />
        </TabsContent>
        </Tabs>
    </div>
  );
}
