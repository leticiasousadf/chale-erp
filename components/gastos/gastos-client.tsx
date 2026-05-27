'use client'
import { useState, useTransition } from 'react'
import { createGasto, updateGasto, deleteGasto } from '@/actions/gastos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

const brl = (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (d: string) => { if (!d) return '—'; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}` }

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  pago: 'default', pendente: 'secondary', parcelado: 'outline'
}

export function GastosClient({ gastos, categorias, centros, fornecedores }: any) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [form, setForm] = useState({ titulo: '', valor: '', data: new Date().toISOString().split('T')[0], categoria_id: '', centro_custo_id: '', tipo: 'produto', status: 'pago', forma_pagamento: 'PIX', responsavel: '', observacoes: '' })

  const filtered = gastos.filter((g: any) => {
    if (filtroStatus && g.status !== filtroStatus) return false
    if (search && !g.titulo.toLowerCase().includes(search.toLowerCase()) && !(g.fornecedores?.nome || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function openNew() { setEditItem(null); setForm({ titulo: '', valor: '', data: new Date().toISOString().split('T')[0], categoria_id: categorias[0]?.id || '', centro_custo_id: centros[0]?.id || '', tipo: 'produto', status: 'pago', forma_pagamento: 'PIX', responsavel: '', observacoes: '' }); setModalOpen(true) }
  function openEdit(g: any) { setEditItem(g); setForm({ titulo: g.titulo, valor: String(g.valor), data: g.data, categoria_id: g.categoria_id || '', centro_custo_id: g.centro_custo_id || '', tipo: g.tipo, status: g.status, forma_pagamento: g.forma_pagamento || 'PIX', responsavel: g.responsavel || '', observacoes: g.observacoes || '' }); setModalOpen(true) }

  function handleSalvar() {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    startTransition(async () => {
      if (editItem) await updateGasto(editItem.id, fd)
      else await createGasto(fd)
      setModalOpen(false); router.refresh()
    })
  }

  function handleExcluir(id: string) {
    if (!confirm('Excluir este gasto?')) return
    startTransition(async () => { await deleteGasto(id); router.refresh() })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Gastos</h1><p className="text-muted-foreground text-sm mt-1">Todos os lançamentos da obra</p></div>
        <Button onClick={openNew}>+ Novo gasto</Button>
      </div>

      {/* Busca e filtros */}
      <div className="flex gap-3 flex-wrap">
        <input className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground outline-none focus:border-primary" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="flex gap-2 flex-wrap">
        {['', 'pago', 'pendente', 'parcelado'].map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${filtroStatus === s ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground bg-card'}`}>
            {s === '' ? 'Todos' : s}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Centro</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Data</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Nenhum gasto encontrado</td></tr>}
              {filtered.map((g: any) => (
                <tr key={g.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3"><div className="font-medium">{g.titulo}</div><div className="text-xs text-muted-foreground">{g.tipo}</div></td>
                  <td className="p-3"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.categorias?.cor || '#94a3b8' }}></span>{g.categorias?.nome || '—'}</div></td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{g.centro_custos?.nome || '—'}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">{fmtDate(g.data)}</td>
                  <td className="p-3"><Badge variant={statusVariant[g.status]}>{g.status}</Badge></td>
                  <td className="p-3 text-right font-mono font-semibold whitespace-nowrap">{brl(g.valor)}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(g)}>✏️</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleExcluir(g.id)}>🗑️</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-5">{editItem ? 'Editar Gasto' : 'Novo Gasto'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título *</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Cimento CP-II" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor *</label><input type="number" step="0.01" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0.00" /></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data *</label><input type="date" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} /></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}><option value="">Selecione...</option>{categorias.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Centro de Custo</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.centro_custo_id} onChange={e => setForm(f => ({ ...f, centro_custo_id: e.target.value }))}><option value="">Selecione...</option>{centros.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}><option value="produto">Produto</option><option value="servico">Serviço</option></select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="pago">Pago</option><option value="pendente">Pendente</option><option value="parcelado">Parcelado</option></select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pagamento</label><select className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.forma_pagamento} onChange={e => setForm(f => ({ ...f, forma_pagamento: e.target.value }))}><option>PIX</option><option>Dinheiro</option><option>Cartão</option><option>Boleto</option><option>Transferência</option></select></div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</label><input className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Quem pagou" /></div>
              <div className="col-span-2"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observações</label><textarea className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary resize-none" rows={2} value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Opcional..." /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSalvar} disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar gasto'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
