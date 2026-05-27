import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar, Clock, Target } from 'lucide-react'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props {
  totalGeral: number; totalMes: number; totalPendente: number; totalPrevisto: number
}

export function DashboardCards({ totalGeral, totalMes, totalPendente, totalPrevisto }: Props) {
  const diferenca = totalPrevisto - totalGeral
  const pct = totalPrevisto > 0 ? (totalGeral / totalPrevisto) * 100 : 0

  const cards = [
    { title: 'Total Gasto', value: formatBRL(totalGeral), icon: TrendingUp,
      desc: totalPrevisto > 0 ? `${pct.toFixed(0)}% do orçamento` : 'Sem orçamento definido', color: 'text-blue-500' },
    { title: 'Gasto no Mês', value: formatBRL(totalMes), icon: Calendar,
      desc: 'Mês atual', color: 'text-green-500' },
    { title: 'Pendente', value: formatBRL(totalPendente), icon: Clock,
      desc: 'A pagar', color: 'text-amber-500' },
    { title: 'Previsto x Real', value: formatBRL(Math.abs(diferenca)), icon: Target,
      desc: diferenca >= 0 ? '✅ Dentro do orçamento' : '⚠️ Acima do previsto',
      color: diferenca >= 0 ? 'text-green-500' : 'text-red-500' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
            <c.icon size={16} className={c.color} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
