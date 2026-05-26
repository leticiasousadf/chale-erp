'use server'
import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getFornecedores() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .order('nome')
  if (error) throw error
  return data
}

export async function createFornecedor(payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('fornecedores').insert(payload)
  if (error) throw error
  revalidatePath('/fornecedores')
}

export async function updateFornecedor(id: string, payload: Record<string, unknown>) {
  const supabase = createServerClient()
  const { error } = await supabase.from('fornecedores').update(payload).eq('id', id)
  if (error) throw error
  revalidatePath('/fornecedores')
}

export async function deleteFornecedor(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('fornecedores').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/fornecedores')
}
