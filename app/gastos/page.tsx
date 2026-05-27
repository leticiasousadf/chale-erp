export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase-server'
import { GastosClient } from '@/components/gastos/gastos-client'

export default async function GastosPage() {
  const supabase = createServerClient()
  const [{ data: gastos }, { data: categorias }, { data: centros }, { data: fornecedores }] = await Promise.all([
    supabase.from('gastos').select('*, categorias(nome,cor), centro_custos(nome)').order('data', { ascending: false }),
    supabase.from('categorias').select('*').order('nome'),
    supabase.from('centro_custos').select('*').order('nome'),
    supabase.from('fornecedores').select('*').order('nome'),
  ])
  return <GastosClient gastos={gastos ?? []} categorias={categorias ?? []} centros={centros ?? []} fornecedores={fornecedores ?? []} />
}
