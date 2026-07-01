import{createServerClient as createSupabaseServerClient}from'@supabase/ssr'
import{cookies}from'next/headers'
export async function createServerClient(){
  const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if(!supabaseUrl||!supabaseAnonKey){
    throw new Error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.')
  }

  const cookieStore=await cookies()
  return createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {cookies:{getAll(){return cookieStore.getAll()},setAll(cookiesToSet){try{cookiesToSet.forEach(({name,value,options})=>cookieStore.set(name,value,options))}catch{}}}}
  )
}
