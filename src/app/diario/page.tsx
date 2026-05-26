import { createServerClient } from '@/lib/supabase-server'
import { DiarioClient } from '@/components/diario/diario-client'
export default async function DiarioPage() {
  const supabase = createServerClient()
  const [{ data: fotos }, { data: etapas }] = await Promise.all([
    supabase.from('diario_fotos').select('*, etapas_obra(nome)').order('data', { ascending: false }),
    supabase.from('etapas_obra').select('id, nome').order('nome'),
  ])
  return <DiarioClient fotos={fotos ?? []} etapas={etapas ?? []} />
}
