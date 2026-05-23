'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Receipt, Tag, Target,
  FolderOpen, Camera, Users, GitBranch,
  BarChart3, Sun, Moon, Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navItems = [
  { href: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/gastos',       label: 'Gastos',       icon: Receipt },
  { href: '/categorias',   label: 'Categorias',   icon: Tag },
  { href: '/orcamentos',   label: 'Orçamentos',   icon: Target },
  { href: '/documentos',   label: 'Documentos',   icon: FolderOpen },
  { href: '/diario',       label: 'Diário',       icon: Camera },
  { href: '/fornecedores', label: 'Fornecedores', icon: Users },
  { href: '/timeline',     label: 'Timeline',     icon: GitBranch },
  { href: '/relatorios',   label: 'Relatórios',   icon: BarChart3 },
]

function NavContent() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b">
        <h1 className="font-bold text-lg tracking-tight">🏡 Chalé ERP</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Gestão da construção</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}>
            <Icon size={17} />{label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t">
        <Button variant="outline" size="sm" className="w-full gap-2"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </Button>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex w-56 border-r flex-col shrink-0 bg-card">
        <NavContent />
      </aside>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu size={20} /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
