'use client'
import { useState, useTransition } from 'react'
import { createFoto, updateFoto, deleteFoto } from '@/actions/diario'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const fmtDate = (d: string) => {
  if (!d) return '—'
  const p = d.split('-')
  return `${p[2]}/${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][+p[1]-1]}/${p[0]}`
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function uploadFoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const nome = `${Date.now()}.${ext}`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/fotos/${nome}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type,
    },
    body: file,
  })
  if (!res.ok) throw new Error('Falha no upload')
  return `${SUPABASE_URL}/storage/v1/object/public/fotos/${nome}`
}

export function DiarioClient({ fotos, etapas }: any) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    etapa_id: '',
    descricao: '',
    responsavel: '',
    foto_url: '',
  })

  function openNew() {
    setEditItem(null); setPreview(null); setArquivo(null)
    setForm({ data: new Date().toISOString().split('T')[0], etapa_id: etapas[0]?.id || '', descricao: '', responsavel: '', foto_url: '' })
    setModalOpen(true)
  }

  function openEdit(f: any) {
    setEditItem(f); setArquivo(null)
    setPreview(f.foto_url?.startsWith('http') ? f.foto_url : null)
    setForm({ data: f.data, etapa_id: f.etapa_id || '', descricao: f.descricao || '', responsavel: f.responsavel || '', foto_url: f.foto_url || '' })
    setModalOpen(true)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setArquivo(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSalvar() {
    if (!form.descricao) { alert('Informe a descrição'); return }
    if (!form.data) { alert('Informe a data'); return }
    setUploading(true)
    let foto_url = form.foto_url
    try {
      if (arquivo) foto_url = await uploadFoto(arquivo)
      const payload = { data: form.data, etapa_id: form.etapa_id || null, descricao: form.descricao, responsavel: form.responsavel, foto_url }
      startTransition(async () => {
        if (editItem) await updateFoto(editItem.id, payload)
        else await createFoto(payload)
        setModalOpen(false); router.refresh()
      })
    } catch { alert('Erro no upload. Tente novamente.') }
    finally { setUploading(false) }
  }

  function handleExcluir(id: string) {
    if (!confirm('Excluir?')) return
    startTransition(async () => { await deleteFoto(id); router.refresh() })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Diário Fotográfico</h1><p className="text-muted-foreground text-sm mt-1">Histórico visual da construção</p></div>
        <Button onClick={openNew}>+ Novo registro</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {fotos.map((f: any) => (
          <div key={f.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
            <div className="w-full aspect-video flex items-center justify-center bg-muted overflow-hidden">
              {f.foto_url?.startsWith('http')
                ? <img src={f.foto_url} alt={f.descricao} className="w-full h-full object-cover" />
                : <span className="text-4xl">📷</span>}
            </div>
            <div className="p-3">
              <div className="text-xs text-muted-foreground">{fmtDate(f.data)}</div>
              <div className="text-sm font-medium mt-1 truncate">{f.descricao}</div>
              <div className="text-xs text-primary mt-1">{f.etapas_obra?.nome || 'Geral'}</div>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => openEdit(f)}>✏️ Editar</Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleExcluir(f.id)}>🗑️</Button>
              </div>
            </div>
          </div>
        ))}
        <div className="bg-card border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-80 min-h-[160px] transition-opacity" onClick={openNew}>
          <span className="text-3xl">📷</span><span className="text-xs text-muted-foreground">Novo registro</span>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-5">{editItem ? 'Editar Registro' : 'Novo Registro'}</h3>
            <div className="flex flex-col gap-4">

              {/* Preview */}
              {preview && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Botão de upload visível */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Foto</label>
                <label className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <span className="text-xl">📷</span>
                  <span className="text-sm font-medium">{arquivo ? arquivo.name : 'Selecionar foto do celular ou computador'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data *</label>
                <input type="date" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Etapa da obra</label>
                <select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.etapa_id} onChange={e => setForm(f => ({ ...f, etapa_id: e.target.value }))}>
                  <option value="">Geral</option>
                  {etapas.map((e: any) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descrição *</label>
                <input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="O que aparece nesta foto?" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</label>
                <input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Quem registrou" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSalvar} disabled={isPending || uploading}>
                {uploading ? '⏳ Enviando...' : isPending ? 'Salvando...' : 'Salvar registro'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
