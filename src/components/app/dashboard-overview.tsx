"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { allData } from "@/lib/data";
import type { DocumentoStatus } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Folder,
  XCircle,
  Clock,
  Home,
} from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const statusColors: Record<DocumentoStatus, string> = {
  Completo: "bg-green-500",
  Pendente: "bg-yellow-500",
  Incompleto: "bg-red-500",
  Divergência: "bg-orange-500",
};

const statusIcons: Record<DocumentoStatus, React.ElementType> = {
  Completo: CheckCircle2,
  Pendente: Clock,
  Incompleto: XCircle,
  Divergência: AlertTriangle,
};


export default function DashboardOverview() {
  const totalFarms = allData.nucleos.reduce(
    (acc, n) => acc + n.fazendas.length,
    0
  );
  const allDocuments = allData.nucleos.flatMap((n) =>
    n.fazendas.flatMap((f) => f.documentos)
  );
  const totalDocuments = allDocuments.length;
  const completeDocuments = allDocuments.filter(
    (d) => d.status === "Completo"
  ).length;
  const completionPercentage =
    totalDocuments > 0
      ? ((completeDocuments / totalDocuments) * 100).toFixed(1)
      : 0;
  
  const criticalIssues = allDocuments
    .filter((d) => d.status === "Incompleto" || d.status === "Divergência")
    .slice(0, 5)
    .map(doc => {
        const farm = allData.nucleos.flatMap(n => n.fazendas).find(f => f.documentos.some(d => d.id === doc.id));
        const nucleo = allData.nucleos.find(n => n.fazendas.some(f => f.id === farm?.id));
        return { ...doc, farmName: farm?.name, nucleoName: nucleo?.name };
    });

  const chartData = allData.nucleos.map((nucleo) => {
    const docs = nucleo.fazendas.flatMap((f) => f.documentos);
    return {
      name: nucleo.name,
      Completo: docs.filter((d) => d.status === "Completo").length,
      Pendente: docs.filter((d) => d.status === "Pendente").length,
      Incompleto: docs.filter((d) => d.status === "Incompleto").length,
      Divergência: docs.filter((d) => d.status === "Divergência").length,
    };
  });

  // Análise por categoria de documentos
  const docsByCategory = allDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = { total: 0, completo: 0, pendente: 0, incompleto: 0, divergencia: 0 };
    }
    acc[doc.category].total++;
    acc[doc.category][doc.status.toLowerCase().replace('ência', 'encia')]++;
    return acc;
  }, {} as Record<string, any>);
  
  const chartConfig = {
      Completo: { label: "Completo", color: "hsl(var(--chart-1))" },
      Pendente: { label: "Pendente", color: "hsl(var(--chart-4))" },
      Incompleto: { label: "Incompleto", color: "hsl(var(--destructive))" },
      Divergência: { label: "Divergência", color: "hsl(var(--chart-2))" },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Núcleos</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allData.nucleos.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de núcleos gerenciados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fazendas</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFarms}</div>
            <p className="text-xs text-muted-foreground">
              Total de fazendas cadastradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Total de documentos no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              De documentos completos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral dos Núcleos</CardTitle>
            <CardDescription>
              Progresso da documentação por núcleo.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis />
                  <Tooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="Completo" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pendente" stackId="a" fill="hsl(var(--chart-4))" />
                  <Bar dataKey="Divergência" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="Incompleto" stackId="a" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pendências Críticas</CardTitle>
            <CardDescription>
              Documentos com status de Incompleto ou Divergência.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fazenda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalIssues.map(doc => {
                    const StatusIcon = statusIcons[doc.status];
                    return(
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="destructive"
                        className={`text-white ${statusColors[doc.status]}`}
                      >
                         <StatusIcon className="mr-1 h-3 w-3" />
                         {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.farmName}</TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Análise por Categoria de Documentos</CardTitle>
            <CardDescription>
              Distribuição de documentos por categoria e status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(docsByCategory).map(([category, stats]) => {
                const completionRate = ((stats.completo / stats.total) * 100).toFixed(1);
                return (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{category}</h4>
                        <Badge variant="outline">{stats.total} docs</Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="default" className="text-xs">
                          {stats.completo} Completo
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {stats.pendente} Pendente
                        </Badge>
                        <Badge variant="destructive" className="text-xs">
                          {stats.incompleto} Incompleto
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {stats.divergencia} Divergência
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                      <div className="text-xs text-muted-foreground">Conformidade</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Fluxo de Trabalho</CardTitle>
            <CardDescription>
              Progresso dos documentos coletivos no fluxo BMV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { step: 1, name: 'Elegibilidade', icon: '📋' },
                { step: 2, name: 'Legitimação', icon: '📄' },
                { step: 3, name: 'Inventário', icon: '🌳' },
                { step: 4, name: 'Quantificação', icon: '📊' },
                { step: 5, name: 'Validação', icon: '✅' },
                { step: 6, name: 'Verificação', icon: '🔍' },
                { step: 7, name: 'Certificação', icon: '🏆' }
              ].map(({ step, name, icon }) => {
                const docsInStep = allDocuments.filter(d => d.category === 'Coletivo' && d.workflowStep === step);
                const completedInStep = docsInStep.filter(d => d.status === 'Completo').length;
                const progress = docsInStep.length > 0 ? (completedInStep / docsInStep.length) * 100 : 0;
                
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className="text-2xl">{icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground">{completedInStep}/{docsInStep.length}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
