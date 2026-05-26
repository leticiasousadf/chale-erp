import { createServerClient } from '@/lib/supabase-server'
import { OrcamentosClient } from '@/components/orcamentos/orcamentos-client'

export default async function OrcamentosPage() {
  const supabase = createServerClient()
  const [{ data: orcamentos }, { data: categorias }, { data: centros }, { data: gastos }] = await Promise.all([
    supabase.from('orcamentos').select('*, categorias(nome,cor), centro_custos(nome)').order('created_at', { ascending: false }),
    supabase.from('categorias').select('*').order('nome'),
    supabase.from('centro_custos').select('*').order('nome'),
    supabase.from('gastos').select('valor, categoria_id'),
  ])
  const totalGasto = gastos?.reduce((s, g) => s + Number(g.valor), 0) ?? 0
  return <OrcamentosClient orcamentos={orcamentos ?? []} categorias={categorias ?? []} centros={centros ?? []} totalGasto={totalGasto} />
}
