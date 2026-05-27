'use client'
import { useState, useTransition, useRef } from 'react'
import { createDocumento, updateDocumento, deleteDocumento } from '@/actions/documentos'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function uploadArquivo(file: File, bucket: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${nome}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type,
    },
    body: file,
  })
  if (!res.ok) throw new Error('Falha no upload')
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${nome}`
}

const TIPO_COR: Record<string, string> = { PDF: '#4f7cff', PNG: '#10b981', JPG: '#10b981', JPEG: '#10b981', XLSX: '#f59e0b', XLS: '#f59e0b', DOC: '#8b5cf6', DOCX: '#8b5cf6' }
const EMOJI: Record<string, string> = { PDF: '📄', PNG: '🖼️', JPG: '🖼️', JPEG: '🖼️', XLSX: '📊', XLS: '📊', DOC: '📝', DOCX: '📝' }

export function DocumentosClient({ documentos }: any) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [filtro, setFiltro] = useState('')
  const [uploading, setUploading] = useState(false)
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ nome: '', pasta: 'Contratos', tipo: 'PDF', emoji: '📄', arquivo_url: '' })

  const pastas = ['', 'Contratos', 'Notas fiscais', 'Comprovantes', 'Projetos', 'Documentos rurais', 'Geral']
  const filtered = documentos.filter((d: any) => !filtro || d.pasta === filtro)

  function openNew() {
    setEditItem(null)
    setArquivoSelecionado(null)
    setForm({ nome: '', pasta: 'Contratos', tipo: 'PDF', emoji: '📄', arquivo_url: '' })
    setModalOpen(true)
  }

  function openEdit(d: any) {
    setEditItem(d)
    setArquivoSelecionado(null)
    setForm({ nome: d.nome, pasta: d.pasta || 'Geral', tipo: d.tipo || 'PDF', emoji: d.emoji || '📄', arquivo_url: d.arquivo_url || '' })
    setModalOpen(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setArquivoSelecionado(file)
    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF'
    const nomeAuto = form.nome || file.name.replace(/\.[^.]+$/, '')
    setForm(f => ({
      ...f,
      nome: nomeAuto,
      tipo: ext,
      emoji: EMOJI[ext] || '📄',
    }))
  }

  async function handleSalvar() {
    if (!form.nome) { alert('Informe o nome do documento'); return }
    setUploading(true)
    let arquivo_url = form.arquivo_url

    try {
      if (arquivoSelecionado) {
        arquivo_url = await uploadArquivo(arquivoSelecionado, 'documentos')
      }
      const payload = { ...form, arquivo_url: arquivo_url || 'placeholder' }
      startTransition(async () => {
        if (editItem) await updateDocumento(editItem.id, payload)
        else await createDocumento(payload)
        setModalOpen(false)
        router.refresh()
      })
    } catch {
      alert('Erro no upload. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  function handleExcluir(id: string) {
    if (!confirm('Excluir este documento?')) return
    startTransition(async () => { await deleteDocumento(id); router.refresh() })
  }

  const isImagem = (url: string) => url && (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg'))
  const isPdf = (url: string) => url && url.includes('.pdf')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Documentos</h1><p className="text-muted-foreground text-sm mt-1">Contratos, comprovantes e arquivos da obra</p></div>
        <Button onClick={openNew}>+ Upload</Button>
      </div>

      {/* Filtros por pasta */}
      <div className="flex gap-2 flex-wrap">
        {pastas.map(p => (
          <button key={p} onClick={() => setFiltro(p)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${filtro === p ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground bg-card'}`}>
            {p || 'Todos'}
          </button>
        ))}
      </div>

      {/* Grid de documentos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((d: any) => {
          const cor = TIPO_COR[d.tipo] || '#64748b'
          const temArquivo = d.arquivo_url && d.arquivo_url !== 'placeholder'
          return (
            <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 hover:border-primary/50 transition-colors">
              {/* Preview */}
              {temArquivo && isImagem(d.arquivo_url)
                ? <img src={d.arquivo_url} alt={d.nome} className="w-full aspect-video object-cover rounded-lg" />
                : <div className="text-3xl">{d.emoji || '📄'}</div>
              }
              <div className="text-xs font-semibold leading-tight line-clamp-2">{d.nome}</div>
              <div className="text-xs text-muted-foreground">{d.pasta}</div>
              <div className="text-xs font-semibold px-2 py-0.5 rounded w-fit" style={{ background: cor + '22', color: cor }}>{d.tipo}</div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {temArquivo && (
                  <a href={d.arquivo_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="text-xs">⬇️ Baixar</Button>
                  </a>
                )}
                <Button variant="ghost" size="sm" className="text-xs flex-1" onClick={() => openEdit(d)}>✏️</Button>
                <Button variant="ghost" size="sm" className="text-xs text-red-500" onClick={() => handleExcluir(d.id)}>🗑️</Button>
              </div>
            </div>
          )
        })}
        <div
          className="bg-card border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-80 min-h-[140px] transition-opacity"
          onClick={openNew}
        >
          <span className="text-3xl">📎</span>
          <span className="text-xs text-muted-foreground">Novo documento</span>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-5">{editItem ? 'Editar Documento' : 'Novo Documento'}</h3>
            <div className="flex flex-col gap-4">

              {/* Upload de arquivo */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Arquivo</label>
                <div
                  className="mt-1 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors text-muted-foreground"
                  onClick={() => fileRef.current?.click()}
                >
                  {arquivoSelecionado
                    ? <><span className="text-2xl">✅</span><span className="text-sm font-medium text-foreground">{arquivoSelecionado.name}</span><span className="text-xs">Clique para trocar</span></>
                    : form.arquivo_url && form.arquivo_url !== 'placeholder'
                      ? <><span className="text-2xl">📎</span><span className="text-xs">Arquivo atual — clique para substituir</span></>
                      : <><span className="text-3xl">📎</span><span className="text-sm">Clique para selecionar arquivo</span><span className="text-xs opacity-60">PDF, PNG, JPG, XLSX, DOCX</span></>
                  }
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx" className="hidden" onChange={handleFileChange} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome *</label>
                <input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Contrato Eletricista" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pasta</label>
                <select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.pasta} onChange={e => setForm(f => ({ ...f, pasta: e.target.value }))}>
                  <option>Contratos</option><option>Notas fiscais</option><option>Comprovantes</option><option>Projetos</option><option>Documentos rurais</option><option>Geral</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSalvar} disabled={isPending || uploading}>
                {uploading ? '⏳ Enviando arquivo...' : isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
