'use client'
import { useState, useTransition } from 'react'
import { createDocumento, updateDocumento, deleteDocumento } from '@/actions/documentos'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
const TIPO_COR:Record<string,string>={PDF:'#4f7cff',PNG:'#10b981',JPG:'#10b981',XLSX:'#f59e0b'}
export function DocumentosClient({documentos}:any){
  const router=useRouter()
  const [isPending,startTransition]=useTransition()
  const [modalOpen,setModalOpen]=useState(false)
  const [editItem,setEditItem]=useState<any>(null)
  const [filtro,setFiltro]=useState('')
  const [form,setForm]=useState({nome:'',pasta:'Contratos',tipo:'PDF',emoji:'📄'})
  const pastas=['','Contratos','Notas fiscais','Comprovantes','Projetos','Documentos rurais','Geral']
  const filtered=documentos.filter((d:any)=>!filtro||d.pasta===filtro)
  function openNew(){setEditItem(null);setForm({nome:'',pasta:'Contratos',tipo:'PDF',emoji:'📄'});setModalOpen(true)}
  function openEdit(d:any){setEditItem(d);setForm({nome:d.nome,pasta:d.pasta||'Geral',tipo:d.tipo||'PDF',emoji:d.emoji||'📄'});setModalOpen(true)}
  function handleSalvar(){
    startTransition(async()=>{
      if(editItem)await updateDocumento(editItem.id,form)
      else await createDocumento({...form,arquivo_url:'placeholder'})
      setModalOpen(false);router.refresh()
    })
  }
  function handleExcluir(id:string){if(!confirm('Excluir?'))return;startTransition(async()=>{await deleteDocumento(id);router.refresh()})}
  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Documentos</h1><p className="text-muted-foreground text-sm mt-1">Contratos, comprovantes e arquivos</p></div>
        <Button onClick={openNew}>+ Upload</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {pastas.map(p=><button key={p} onClick={()=>setFiltro(p)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${filtro===p?'border-primary text-primary bg-primary/10':'border-border text-muted-foreground bg-card'}`}>{p||'Todos'}</button>)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((d:any)=>(
          <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 hover:border-primary/50 transition-colors">
            <div className="text-3xl">{d.emoji||'📄'}</div>
            <div className="text-xs font-semibold leading-tight">{d.nome}</div>
            <div className="text-xs text-muted-foreground">{d.pasta}</div>
            <div className="text-xs font-semibold px-2 py-0.5 rounded w-fit" style={{background:(TIPO_COR[d.tipo]||'#64748b')+'22',color:TIPO_COR[d.tipo]||'#94a3b8'}}>{d.tipo}</div>
            <div className="flex gap-1 mt-1">
              <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={()=>openEdit(d)}>✏️</Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={()=>handleExcluir(d.id)}>🗑️</Button>
            </div>
          </div>
        ))}
        <div className="bg-card border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-80 min-h-[120px] transition-opacity" onClick={openNew}><span className="text-3xl">📎</span><span className="text-xs text-muted-foreground">Novo documento</span></div>
      </div>
      {modalOpen&&(<div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setModalOpen(false)}>
        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-5">{editItem?'Editar Documento':'Novo Documento'}</h3>
          <div className="flex flex-col gap-4">
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: Contrato Eletricista"/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pasta</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.pasta} onChange={e=>setForm(f=>({...f,pasta:e.target.value}))}><option>Contratos</option><option>Notas fiscais</option><option>Comprovantes</option><option>Projetos</option><option>Documentos rurais</option><option>Geral</option></select></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}><option>PDF</option><option>PNG</option><option>JPG</option><option>XLSX</option></select></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Emoji</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.emoji} onChange={e=>setForm(f=>({...f,emoji:e.target.value}))} maxLength={2} placeholder="📄"/></div>
          </div>
          <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={()=>setModalOpen(false)}>Cancelar</Button><Button onClick={handleSalvar} disabled={isPending}>{isPending?'Salvando...':'Salvar'}</Button></div>
        </div>
      </div>)}
    </div>
  )
}
