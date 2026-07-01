'use server'
import{createServerClient}from'@/lib/supabase-server'
import{revalidatePath}from'next/cache'
export async function createEtapa(p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('etapas_obra').insert(p);if(error)throw error;revalidatePath('/timeline')}
export async function updateEtapa(id:string,p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('etapas_obra').update(p).eq('id',id);if(error)throw error;revalidatePath('/timeline')}
export async function deleteEtapa(id:string){const s=await createServerClient();const{error}=await s.from('etapas_obra').delete().eq('id',id);if(error)throw error;revalidatePath('/timeline')}
