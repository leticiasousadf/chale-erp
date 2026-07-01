export const dynamic='force-dynamic'
import{createServerClient}from'@/lib/supabase-server'
import{GastosClient}from'@/components/gastos/gastos-client'
export default async function Page(){
  const s=await createServerClient()
  const[{data:gastos},{data:categorias},{data:centros}]=await Promise.all([
    s.from('gastos').select('*,categorias(nome,cor),centro_custos(nome)').order('data',{ascending:false}),
    s.from('categorias').select('*').order('nome'),
    s.from('centro_custos').select('*').order('nome'),
  ])
  return<GastosClient gastos={gastos??[]}categorias={categorias??[]}centros={centros??[]}/>
}
