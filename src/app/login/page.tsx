'use client'
import{useState}from'react'
import{createClient}from'@/lib/supabase'
import{useRouter}from'next/navigation'

export default function LoginPage(){
  const router=useRouter()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [erro,setErro]=useState('')

  async function handleLogin(e:React.FormEvent){
    e.preventDefault()
    setLoading(true);setErro('')
    const supabase=createClient()
    const{error}=await supabase.auth.signInWithPassword({email,password})
    if(error){setErro('Email ou senha incorretos');setLoading(false);return}
    router.push('/')
    router.refresh()
  }

  return(
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏡</div>
          <h1 className="text-2xl font-bold">Chalé ERP</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão da construção</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-lg font-semibold mb-6">Entrar</h2>
          {erro&&<div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">⚠️ {erro}</div>}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
              <input type="email" required className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Senha</label>
              <input type="password" required className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-border bg-muted text-foreground outline-none focus:border-primary" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors mt-2">
              {loading?'Entrando...':'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
