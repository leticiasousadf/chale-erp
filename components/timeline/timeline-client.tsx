'use client'
import { useState, useTransition } from 'react'
import { createEtapa, updateEtapa, deleteEtapa } from '@/actions/timeline'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
const fmtDate=(d:string)=>{if(!d)return'—';const p=d.split('-');return`${p[2]}/${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][+p[1]-1]}/${p[0]}`}
const COR:Record<string,string>={concluido:'#10b981',em_andamento:'#4f7cff',planejado:'#64748b'}
const LABEL:Record<string,string>={concluido:'Concluído',em_andamento:'Em andamento',planejado:'Planejado'}
export function TimelineClient({etapas}:any){
  const router=useRouter()
  const [isPending,startTransition]=useTransition()
  const [modalOpen,setModalOpen]=useState(false)
  const [editItem,setEditItem]=useState<any>(null)
  const [form,setForm]=useState({nome:'',previsao_inicio:'',previsao_fim:'',status:'planejado',percentual:'0',descricao:''})
  function openNew(){setEditItem(null);setForm({nome:'',previsao_inicio:'',previsao_fim:'',status:'planejado',percentual:'0',descricao:''});setModalOpen(true)}
  function openEdit(e:any){setEditItem(e);setForm({nome:e.nome,previsao_inicio:e.previsao_inicio||'',previsao_fim:e.previsao_fim||'',status:e.status,percentual:String(e.percentual||0),descricao:e.descricao||''});setModalOpen(true)}
  function handleSalvar(){
    startTransition(async()=>{
      const payload={...form,percentual:parseInt(form.percentual)||0}
      if(editItem)await updateEtapa(editItem.id,payload)
      else await createEtapa(payload)
      setModalOpen(false);router.refresh()
    })
  }
  function handleExcluir(id:string){if(!confirm('Excluir?'))return;startTransition(async()=>{await deleteEtapa(id);router.refresh()})}
  const conc=etapas.filter((e:any)=>e.status==='concluido').length
  const and=etapas.filter((e:any)=>e.status==='em_andamento').length
  const plan=etapas.filter((e:any)=>e.status==='planejado').length
  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Timeline da Obra</h1><p className="text-muted-foreground text-sm mt-1">Cronograma e progresso</p></div>
        <Button onClick={openNew}>+ Nova etapa</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-5 text-center"><p className="text-2xl font-bold text-green-500">{conc}</p><p className="text-xs text-muted-foreground mt-1">Concluídas</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><p className="text-2xl font-bold text-primary">{and}</p><p className="text-xs text-muted-foreground mt-1">Em andamento</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><p className="text-2xl font-bold text-muted-foreground">{plan}</p><p className="text-xs text-muted-foreground mt-1">Planejadas</p></CardContent></Card>
      </div>
      <div className="flex flex-col gap-0">
        {etapas.length===0&&<div className="text-center py-12 text-muted-foreground">Nenhuma etapa cadastrada</div>}
        {etapas.map((e:any,i:number)=>(
          <div key={e.id} className="grid gap-0" style={{gridTemplateColumns:'130px 1px 1fr',columnGap:'20px'}}>
            <div className="text-right pb-8 pt-0.5">
              <div className="text-xs font-semibold text-muted-foreground">{fmtDate(e.previsao_inicio)}</div>
              <div className="text-xs text-muted-foreground opacity-60 mt-1">{LABEL[e.status]}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-background mt-0.5 flex-shrink-0" style={{background:COR[e.status]}}></div>
              {i<etapas.length-1&&<div className="flex-1 w-0.5 bg-border"></div>}
            </div>
            <div className="pb-8">
              <div className="bg-card border rounded-xl p-4" style={{borderColor:e.status==='em_andamento'?COR[e.status]:''}}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold text-sm">{e.nome}</div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline">{LABEL[e.status]}</Badge>
                    <Button variant="ghost" size="sm" onClick={()=>openEdit(e)}>✏️</Button>
                    <Button variant="ghost" size="sm" onClick={()=>handleExcluir(e.id)}>🗑️</Button>
                  </div>
                </div>
                {e.descricao&&<p className="text-xs text-muted-foreground mb-2">{e.descricao}</p>}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${e.percentual||0}%`,background:COR[e.status]}}></div></div>
                  <span className="text-xs font-mono text-muted-foreground">{e.percentual||0}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modalOpen&&(<div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setModalOpen(false)}>
        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-5">{editItem?'Editar Etapa':'Nova Etapa'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))}/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Início previsto</label><input type="date" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.previsao_inicio} onChange={e=>setForm(f=>({...f,previsao_inicio:e.target.value}))}/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fim previsto</label><input type="date" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.previsao_fim} onChange={e=>setForm(f=>({...f,previsao_fim:e.target.value}))}/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="planejado">Planejado</option><option value="em_andamento">Em andamento</option><option value="concluido">Concluído</option></select></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progresso (%)</label><input type="number" min="0" max="100" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.percentual} onChange={e=>setForm(f=>({...f,percentual:e.target.value}))}/></div>
            <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descrição</label><textarea className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary resize-none" rows={2} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))}/></div>
          </div>
          <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={()=>setModalOpen(false)}>Cancelar</Button><Button onClick={handleSalvar} disabled={isPending}>{isPending?'Salvando...':'Salvar'}</Button></div>
        </div>
      </div>)}
    </div>
  )
}
