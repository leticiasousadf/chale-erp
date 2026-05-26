'use client'
import { useState, useTransition } from 'react'
import { createOrcamento, updateOrcamento, deleteOrcamento } from '@/actions/orcamentos'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

const brl = (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const statusLabel: Record<string, string> = { planejado: 'Planejado', em_negociacao: 'Em negociação', aprovado: 'Aprovado', executado: 'Executado' }
const prioLabel: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

export function OrcamentosClient({ orcamentos, categorias, centros, totalGasto }: any) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ titulo: '', valor_previsto: '', categoria_id: '', centro_custo_id: '', prioridade: 'media', status: 'planejado', observacoes: '' })

  const totalPrevisto = orcamentos.reduce((s: number, o: any) => s + Number(o.valor_previsto), 0)
  const saldo = totalPrevisto - totalGasto

  function openNew() { setEditItem(null); setForm({ titulo: '', valor_previsto: '', categoria_id: categorias[0]?.id || '', centro_custo_id: centros[0]?.id || '', prioridade: 'media', status: 'planejado', observacoes: '' }); setModalOpen(true) }
  function openEdit(o: any) { setEditItem(o); setForm({ titulo: o.titulo, valor_previsto: String(o.valor_previsto), categoria_id: o.categoria_id || '', centro_custo_id: o.centro_custo_id || '', prioridade: o.prioridade, status: o.status, observacoes: o.observacoes || '' }); setModalOpen(true) }

  function handleSalvar() {
    startTransition(async () => {
      const payload = { ...form, valor_previsto: parseFloat(form.valor_previsto) }
      if (editItem) await updateOrcamento(editItem.id, payload)
      else await createOrcamento(payload)
      setModalOpen(false); router.refresh()
    })
  }

  function handleExcluir(id: string) {
    if (!confirm('Excluir este orçamento?')) return
    startTransition(async () => { await deleteOrcamento(id); router.refresh() })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Orçamentos</h1><p className="text-muted-foreground text-sm mt-1">Planejamento financeiro x realizado</p></div>
        <Button onClick={openNew}>+ Novo orçamento</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Previsto</p><p className="text-2xl font-bold font-mono mt-2 text-muted-foreground">{brl(totalPrevisto)}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Realizado</p><p className="text-2xl font-bold font-mono mt-2 text-primary">{brl(totalGasto)}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground uppercase tracking-wide">Saldo</p><p className={`text-2xl font-bold font-mono mt-2 ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>{brl(Math.abs(saldo))}</p><p className="text-xs text-muted-foreground mt-1">{saldo >= 0 ? '✅ Dentro do orçamento' : '⚠️ Acima do previsto'}</p></CardContent></Card>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {orcamentos.length === 0 && <div className="text-center py-12 text-muted-foreground">Nenhum orçamento cadastrado</div>}
          {orcamentos.map((o: any) => {
            const pct = o.valor_previsto > 0 ? Math.min(100, (totalGasto / o.valor_previsto) * 100) : 0
            const cor = pct >= 100 ? '#10b981' : pct > 60 ? '#4f7cff' : '#f59e0b'
            return (
              <div key={o.id} className="p-4 flex items-center gap-4 flex-wrap hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-[180px]">
                  <div className="font-medium text-sm">{o.titulo}</div>
                  <div className="text-xs text-muted-foreground">{o.categorias?.nome || '—'} · {o.centro_custos?.nome || '—'}</div>
                  <div className="h-1.5 bg-muted rounded-full mt-2 w-40 overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cor }}></div></div>
                </div>
                <span className="font-mono text-sm">{brl(o.valor_previsto)}</span>
                <Badge variant={o.prioridade === 'alta' ? 'destructive' : o.prioridade === 'media' ? 'secondary' : 'outline'}>{prioLabel[o.prioridade]}</Badge>
                <Badge variant="outline">{statusLabel[o.status]}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(o)}>✏️</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleExcluir(o.id)}>🗑️</Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-5">{editItem ? 'Editar Orçamento' : 'Novo Orçamento'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} /></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor Previsto *</label><input type="number" step="0.01" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.valor_previsto} onChange={e => setForm(f => ({ ...f, valor_previsto: e.target.value }))} /></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}><option value="">Selecione...</option>{categorias.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Centro de Custo</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.centro_custo_id} onChange={e => setForm(f => ({ ...f, centro_custo_id: e.target.value }))}><option value="">Selecione...</option>{centros.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prioridade</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))}><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="planejado">Planejado</option><option value="em_negociacao">Em negociação</option><option value="aprovado">Aprovado</option><option value="executado">Executado</option></select></div>
              <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observações</label><textarea className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary resize-none" rows={2} value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} /></div>
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
