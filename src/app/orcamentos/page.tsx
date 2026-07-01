export const dynamic='force-dynamic'
import{createServerClient}from'@/lib/supabase-server'
import{OrcamentosClient}from'@/components/orcamentos/orcamentos-client'
export default async function Page(){
  const s=await createServerClient()
  const[{data:orcamentos},{data:categorias},{data:centros},{data:gastos}]=await Promise.all([
    s.from('orcamentos').select('*,categorias(nome,cor),centro_custos(nome)').order('created_at',{ascending:false}),
    s.from('categorias').select('*').order('nome'),
    s.from('centro_custos').select('*').order('nome'),
    s.from('gastos').select('valor'),
  ])
  const totalGasto=gastos?.reduce((s,g)=>s+Number(g.valor),0)??0
  return<OrcamentosClient orcamentos={orcamentos??[]}categorias={categorias??[]}centros={centros??[]}totalGasto={totalGasto}/>
}
