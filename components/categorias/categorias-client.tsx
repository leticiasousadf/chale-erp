'use client'
import { useState, useTransition } from 'react'
import { createCategoria, updateCategoria, deleteCategoria } from '@/actions/categorias'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const brl = (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function CategoriasClient({ categorias, gastos }: any) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ nome: '', icone: '🏷️', cor: '#6366f1' })

  function openNew() { setEditItem(null); setForm({ nome: '', icone: '🏷️', cor: '#6366f1' }); setModalOpen(true) }
  function openEdit(c: any) { setEditItem(c); setForm({ nome: c.nome, icone: c.icone, cor: c.cor }); setModalOpen(true) }

  function handleSalvar() {
    startTransition(async () => {
      if (editItem) await updateCategoria(editItem.id, form.nome, form.icone, form.cor)
      else await createCategoria(form.nome, form.icone, form.cor)
      setModalOpen(false); router.refresh()
    })
  }

  function handleExcluir(id: string) {
    if (!confirm('Excluir esta categoria?')) return
    startTransition(async () => { await deleteCategoria(id); router.refresh() })
  }

  const gastosPorCat = (catId: string) => gastos.filter((g: any) => g.categoria_id === catId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Categorias</h1><p className="text-muted-foreground text-sm mt-1">Organize os tipos de gasto</p></div>
        <Button onClick={openNew}>+ Nova categoria</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map((c: any) => {
          const gs = gastosPorCat(c.id)
          const total = gs.reduce((s: number, g: any) => s + Number(g.valor), 0)
          return (
            <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: c.cor + '22' }}>{c.icone}</div>
                <div>
                  <div className="font-semibold text-sm">{c.nome}</div>
                  <div className="text-xs text-muted-foreground">{gs.length} gastos · {brl(total)}</div>
                </div>
              </div>
              {c.subcategorias?.length > 0 && (
                <div className="flex flex-col gap-1">
                  {c.subcategorias.map((s: any) => <div key={s.id} className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">{s.nome}</div>)}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(c)}>✏️ Editar</Button>
                <Button variant="ghost" size="sm" onClick={() => handleExcluir(c.id)}>🗑️</Button>
              </div>
            </div>
          )
        })}
        <div className="bg-card border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-80 min-h-[120px] transition-opacity" onClick={openNew}>
          <span className="text-3xl">＋</span>
          <span className="text-sm text-muted-foreground">Nova categoria</span>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-5">{editItem ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <div className="flex flex-col gap-4">
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Cobertura" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ícone (emoji)</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.icone} onChange={e => setForm(f => ({ ...f, icone: e.target.value }))} maxLength={2} placeholder="🏠" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cor</label><input type="color" className="w-full mt-1 h-10 rounded-lg border border-border bg-muted cursor-pointer" value={form.cor} onChange={e => setForm(f => ({ ...f, cor: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSalvar} disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
