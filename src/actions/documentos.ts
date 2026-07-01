'use server'
import{createServerClient}from'@/lib/supabase-server'
import{revalidatePath}from'next/cache'
export async function createDocumento(p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('documentos').insert({nome:p.nome,pasta:p.pasta||'Geral',tipo:p.tipo||'PDF',emoji:p.emoji||'📄',arquivo_url:p.arquivo_url||'sem-arquivo'});if(error)throw new Error(error.message);revalidatePath('/documentos')}
export async function updateDocumento(id:string,p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('documentos').update(p).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/documentos')}
export async function deleteDocumento(id:string){const s=await createServerClient();const{error}=await s.from('documentos').delete().eq('id',id);if(error)throw error;revalidatePath('/documentos')}
