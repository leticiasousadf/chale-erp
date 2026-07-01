export const dynamic='force-dynamic'
import{createServerClient}from'@/lib/supabase-server'
import{DiarioClient}from'@/components/diario/diario-client'
export default async function Page(){
  const s=await createServerClient()
  const[{data:fotos},{data:etapas}]=await Promise.all([
    s.from('diario_fotos').select('*,etapas_obra(nome)').order('data',{ascending:false}),
    s.from('etapas_obra').select('id,nome').order('nome'),
  ])
  return<DiarioClient fotos={fotos??[]}etapas={etapas??[]}/>
}
