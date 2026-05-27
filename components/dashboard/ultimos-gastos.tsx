import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Gasto } from '@/types/database'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusConfig = {
  pago:      { label: 'Pago',      variant: 'default'    as const },
  pendente:  { label: 'Pendente',  variant: 'secondary'  as const },
  parcelado: { label: 'Parcelado', variant: 'outline'    as const },
}

export function UltimosGastos({ gastos }: { gastos: Gasto[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">Últimos Gastos</CardTitle></CardHeader>
      <CardContent>
        {gastos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum gasto registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {gastos.map((g) => (
              <div key={g.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: (g as any).categorias?.cor ?? '#94a3b8' }} />
                  <div>
                    <p className="text-sm font-medium">{g.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {(g as any).categorias?.nome ?? '—'} · {format(parseISO(g.data), "d MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusConfig[g.status].variant}>{statusConfig[g.status].label}</Badge>
                  <p className="text-sm font-semibold tabular-nums">
                    {Number(g.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
