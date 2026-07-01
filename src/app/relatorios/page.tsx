export const dynamic='force-dynamic'
import{createServerClient}from'@/lib/supabase-server'
import{Card,CardContent,CardHeader,CardTitle}from'@/components/ui/card'
const brl=(v:number)=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export default async function Page(){
  const s=await createServerClient()
  const[{data:gastos},{data:orc}]=await Promise.all([
    s.from('gastos').select('valor,data,status,categorias(nome,cor)'),
    s.from('orcamentos').select('valor_previsto'),
  ])
  const total=gastos?.reduce((s,g)=>s+Number(g.valor),0)??0
  const pend=gastos?.filter(g=>g.status==='pendente').reduce((s,g)=>s+Number(g.valor),0)??0
  const prev=orc?.reduce((s,o)=>s+Number(o.valor_previsto),0)??0
  const meses=[...new Set(gastos?.map(g=>g.data?.slice(0,7)))].length||1
  const byCat:Record<string,{total:number,cor:string}>={}
  gastos?.forEach(g=>{const n=(g as any).categorias?.nome||'Sem categoria';const c=(g as any).categorias?.cor||'#94a3b8';if(!byCat[n])byCat[n]={total:0,cor:c};byCat[n].total+=Number(g.valor)})
  const ranking=Object.entries(byCat).sort((a,b)=>b[1].total-a[1].total)
  return(
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground text-sm mt-1">Análises financeiras da obra</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-5 text-center"><p className="text-2xl font-bold font-mono text-primary">{brl(total/meses)}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Média mensal</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><p className="text-lg font-bold text-red-500">{ranking[0]?ranking[0][0]:'—'}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Categoria mais cara</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><p className="text-2xl font-bold font-mono text-amber-500">{brl(total*1.15)}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Projeção final (+15%)</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-sm">Gastos por Categoria</CardTitle></CardHeader><CardContent>
          {ranking.length===0&&<p className="text-sm text-muted-foreground text-center py-6">Nenhum dado ainda</p>}
          <div className="space-y-3">{ranking.map(([nome,{total:t,cor}])=>(<div key={nome}><div className="flex justify-between text-sm mb-1"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:cor}}></span>{nome}</span><span className="font-mono text-xs">{brl(t)}</span></div><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${total>0?(t/total)*100:0}%`,background:cor}}></div></div></div>))}</div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Resumo Financeiro</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">{[{l:'Total gasto',v:brl(total),c:'text-primary'},{l:'Total previsto',v:brl(prev),c:'text-muted-foreground'},{l:'Saldo',v:brl(prev-total),c:prev-total>=0?'text-green-500':'text-red-500'},{l:'Pendente',v:brl(pend),c:'text-amber-500'}].map(r=>(<div key={r.l} className="flex justify-between py-2 border-b border-border last:border-0"><span className="text-sm text-muted-foreground">{r.l}</span><span className={`font-mono text-sm font-semibold ${r.c}`}>{r.v}</span></div>))}</div>
        </CardContent></Card>
      </div>
    </div>
  )
}
