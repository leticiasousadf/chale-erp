import type{Metadata}from'next'
import'./globals.css'
import{ThemeProvider}from'@/components/theme-provider'
import{Sidebar}from'@/components/sidebar'
import{createServerClient}from'@/lib/supabase-server'

export const metadata:Metadata={title:'Chalé ERP',description:'Gestão financeira da construção'}

export default async function RootLayout({children}:{children:React.ReactNode}){
  let userEmail:string|undefined
  try{
    const supabase=await createServerClient()
    const{data:{user}}=await supabase.auth.getUser()
    userEmail=user?.email
  }catch{}
  return(
    <html lang="pt-BR" suppressHydrationWarning>
      <body style={{fontFamily:'system-ui,sans-serif'}}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar userEmail={userEmail}/>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
