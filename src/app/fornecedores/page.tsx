export const dynamic='force-dynamic'
import{createServerClient}from'@/lib/supabase-server'
import{FornecedoresClient}from'@/components/fornecedores/fornecedores-client'
export default async function Page(){
  const s=await createServerClient()
  const[{data:fornecedores},{data:gastos}]=await Promise.all([
    s.from('fornecedores').select('*').order('nome'),
    s.from('gastos').select('fornecedor_id,valor'),
  ])
  return<FornecedoresClient fornecedores={fornecedores??[]}gastos={gastos??[]}/>
}
