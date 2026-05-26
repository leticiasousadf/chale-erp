'use server'
import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getEtapas() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('etapas_obra')
    .select('*')
    .order('previsao_inicio')
  if (error) throw error
  return data
}

export async function createEtapa(payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('etapas_obra').insert(payload)
  if (error) throw error
  revalidatePath('/timeline')
}

export async function updateEtapa(id: string, payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('etapas_obra').update(payload).eq('id', id)
  if (error) throw error
  revalidatePath('/timeline')
}

export async function deleteEtapa(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('etapas_obra').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/timeline')
}
