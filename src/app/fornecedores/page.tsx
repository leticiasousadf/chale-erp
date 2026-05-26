import { createServerClient } from '@/lib/supabase-server'
import { FornecedoresClient } from '@/components/fornecedores/fornecedores-client'
export default async function FornecedoresPage() {
  const supabase = createServerClient()
  const [{ data: fornecedores }, { data: gastos }] = await Promise.all([
    supabase.from('fornecedores').select('*').order('nome'),
    supabase.from('gastos').select('fornecedor_id, valor'),
  ])
  return <FornecedoresClient fornecedores={fornecedores ?? []} gastos={gastos ?? []} />
}
