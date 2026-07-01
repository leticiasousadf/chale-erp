export const dynamic='force-dynamic'
import{createServerClient}from'@/lib/supabase-server'
import{CategoriasClient}from'@/components/categorias/categorias-client'
export default async function Page(){
  const s=await createServerClient()
  const[{data:categorias},{data:gastos}]=await Promise.all([
    s.from('categorias').select('*,subcategorias(*)').order('nome'),
    s.from('gastos').select('categoria_id,valor'),
  ])
  return<CategoriasClient categorias={categorias??[]}gastos={gastos??[]}/>
}
