'use server'
import{createServerClient}from'@/lib/supabase-server'
import{revalidatePath}from'next/cache'
export async function createFoto(p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('diario_fotos').insert(p);if(error)throw error;revalidatePath('/diario')}
export async function updateFoto(id:string,p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('diario_fotos').update(p).eq('id',id);if(error)throw error;revalidatePath('/diario')}
export async function deleteFoto(id:string){const s=await createServerClient();const{error}=await s.from('diario_fotos').delete().eq('id',id);if(error)throw error;revalidatePath('/diario')}
