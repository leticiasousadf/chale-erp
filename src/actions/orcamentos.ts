'use server'
import{createServerClient}from'@/lib/supabase-server'
import{revalidatePath}from'next/cache'
export async function createOrcamento(p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('orcamentos').insert(p);if(error)throw error;revalidatePath('/orcamentos')}
export async function updateOrcamento(id:string,p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('orcamentos').update(p).eq('id',id);if(error)throw error;revalidatePath('/orcamentos')}
export async function deleteOrcamento(id:string){const s=await createServerClient();const{error}=await s.from('orcamentos').delete().eq('id',id);if(error)throw error;revalidatePath('/orcamentos')}
