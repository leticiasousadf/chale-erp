'use server'
import{createServerClient}from'@/lib/supabase-server'
import{revalidatePath}from'next/cache'
export async function createFornecedor(p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('fornecedores').insert(p);if(error)throw error;revalidatePath('/fornecedores')}
export async function updateFornecedor(id:string,p:Record<string,unknown>){const s=await createServerClient();const{error}=await s.from('fornecedores').update(p).eq('id',id);if(error)throw error;revalidatePath('/fornecedores')}
export async function deleteFornecedor(id:string){const s=await createServerClient();const{error}=await s.from('fornecedores').delete().eq('id',id);if(error)throw error;revalidatePath('/fornecedores')}
