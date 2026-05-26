'use server'
import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getGastos() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('gastos')
    .select('*, categorias(nome,cor), centro_custos(nome)')
    .order('data', { ascending: false })
  if (error) throw error
  return data
}

export async function createGasto(formData: FormData) {
  const supabase = createServerClient()
  const payload = {
    titulo: formData.get('titulo') as string,
    valor: parseFloat(formData.get('valor') as string),
    data: formData.get('data') as string,
    categoria_id: formData.get('categoria_id') as string || null,
    centro_custo_id: formData.get('centro_custo_id') as string || null,
    fornecedor_id: formData.get('fornecedor_id') as string || null,
    tipo: formData.get('tipo') as string,
    status: formData.get('status') as string,
    forma_pagamento: formData.get('forma_pagamento') as string,
    responsavel: formData.get('responsavel') as string,
    observacoes: formData.get('observacoes') as string,
  }
  const { error } = await supabase.from('gastos').insert(payload)
  if (error) throw error
  revalidatePath('/gastos')
  revalidatePath('/')
}

export async function updateGasto(id: string, formData: FormData) {
  const supabase = createServerClient()
  const payload = {
    titulo: formData.get('titulo') as string,
    valor: parseFloat(formData.get('valor') as string),
    data: formData.get('data') as string,
    categoria_id: formData.get('categoria_id') as string || null,
    centro_custo_id: formData.get('centro_custo_id') as string || null,
    tipo: formData.get('tipo') as string,
    status: formData.get('status') as string,
    forma_pagamento: formData.get('forma_pagamento') as string,
    responsavel: formData.get('responsavel') as string,
    observacoes: formData.get('observacoes') as string,
  }
  const { error } = await supabase.from('gastos').update(payload).eq('id', id)
  if (error) throw error
  revalidatePath('/gastos')
  revalidatePath('/')
}

export async function deleteGasto(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('gastos').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/gastos')
  revalidatePath('/')
}
