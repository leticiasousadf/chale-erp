'use server'
import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getFotos() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('diario_fotos')
    .select('*, etapas_obra(nome)')
    .order('data', { ascending: false })
  if (error) throw error
  return data
}

export async function createFoto(payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('diario_fotos').insert(payload)
  if (error) throw error
  revalidatePath('/diario')
}

export async function updateFoto(id: string, payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('diario_fotos').update(payload).eq('id', id)
  if (error) throw error
  revalidatePath('/diario')
}

export async function deleteFoto(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('diario_fotos').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/diario')
}
