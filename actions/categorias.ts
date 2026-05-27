'use server'
import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getCategorias() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('*, subcategorias(*)')
    .order('nome')
  if (error) throw error
  return data
}

export async function createCategoria(nome: string, icone: string, cor: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('categorias').insert({ nome, icone, cor })
  if (error) throw error
  revalidatePath('/categorias')
}

export async function updateCategoria(id: string, nome: string, icone: string, cor: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('categorias').update({ nome, icone, cor }).eq('id', id)
  if (error) throw error
  revalidatePath('/categorias')
}

export async function deleteCategoria(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/categorias')
}
