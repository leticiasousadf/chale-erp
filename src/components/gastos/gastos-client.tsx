'use client'
import{useState,useTransition}from'react'
import{createGasto,updateGasto,deleteGasto}from'@/actions/gastos'
import{Card}from'@/components/ui/card'
import{Button}from'@/components/ui/button'
import{Badge}from'@/components/ui/badge'
import{useRouter}from'next/navigation'
const brl=(v:number)=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const fd=(d:string)=>{if(!d)return'—';const p=d.split('-');return`${p[2]}/${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][+p[1]-1]}/${p[0]}`}
const sv:Record<string,'default'|'secondary'|'outline'>={pago:'default',pendente:'secondary',parcelado:'outline'}
export function GastosClient({gastos,categorias,centros}:any){
  const router=useRouter()
  const[ip,st]=useTransition()
  const[mo,setMo]=useState(false)
  const[ei,setEi]=useState<any>(null)
  const[search,setSearch]=useState('')
  const[fs,setFs]=useState('')
  const[form,setForm]=useState({titulo:'',valor:'',data:new Date().toISOString().split('T')[0],categoria_id:'',centro_custo_id:'',tipo:'produto',status:'pago',forma_pagamento:'PIX',responsavel:'',observacoes:''})
  const filtered=gastos.filter((g:any)=>{if(fs&&g.status!==fs)return false;if(search&&!g.titulo.toLowerCase().includes(search.toLowerCase()))return false;return true})
  function openNew(){setEi(null);setForm({titulo:'',valor:'',data:new Date().toISOString().split('T')[0],categoria_id:categorias[0]?.id||'',centro_custo_id:centros[0]?.id||'',tipo:'produto',status:'pago',forma_pagamento:'PIX',responsavel:'',observacoes:''});setMo(true)}
  function openEdit(g:any){setEi(g);setForm({titulo:g.titulo,valor:String(g.valor),data:g.data,categoria_id:g.categoria_id||'',centro_custo_id:g.centro_custo_id||'',tipo:g.tipo,status:g.status,forma_pagamento:g.forma_pagamento||'PIX',responsavel:g.responsavel||'',observacoes:g.observacoes||''});setMo(true)}
  function salvar(){const fd2=new FormData();Object.entries(form).forEach(([k,v])=>fd2.append(k,v));st(async()=>{if(ei)await updateGasto(ei.id,fd2);else await createGasto(fd2);setMo(false);router.refresh()})}
  function excluir(id:string){if(!confirm('Excluir?'))return;st(async()=>{await deleteGasto(id);router.refresh()})}
  const fi=(id:string,v:string)=>setForm(f=>({...f,[id]:v}))
  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Gastos</h1><p className="text-muted-foreground text-sm mt-1">Todos os lançamentos da obra</p></div>
        <Button onClick={openNew}>+ Novo gasto</Button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <input className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary" placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['','pago','pendente','parcelado'].map(s=>(
          <button key={s} onClick={()=>setFs(s)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${fs===s?'border-primary text-primary bg-primary/10':'border-border text-muted-foreground bg-card'}`}>
            {s||'Todos'}
          </button>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Título</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Categoria</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Centro</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Data</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Valor</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">Nenhum gasto encontrado</td></tr>}
              {filtered.map((g:any)=>(
                <tr key={g.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3"><div className="font-medium">{g.titulo}</div><div className="text-xs text-muted-foreground">{g.tipo}</div></td>
                  <td className="p-3"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:g.categorias?.cor||'#94a3b8'}}></span>{g.categorias?.nome||'—'}</div></td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{g.centro_custos?.nome||'—'}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">{fd(g.data)}</td>
                  <td className="p-3"><Badge variant={sv[g.status]}>{g.status}</Badge></td>
                  <td className="p-3 text-right font-mono font-semibold whitespace-nowrap">{brl(g.valor)}</td>
                  <td className="p-3"><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={()=>openEdit(g)}>✏️</Button><Button variant="ghost" size="sm" onClick={()=>excluir(g.id)}>🗑️</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {mo&&(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setMo(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-5">{ei?'Editar Gasto':'Novo Gasto'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase">Título *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.titulo} onChange={e=>fi('titulo',e.target.value)}/></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase">Valor *</label><input type="number" step="0.01" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.valor} onChange={e=>fi('valor',e.target.value)}/></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase">Data *</label><input type="date" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.data} onChange={e=>fi('data',e.target.value)}/></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase">Categoria</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.categoria_id} onChange={e=>fi('categoria_id',e.target.value)}><option value="">Selecione...</option>{categorias.map((c:any)=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase">Centro de Custo</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.centro_custo_id} onChange={e=>fi('centro_custo_id',e.target.value)}><option value="">Selecione...</option>{centros.map((c:any)=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase">Tipo</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.tipo} onChange={e=>fi('tipo',e.target.value)}><option value="produto">Produto</option><option value="servico">Serviço</option></select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase">Status</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.status} onChange={e=>fi('status',e.target.value)}><option value="pago">Pago</option><option value="pendente">Pendente</option><option value="parcelado">Parcelado</option></select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase">Pagamento</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.forma_pagamento} onChange={e=>fi('forma_pagamento',e.target.value)}><option>PIX</option><option>Dinheiro</option><option>Cartão</option><option>Boleto</option><option>Transferência</option></select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase">Responsável</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.responsavel} onChange={e=>fi('responsavel',e.target.value)}/></div>
              <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase">Observações</label><textarea className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary resize-none" rows={2} value={form.observacoes} onChange={e=>fi('observacoes',e.target.value)}/></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={()=>setMo(false)}>Cancelar</Button><Button onClick={salvar} disabled={ip}>{ip?'Salvando...':'Salvar gasto'}</Button></div>
          </div>
        </div>
      )}
    </div>
  )
}
