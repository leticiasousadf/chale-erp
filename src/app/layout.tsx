import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/sidebar'

export const metadata: Metadata = {
  title: 'Chalé ERP',
  description: 'Gestão financeira da construção',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
