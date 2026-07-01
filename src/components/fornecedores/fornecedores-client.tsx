'use client'
import{useState,useTransition}from'react'
import{createFornecedor,updateFornecedor,deleteFornecedor}from'@/actions/fornecedores'
import{Button}from'@/components/ui/button'
import{useRouter}from'next/navigation'
const brl=(v:number)=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const CORES=['#ef4444','#8b5cf6','#06b6d4','#f59e0b','#10b981','#f97316','#4f7cff']
export function FornecedoresClient({fornecedores,gastos}:any){
  const router=useRouter()
  const[ip,st]=useTransition()
  const[mo,setMo]=useState(false)
  const[ei,setEi]=useState<any>(null)
  const[search,setSearch]=useState('')
  const[form,setForm]=useState({nome:'',telefone:'',cidade:'',tipo_servico:'Materiais de construção',avaliacao:'5',observacoes:''})
  const filtered=fornecedores.filter((f:any)=>!search||f.nome.toLowerCase().includes(search.toLowerCase())||f.tipo_servico?.toLowerCase().includes(search.toLowerCase()))
  function openNew(){setEi(null);setForm({nome:'',telefone:'',cidade:'',tipo_servico:'Materiais de construção',avaliacao:'5',observacoes:''});setMo(true)}
  function openEdit(f:any){setEi(f);setForm({nome:f.nome,telefone:f.telefone||'',cidade:f.cidade||'',tipo_servico:f.tipo_servico||'',avaliacao:String(f.avaliacao||5),observacoes:f.observacoes||''});setMo(true)}
  function salvar(){
    st(async()=>{
      const ini=form.nome.split(' ').map((p:string)=>p[0]).join('').slice(0,2).toUpperCase()
      const cor=CORES[fornecedores.length%CORES.length]
      const p={...form,avaliacao:parseInt(form.avaliacao),ini,cor}
      if(ei)await updateFornecedor(ei.id,p);else await createFornecedor(p)
      setMo(false);router.refresh()
    })
  }
  function excluir(id:string){if(!confirm('Excluir?'))return;st(async()=>{await deleteFornecedor(id);router.refresh()})}
  const gForn=(id:string)=>gastos.filter((g:any)=>g.fornecedor_id===id)
  const fi=(k:string,v:string)=>setForm(f=>({...f,[k]:v}))
  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Fornecedores</h1><p className="text-muted-foreground text-sm mt-1">Cadastro e histórico</p></div>
        <Button onClick={openNew}>+ Novo fornecedor</Button>
      </div>
      <input className="w-full max-w-sm px-3 py-2 text-sm rounded-lg border border-border bg-card outline-none focus:border-primary" placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((f:any)=>{
          const gs=gForn(f.id);const total=gs.reduce((s:number,g:any)=>s+Number(g.valor),0);const cor=f.cor||CORES[0]
          return(<div key={f.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mb-3" style={{background:cor+'22',color:cor}}>{f.ini||f.nome.slice(0,2).toUpperCase()}</div>
            <div className="font-semibold text-sm mb-1">{f.nome}</div>
            <div className="text-xs text-muted-foreground mb-3">{f.tipo_servico}</div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>📍 {f.cidade||'—'}</span><span>📞 {f.telefone||'—'}</span>
              <span className="text-amber-400">{'★'.repeat(f.avaliacao||0)}{'☆'.repeat(5-(f.avaliacao||0))}</span>
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-border text-center">
              <div className="flex-1"><div className="font-bold font-mono text-sm text-primary">{gs.length}</div><div className="text-xs text-muted-foreground">Compras</div></div>
              <div className="flex-1"><div className="font-bold font-mono text-sm text-green-500">{brl(total)}</div><div className="text-xs text-muted-foreground">Total</div></div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={()=>openEdit(f)}>✏️ Editar</Button>
              <Button variant="ghost" size="sm" onClick={()=>excluir(f.id)}>🗑️</Button>
            </div>
          </div>)
        })}
        <div className="bg-card border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-80 min-h-[180px]" onClick={openNew}><span className="text-3xl">＋</span><span className="text-sm text-muted-foreground">Novo fornecedor</span></div>
      </div>
      {mo&&(<div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setMo(false)}>
        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-5">{ei?'Editar':'Novo'} Fornecedor</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase">Nome *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.nome} onChange={e=>fi('nome',e.target.value)}/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase">Telefone</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.telefone} onChange={e=>fi('telefone',e.target.value)}/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase">Cidade</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.cidade} onChange={e=>fi('cidade',e.target.value)}/></div>
            <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Serviço</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.tipo_servico} onChange={e=>fi('tipo_servico',e.target.value)}><option>Materiais de construção</option><option>Mão de obra</option><option>Paisagismo</option><option>Perfuração</option><option>Elétrica</option><option>Hidráulica</option><option>Transportes</option><option>Outros</option></select></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase">Avaliação</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.avaliacao} onChange={e=>fi('avaliacao',e.target.value)}><option value="5">⭐⭐⭐⭐⭐</option><option value="4">⭐⭐⭐⭐</option><option value="3">⭐⭐⭐</option><option value="2">⭐⭐</option><option value="1">⭐</option></select></div>
            <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase">Observações</label><textarea className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary resize-none" rows={2} value={form.observacoes} onChange={e=>fi('observacoes',e.target.value)}/></div>
          </div>
          <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={()=>setMo(false)}>Cancelar</Button><Button onClick={salvar} disabled={ip}>{ip?'Salvando...':'Salvar'}</Button></div>
        </div>
      </div>)}
    </div>
  )
}
