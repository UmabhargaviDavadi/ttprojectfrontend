import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, Moon, Plus, Sun } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { NotificationBell } from './NotificationBell'
import { Button } from '../common/UI'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

const pageNames = {
  '/': 'Overview',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/reports': 'Reports',
  '/plan': 'Your plan',
  '/settings': 'Settings',
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const name = user?.name?.split(' ')[0] || 'there'
  return (
    <div className="min-h-screen bg-canvas text-ink dark:bg-slate-950 dark:text-slate-100">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="min-h-screen lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted">
                {pageNames[location.pathname] || 'Mintwise'}
              </p>
              <p className="hidden truncate text-xs font-semibold text-ink dark:text-white sm:block">
                Good to see you, {name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => window.dispatchEvent(new CustomEvent('finance:quick-add'))}
            >
              <Plus className="size-4" />
              Add transaction
            </Button>
            <button
              className="grid size-10 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink dark:hover:bg-slate-800 dark:hover:text-white"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? (
                <Moon className="size-[18px]" />
              ) : (
                <Sun className="size-[18px]" />
              )}
            </button>
            <NotificationBell />
            <Link
              to="/settings"
              className="grid size-9 place-items-center rounded-full bg-mint font-display text-xs font-extrabold text-forest dark:bg-emerald-950 dark:text-emerald-300"
              aria-label="Open profile settings"
            >
              {user?.name
                ?.split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2) || 'AM'}
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8">
          <Outlet />
        </main>
        <footer className="border-t border-line px-5 py-4 text-center text-xs text-muted dark:border-slate-800">
          A calmer view of your everyday money.
        </footer>
      </div>
    </div>
  )
}
