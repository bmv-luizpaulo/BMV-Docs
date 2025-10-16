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
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import type { DocumentoStatus } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Home,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardSkeleton } from "@/components/ui/loading-skeletons";
import { Suspense } from "react";

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

// Componente otimizado para estatísticas
const StatsCards = () => {
  const stats = useDashboardStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Fazendas</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFarms}</div>
          <p className="text-xs text-muted-foreground">
            Núcleos ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          <p className="text-xs text-muted-foreground">
            Documentos cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            Documentos completos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Problemas Críticos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.criticalIssues.length}</div>
          <p className="text-xs text-muted-foreground">
            Requerem atenção
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente otimizado para gráficos
const ChartsSection = () => {
  const stats = useDashboardStats()

  const chartConfig = {
    Completo: { label: "Completo", color: "hsl(var(--chart-1))" },
    Pendente: { label: "Pendente", color: "hsl(var(--chart-2))" },
    Incompleto: { label: "Incompleto", color: "hsl(var(--chart-3))" },
    Divergência: { label: "Divergência", color: "hsl(var(--chart-4))" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status por Núcleo</CardTitle>
          <CardDescription>
            Distribuição de documentos por status em cada núcleo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Completo" fill="var(--color-Completo)" />
              <Bar dataKey="Pendente" fill="var(--color-Pendente)" />
              <Bar dataKey="Incompleto" fill="var(--color-Incompleto)" />
              <Bar dataKey="Divergência" fill="var(--color-Divergência)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise por Categoria</CardTitle>
          <CardDescription>
            Status dos documentos por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.docsByCategory).map(([category, data]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span className="text-muted-foreground">
                    {data.completo}/{data.total} completos
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(data.completo / data.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente otimizado para tabela de problemas
const CriticalIssuesTable = () => {
  const stats = useDashboardStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Problemas Críticos</CardTitle>
        <CardDescription>
          Documentos que requerem atenção imediata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Fazenda</TableHead>
              <TableHead>Núcleo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.criticalIssues.map((issue) => {
              const StatusIcon = statusIcons[issue.status]
              return (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.name}</TableCell>
                  <TableCell>{issue.farmName}</TableCell>
                  <TableCell>{issue.nucleoName}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[issue.status]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Componente principal otimizado
export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <StatsCards />
        <ChartsSection />
        <CriticalIssuesTable />
      </Suspense>
    </div>
  )
}
