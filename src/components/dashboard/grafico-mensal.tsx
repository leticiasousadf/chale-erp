'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props { dados: { data: string; valor: number }[] }

export function GraficoMensal({ dados }: Props) {
  const porMes: Record<string, number> = {}
  dados.forEach(({ data, valor }) => {
    const mes = format(startOfMonth(parseISO(data)), 'yyyy-MM')
    porMes[mes] = (porMes[mes] ?? 0) + Number(valor)
  })
  const chartData = Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    .map(([mes, total]) => ({
      mes: format(parseISO(mes + '-01'), 'MMM/yy', { locale: ptBR }), total,
    }))

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">Evolução Mensal</CardTitle></CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
            Nenhum dado ainda
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
