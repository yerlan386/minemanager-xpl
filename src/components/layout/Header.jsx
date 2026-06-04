import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useAuth } from '../../context/AuthContext'
import { WifiOff, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export function Header({ title }) {
  const isOnline = useOnlineStatus()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-navy text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg pt-safe">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="MineManager XPL" className="h-8 w-auto" />
        {title && <p className="text-xs text-white/60 leading-none hidden sm:block">{title}</p>}
      </div>

      <div className="flex items-center gap-2">
        {!isOnline && (
          <div className="flex items-center gap-1 bg-red-500/20 border border-red-400/30 text-red-300 text-xs px-2 py-1 rounded-full">
            <WifiOff size={12} />
            <span>Offline</span>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-colors"
          >
            <User size={16} />
            <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[180px] z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-semibold text-navy text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); logout() }}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
