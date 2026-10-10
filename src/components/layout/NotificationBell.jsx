import { useEffect, useState } from 'react'
import { Bell, CheckCheck, CircleAlert, CircleCheck, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { getNotifications, markNotificationRead } from '../../api/notificationApi'
import { formatDate } from '../../utils/formatDate'

const iconFor = (severity) =>
  severity === 'warning' ? CircleAlert : severity === 'positive' ? CircleCheck : Info

export function NotificationBell() {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  useEffect(() => {
    getNotifications()
      .then(setItems)
      .catch(() => toast.error('Could not load notifications'))
  }, [])
  const unread = items.filter((item) => !item.read).length
  const markRead = async (item) => {
    if (item.read) return
    try {
      const updated = await markNotificationRead(item.id)
      setItems((all) => all.map((current) => (current.id === item.id ? updated : current)))
    } catch {
      toast.error('Could not update notification')
    }
  }
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-10 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell className="size-[19px]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-4 text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <button
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close notifications"
          />
          <section
            className="absolute right-0 top-12 z-40 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-ink dark:text-white">Notifications</h2>
                <p className="text-xs text-muted">
                  {unread ? `${unread} unread` : 'All caught up'}
                </p>
              </div>
              <CheckCheck className="size-4 text-muted" aria-hidden="true" />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length ? (
                items.map((item) => {
                  const Icon = iconFor(item.severity)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => markRead(item)}
                      className={`flex w-full gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-canvas dark:border-slate-800 dark:hover:bg-slate-800 ${item.read ? 'opacity-65' : ''}`}
                    >
                      <Icon
                        className={`mt-0.5 size-4 shrink-0 ${item.severity === 'warning' ? 'text-amber-600' : item.severity === 'positive' ? 'text-forest' : 'text-sky-600'}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-xs font-bold text-ink dark:text-white">
                          {item.title}
                          {!item.read && <span className="size-1.5 rounded-full bg-forest" />}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted">
                          {item.message}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {formatDate(item.createdAt)}
                        </span>
                      </span>
                    </button>
                  )
                })
              ) : (
                <p className="p-5 text-center text-sm text-muted">No notifications yet.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
