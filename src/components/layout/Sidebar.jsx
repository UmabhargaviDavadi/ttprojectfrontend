import { NavLink, Link } from 'react-router-dom'
import { CircleUserRound, Leaf, PanelLeftClose, X } from 'lucide-react'
import { NAV_ITEMS } from '../../utils/constants'

export function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-ink/35 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-line bg-white px-4 py-5 transition-transform dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main navigation"
      >
        <div className="flex h-11 items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="grid size-9 place-items-center rounded-xl bg-forest text-white">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink dark:text-white">
              mintwise<span className="text-forest">.</span>
            </span>
          </Link>
          <button
            className="rounded-lg p-2 text-muted hover:bg-canvas lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
          <PanelLeftClose className="hidden size-4 text-slate-300 lg:block" aria-hidden="true" />
        </div>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </div>
        <nav className="mt-2 space-y-1" aria-label="Workspace">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? 'bg-mint text-forest dark:bg-emerald-950 dark:text-emerald-300' : 'text-muted hover:bg-canvas hover:text-ink dark:hover:bg-slate-900 dark:hover:text-white'}`
              }
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-line bg-canvas p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2 text-forest dark:text-emerald-300">
            <CircleUserRound className="size-4" />
            <span className="text-xs font-bold">Your money, in focus</span>
          </div>
          <p className="text-xs leading-5 text-muted">
            Small, steady choices make room for bigger plans.
          </p>
        </div>
        <Link
          to="/settings"
          onClick={onClose}
          className="mt-3 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted hover:bg-canvas hover:text-ink dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <CircleUserRound className="size-[18px]" />
          Profile & settings
        </Link>
      </aside>
    </>
  )
}
