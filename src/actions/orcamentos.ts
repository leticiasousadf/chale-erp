'use server'
import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getOrcamentos() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*, categorias(nome,cor), centro_custos(nome)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createOrcamento(payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('orcamentos').insert(payload)
  if (error) throw error
  revalidatePath('/orcamentos')
}

export async function updateOrcamento(id: string, payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('orcamentos').update(payload).eq('id', id)
  if (error) throw error
  revalidatePath('/orcamentos')
}

export async function deleteOrcamento(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('orcamentos').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/orcamentos')
}
