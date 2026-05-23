'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props { dados: { valor: number; categorias: { nome: string; cor: string } | null }[] }

export function GraficoCategorias({ dados }: Props) {
  const agrupado: Record<string, { valor: number; cor: string }> = {}
  dados.forEach(({ valor, categorias }) => {
    const nome = categorias?.nome ?? 'Sem categoria'
    const cor = categorias?.cor ?? '#94a3b8'
    if (!agrupado[nome]) agrupado[nome] = { valor: 0, cor }
    agrupado[nome].valor += Number(valor)
  })
  const chartData = Object.entries(agrupado)
    .map(([nome, { valor, cor }]) => ({ nome, valor, cor }))
    .sort((a, b) => b.valor - a.valor).slice(0, 7)

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">Gastos por Categoria</CardTitle></CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
            Nenhum dado ainda
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartData} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={80}>
                {chartData.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Pie>
              <Tooltip formatter={(v: unknown) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
