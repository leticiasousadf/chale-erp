export const dynamic='force-dynamic'
import{createServerClient}from'@/lib/supabase-server'
import{TimelineClient}from'@/components/timeline/timeline-client'
export default async function Page(){
  const s=await createServerClient()
  const{data:etapas}=await s.from('etapas_obra').select('*').order('previsao_inicio')
  return<TimelineClient etapas={etapas??[]}/>
}
