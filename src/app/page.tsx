import { createClient } from '@/lib/supabase'
import { DashboardCards } from '@/components/dashboard/cards'
import { GraficoMensal } from '@/components/dashboard/grafico-mensal'
import { GraficoCategorias } from '@/components/dashboard/grafico-categorias'
import { UltimosGastos } from '@/components/dashboard/ultimos-gastos'

export default async function DashboardPage() {
  const supabase = createClient()
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ data: totalGeral }, { data: totalMes }, { data: pendentes },
         { data: orcamentos }, { data: ultimosGastos }, { data: gastosPorMes },
         { data: gastosPorCategoria }] = await Promise.all([
    supabase.from('gastos').select('valor'),
    supabase.from('gastos').select('valor').gte('data', inicioMes).lte('data', fimMes),
    supabase.from('gastos').select('valor').eq('status', 'pendente'),
    supabase.from('orcamentos').select('valor_previsto'),
    supabase.from('gastos').select('*, categorias(nome,cor), centro_custos(nome)').order('created_at', { ascending: false }).limit(5),
    supabase.from('gastos').select('data, valor').order('data', { ascending: true }),
    supabase.from('gastos').select('valor, categorias(nome,cor)'),
  ])

  const somaTotal    = totalGeral?.reduce((s, g) => s + Number(g.valor), 0) ?? 0
  const somaMes      = totalMes?.reduce((s, g) => s + Number(g.valor), 0) ?? 0
  const somaPendente = pendentes?.reduce((s, g) => s + Number(g.valor), 0) ?? 0
  const somaPrevisto = orcamentos?.reduce((s, o) => s + Number(o.valor_previsto), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral da construção</p>
      </div>
      <DashboardCards totalGeral={somaTotal} totalMes={somaMes} totalPendente={somaPendente} totalPrevisto={somaPrevisto} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoMensal dados={gastosPorMes ?? []} />
        <GraficoCategorias dados={(gastosPorCategoria as any) ?? []} />
      </div>
      <UltimosGastos gastos={(ultimosGastos as any) ?? []} />
    </div>
  )
}
