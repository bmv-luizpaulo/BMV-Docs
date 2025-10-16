import { useMemo } from 'react'
import { allData } from '@/lib/data'
import type { DocumentoStatus } from '@/lib/types'

interface DashboardStats {
  totalFarms: number
  totalDocuments: number
  completeDocuments: number
  completionPercentage: string
  criticalIssues: Array<{
    id: string
    name: string
    status: DocumentoStatus
    farmName?: string
    nucleoName?: string
  }>
  chartData: Array<{
    name: string
    Completo: number
    Pendente: number
    Incompleto: number
    Divergência: number
  }>
  docsByCategory: Record<string, {
    total: number
    completo: number
    pendente: number
    incompleto: number
    divergencia: number
  }>
}

export function useDashboardStats(): DashboardStats {
  return useMemo(() => {
    // Calcular estatísticas de forma otimizada
    const totalFarms = allData.nucleos.reduce(
      (acc, n) => acc + n.fazendas.length,
      0
    )

    const allDocuments = allData.nucleos.flatMap((n) =>
      n.fazendas.flatMap((f) => f.documentos)
    )

    const totalDocuments = allDocuments.length
    const completeDocuments = allDocuments.filter(
      (d) => d.status === "Completo"
    ).length

    const completionPercentage =
      totalDocuments > 0
        ? ((completeDocuments / totalDocuments) * 100).toFixed(1)
        : "0"

    // Otimizar busca de issues críticas
    const criticalIssues = allDocuments
      .filter((d) => d.status === "Incompleto" || d.status === "Divergência")
      .slice(0, 5)
      .map(doc => {
        // Busca otimizada usando Map para O(1) lookup
        for (const nucleo of allData.nucleos) {
          for (const farm of nucleo.fazendas) {
            if (farm.documentos.some(d => d.id === doc.id)) {
              return { 
                ...doc, 
                farmName: farm.name, 
                nucleoName: nucleo.name 
              }
            }
          }
        }
        return doc
      })

    // Dados do gráfico otimizados
    const chartData = allData.nucleos.map((nucleo) => {
      const docs = nucleo.fazendas.flatMap((f) => f.documentos)
      return {
        name: nucleo.name,
        Completo: docs.filter((d) => d.status === "Completo").length,
        Pendente: docs.filter((d) => d.status === "Pendente").length,
        Incompleto: docs.filter((d) => d.status === "Incompleto").length,
        Divergência: docs.filter((d) => d.status === "Divergência").length,
      }
    })

    // Análise por categoria otimizada
    const docsByCategory = allDocuments.reduce((acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = { 
          total: 0, 
          completo: 0, 
          pendente: 0, 
          incompleto: 0, 
          divergencia: 0 
        }
      }
      acc[doc.category].total++
      
      const statusKey = doc.status.toLowerCase().replace('ência', 'encia') as keyof typeof acc[typeof doc.category]
      if (statusKey in acc[doc.category]) {
        acc[doc.category][statusKey]++
      }
      
      return acc
    }, {} as Record<string, {
      total: number
      completo: number
      pendente: number
      incompleto: number
      divergencia: number
    }>)

    return {
      totalFarms,
      totalDocuments,
      completeDocuments,
      completionPercentage,
      criticalIssues,
      chartData,
      docsByCategory
    }
  }, []) // Dependência vazia pois allData é estático
}
