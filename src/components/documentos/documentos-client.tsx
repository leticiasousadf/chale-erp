'use client'
import{useState,useTransition}from'react'
import{createDocumento,updateDocumento,deleteDocumento}from'@/actions/documentos'
import{Button}from'@/components/ui/button'
import{useRouter}from'next/navigation'
const SUP_URL=process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUP_KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
async function uploadDoc(file:File,token:string):Promise<string>{
  const ext=file.name.split('.').pop();const nome=`${Date.now()}.${ext}`
  const res=await fetch(`${SUP_URL}/storage/v1/object/documentos/${nome}`,{method:'POST',headers:{'apikey':SUP_KEY,'Authorization':`Bearer ${token}`,'Content-Type':file.type},body:file})
  if(!res.ok)throw new Error('Falha no upload')
  return`${SUP_URL}/storage/v1/object/public/documentos/${nome}`
}
const TCOR:Record<string,string>={PDF:'#4f7cff',PNG:'#10b981',JPG:'#10b981',JPEG:'#10b981',XLSX:'#f59e0b',DOC:'#8b5cf6',DOCX:'#8b5cf6'}
const TEMOJI:Record<string,string>={PDF:'📄',PNG:'🖼️',JPG:'🖼️',JPEG:'🖼️',XLSX:'📊',DOC:'📝',DOCX:'📝'}
export function DocumentosClient({documentos}:any){
  const router=useRouter()
  const[ip,st]=useTransition()
  const[mo,setMo]=useState(false)
  const[ei,setEi]=useState<any>(null)
  const[filtro,setFiltro]=useState('')
  const[uploading,setUploading]=useState(false)
  const[arquivo,setArquivo]=useState<File|null>(null)
  const[erro,setErro]=useState('')
  const[form,setForm]=useState({nome:'',pasta:'Contratos',tipo:'PDF',emoji:'📄',arquivo_url:''})
  const pastas=['','Contratos','Notas fiscais','Comprovantes','Projetos','Documentos rurais','Geral']
  const filtered=documentos.filter((d:any)=>!filtro||d.pasta===filtro)
  function openNew(){setEi(null);setArquivo(null);setErro('');setForm({nome:'',pasta:'Contratos',tipo:'PDF',emoji:'📄',arquivo_url:''});setMo(true)}
  function openEdit(d:any){setEi(d);setArquivo(null);setErro('');setForm({nome:d.nome,pasta:d.pasta||'Geral',tipo:d.tipo||'PDF',emoji:d.emoji||'📄',arquivo_url:d.arquivo_url||''});setMo(true)}
  function handleFile(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return;setArquivo(file);setErro('')
    const ext=file.name.split('.').pop()?.toUpperCase()||'PDF'
    setForm(f=>({...f,nome:f.nome||file.name.replace(/\.[^.]+$/,''),tipo:ext,emoji:TEMOJI[ext]||'📄'}))
  }
  async function salvar(){
    if(!form.nome.trim()){setErro('Informe o nome');return}
    setUploading(true);setErro('')
    let arquivo_url=form.arquivo_url
    try{
      if(arquivo){
        const{createClient}=await import('@/lib/supabase')
        const supabase=createClient()
        const{data:{session}}=await supabase.auth.getSession()
        const token=session?.access_token||SUP_KEY
        arquivo_url=await uploadDoc(arquivo,token)
      }
      const payload={nome:form.nome.trim(),pasta:form.pasta,tipo:form.tipo,emoji:form.emoji,arquivo_url:arquivo_url||'sem-arquivo'}
      st(async()=>{if(ei)await updateDocumento(ei.id,payload);else await createDocumento(payload);setMo(false);router.refresh()})
    }catch(e:any){setErro(e.message||'Erro ao salvar')}
    finally{setUploading(false)}
  }
  function excluir(id:string){if(!confirm('Excluir?'))return;st(async()=>{await deleteDocumento(id);router.refresh()})}
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
        {filtered.map((d:any)=>{
          const cor=TCOR[d.tipo]||'#64748b'
          const temArquivo=d.arquivo_url&&d.arquivo_url!=='sem-arquivo'&&d.arquivo_url!=='placeholder'
          return(<div key={d.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 hover:border-primary/50 transition-colors">
            <div className="text-3xl">{d.emoji||'📄'}</div>
            <div className="text-xs font-semibold leading-tight line-clamp-2">{d.nome}</div>
            <div className="text-xs text-muted-foreground">{d.pasta}</div>
            <div className="text-xs font-semibold px-2 py-0.5 rounded w-fit" style={{background:cor+'22',color:cor}}>{d.tipo}</div>
            <div className="flex gap-1 mt-1 flex-wrap">
              {temArquivo&&<a href={d.arquivo_url} target="_blank" rel="noopener noreferrer" className="flex-1"><Button variant="ghost" size="sm" className="text-xs w-full">⬇️ Baixar</Button></a>}
              <Button variant="ghost" size="sm" className="text-xs" onClick={()=>openEdit(d)}>✏️</Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={()=>excluir(d.id)}>🗑️</Button>
            </div>
          </div>)
        })}
        <div className="bg-card border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-80 min-h-[140px]" onClick={openNew}><span className="text-3xl">📎</span><span className="text-xs text-muted-foreground">Novo documento</span></div>
      </div>
      {mo&&(<div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setMo(false)}>
        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-5">{ei?'Editar':'Novo'} Documento</h3>
          {erro&&<div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">⚠️ {erro}</div>}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">📎 Arquivo (opcional)</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx" onChange={handleFile} style={{display:'block',width:'100%',padding:'10px',borderRadius:'8px',border:'2px dashed #334155',background:'transparent',color:'inherit',cursor:'pointer',fontSize:'13px'}}/>
              {arquivo&&<p className="text-xs text-green-500 mt-1">✅ {arquivo.name}</p>}
            </div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase">Nome *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: Contrato Eletricista"/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase">Pasta</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.pasta} onChange={e=>setForm(f=>({...f,pasta:e.target.value}))}><option>Contratos</option><option>Notas fiscais</option><option>Comprovantes</option><option>Projetos</option><option>Documentos rurais</option><option>Geral</option></select></div>
          </div>
          <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={()=>setMo(false)}>Cancelar</Button><Button onClick={salvar} disabled={ip||uploading}>{uploading?'⏳ Enviando...':ip?'Salvando...':'Salvar'}</Button></div>
        </div>
      </div>)}
    </div>
  )
}
