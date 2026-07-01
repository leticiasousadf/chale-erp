'use server'
import{createServerClient}from'@/lib/supabase-server'
import{redirect}from'next/navigation'
export async function logout(){const s=await createServerClient();await s.auth.signOut();redirect('/login')}
