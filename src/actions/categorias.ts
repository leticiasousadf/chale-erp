'use server'
import{createServerClient}from'@/lib/supabase-server'
import{revalidatePath}from'next/cache'
export async function getCategorias(){const s=await createServerClient();const{data,error}=await s.from('categorias').select('*,subcategorias(*)').order('nome');if(error)throw error;return data}
export async function createCategoria(nome:string,icone:string,cor:string){const s=await createServerClient();const{error}=await s.from('categorias').insert({nome,icone,cor});if(error)throw error;revalidatePath('/categorias')}
export async function updateCategoria(id:string,nome:string,icone:string,cor:string){const s=await createServerClient();const{error}=await s.from('categorias').update({nome,icone,cor}).eq('id',id);if(error)throw error;revalidatePath('/categorias')}
export async function deleteCategoria(id:string){const s=await createServerClient();const{error}=await s.from('categorias').delete().eq('id',id);if(error)throw error;revalidatePath('/categorias')}
