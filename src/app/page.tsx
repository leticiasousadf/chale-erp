export const dynamic='force-dynamic'
import{createServerClient}from'@/lib/supabase-server'
import{Card,CardContent,CardHeader,CardTitle}from'@/components/ui/card'
const brl=(v:number)=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export default async function Dashboard(){
  const s=await createServerClient()
  const hoje=new Date()
  const im=new Date(hoje.getFullYear(),hoje.getMonth(),1).toISOString().split('T')[0]
  const fm=new Date(hoje.getFullYear(),hoje.getMonth()+1,0).toISOString().split('T')[0]
  const[{data:todos},{data:mes},{data:pend},{data:orc},{data:ult}]=await Promise.all([
    s.from('gastos').select('valor,data,categoria_id'),
    s.from('gastos').select('valor').gte('data',im).lte('data',fm),
    s.from('gastos').select('valor').eq('status','pendente'),
    s.from('orcamentos').select('valor_previsto'),
    s.from('gastos').select('*,categorias(nome,cor),centro_custos(nome)').order('created_at',{ascending:false}).limit(5),
  ])
  const total=todos?.reduce((s,g)=>s+Number(g.valor),0)??0
  const totalMes=mes?.reduce((s,g)=>s+Number(g.valor),0)??0
  const totalPend=pend?.reduce((s,g)=>s+Number(g.valor),0)??0
  const totalPrev=orc?.reduce((s,o)=>s+Number(o.valor_previsto),0)??0
  const saldo=totalPrev-total
  const cards=[
    {t:'Total Gasto',v:brl(total),s:totalPrev>0?`${(total/totalPrev*100).toFixed(0)}% do orçamento`:'—',c:'text-blue-500'},
    {t:'Gasto no Mês',v:brl(totalMes),s:'Mês atual',c:'text-green-500'},
    {t:'Pendente',v:brl(totalPend),s:'A pagar',c:'text-amber-500'},
    {t:'Previsto x Real',v:brl(Math.abs(saldo)),s:saldo>=0?'✅ Dentro do orçamento':'⚠️ Acima do previsto',c:saldo>=0?'text-green-500':'text-red-500'},
  ]
  const fmtDate=(d:string)=>{if(!d)return'—';const p=d.split('-');return`${p[2]}/${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][+p[1]-1]}`}
  const statusCls:Record<string,string>={pago:'bg-green-500/15 text-green-500',pendente:'bg-amber-500/15 text-amber-500',parcelado:'bg-blue-500/15 text-blue-500'}
  return(
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-muted-foreground text-sm mt-1">Visão geral da construção</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c=>(
          <Card key={c.t}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{c.t}</CardTitle></CardHeader>
          <CardContent><p className={`text-xl font-bold font-mono ${c.c}`}>{c.v}</p><p className="text-xs text-muted-foreground mt-1">{c.s}</p></CardContent></Card>
        ))}
      </div>
      <Card><div className="p-4 border-b border-border flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Últimos Gastos</span><a href="/gastos" className="text-xs text-primary">Ver todos →</a></div>
        <div className="divide-y divide-border">
          {(ult??[]).length===0&&<p className="text-center py-8 text-sm text-muted-foreground">Nenhum gasto ainda</p>}
          {(ult as any[]??[]).map((g:any)=>(
            <div key={g.id} className="flex items-center gap-3 p-4">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:g.categorias?.cor||'#94a3b8'}}></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{g.titulo}</p><p className="text-xs text-muted-foreground">{g.categorias?.nome||'—'} · {fmtDate(g.data)}</p></div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCls[g.status]||''}`}>{g.status}</span>
              <span className="font-mono text-sm font-semibold">{brl(g.valor)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
