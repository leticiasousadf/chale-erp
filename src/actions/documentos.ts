'use server'
import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getDocumentos() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createDocumento(payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('documentos').insert(payload)
  if (error) throw error
  revalidatePath('/documentos')
}

export async function updateDocumento(id: string, payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('documentos').update(payload).eq('id', id)
  if (error) throw error
  revalidatePath('/documentos')
}

export async function deleteDocumento(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('documentos').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/documentos')
}
