import { createServerClient } from '@/lib/supabase-server'
import { TimelineClient } from '@/components/timeline/timeline-client'
export default async function TimelinePage() {
  const supabase = createServerClient()
  const { data: etapas } = await supabase.from('etapas_obra').select('*').order('previsao_inicio')
  return <TimelineClient etapas={etapas ?? []} />
}
