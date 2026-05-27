export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase-server'
import { DocumentosClient } from '@/components/documentos/documentos-client'
export default async function DocumentosPage() {
  const supabase = createServerClient()
  const { data: documentos } = await supabase.from('documentos').select('*').order('created_at', { ascending: false })
  return <DocumentosClient documentos={documentos ?? []} />
}
