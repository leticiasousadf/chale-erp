export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase-server'
import { CategoriasClient } from '@/components/categorias/categorias-client'

export default async function CategoriasPage() {
  const supabase = createServerClient()
  const [{ data: categorias }, { data: gastos }] = await Promise.all([
    supabase.from('categorias').select('*, subcategorias(*)').order('nome'),
    supabase.from('gastos').select('categoria_id, valor'),
  ])
  return <CategoriasClient categorias={categorias ?? []} gastos={gastos ?? []} />
}
