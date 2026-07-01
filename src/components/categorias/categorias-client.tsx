'use client'
import{useState,useTransition}from'react'
import{createCategoria,updateCategoria,deleteCategoria}from'@/actions/categorias'
import{Button}from'@/components/ui/button'
import{useRouter}from'next/navigation'
const brl=(v:number)=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export function CategoriasClient({categorias,gastos}:any){
  const router=useRouter()
  const[ip,st]=useTransition()
  const[mo,setMo]=useState(false)
  const[ei,setEi]=useState<any>(null)
  const[form,setForm]=useState({nome:'',icone:'🏷️',cor:'#6366f1'})
  function openNew(){setEi(null);setForm({nome:'',icone:'🏷️',cor:'#6366f1'});setMo(true)}
  function openEdit(c:any){setEi(c);setForm({nome:c.nome,icone:c.icone,cor:c.cor});setMo(true)}
  function salvar(){st(async()=>{if(ei)await updateCategoria(ei.id,form.nome,form.icone,form.cor);else await createCategoria(form.nome,form.icone,form.cor);setMo(false);router.refresh()})}
  function excluir(id:string){if(!confirm('Excluir?'))return;st(async()=>{await deleteCategoria(id);router.refresh()})}
  const gCat=(id:string)=>gastos.filter((g:any)=>g.categoria_id===id)
  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Categorias</h1><p className="text-muted-foreground text-sm mt-1">Organize os tipos de gasto</p></div>
        <Button onClick={openNew}>+ Nova categoria</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map((c:any)=>{const gs=gCat(c.id);const total=gs.reduce((s:number,g:any)=>s+Number(g.valor),0);return(
          <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:c.cor+'22'}}>{c.icone}</div>
              <div><div className="font-semibold text-sm">{c.nome}</div><div className="text-xs text-muted-foreground">{gs.length} gastos · {brl(total)}</div></div>
            </div>
            {c.subcategorias?.length>0&&<div className="flex flex-col gap-1">{c.subcategorias.map((s:any)=><div key={s.id} className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">{s.nome}</div>)}</div>}
            <div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1" onClick={()=>openEdit(c)}>✏️ Editar</Button><Button variant="ghost" size="sm" onClick={()=>excluir(c.id)}>🗑️</Button></div>
          </div>
        )})}
        <div className="bg-card border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-80 min-h-[120px]" onClick={openNew}><span className="text-3xl">＋</span><span className="text-sm text-muted-foreground">Nova categoria</span></div>
      </div>
      {mo&&(<div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setMo(false)}>
        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
          <h3 className="text-lg font-bold mb-5">{ei?'Editar':'Nova'} Categoria</h3>
          <div className="flex flex-col gap-4">
            <div><label className="text-xs font-semibold text-muted-foreground uppercase">Nome *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))}/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase">Ícone (emoji)</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.icone} onChange={e=>setForm(f=>({...f,icone:e.target.value}))} maxLength={2}/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase">Cor</label><input type="color" className="w-full mt-1 h-10 rounded-lg border border-border cursor-pointer" value={form.cor} onChange={e=>setForm(f=>({...f,cor:e.target.value}))}/></div>
          </div>
          <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={()=>setMo(false)}>Cancelar</Button><Button onClick={salvar} disabled={ip}>{ip?'Salvando...':'Salvar'}</Button></div>
        </div>
      </div>)}
    </div>
  )
}
