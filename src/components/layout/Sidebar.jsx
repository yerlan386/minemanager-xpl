import { NavLink } from 'react-router-dom'
import { Home, Pickaxe, Users, Wrench, ClipboardList, Lock, LogOut, UserCog } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/',           icon: Home,          label: 'Dashboard' },
  { to: '/shift',      icon: Pickaxe,       label: 'Shift' },
  { to: '/hr',         icon: Users,         label: 'HR' },
  { to: '/operations', icon: Wrench,        label: 'Operations' },
  { to: '/compliance', icon: ClipboardList, label: 'Compliance' }
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const goldAccess = ['Owner', 'Mine Manager', 'Metallurgist'].includes(user?.role)

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-navy text-white h-screen sticky top-0 shrink-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-gold font-bold text-xl">MineManager</div>
        <div className="text-white/50 text-xs font-medium">XPL — Celestium Corporate Ltd</div>
      </div>

      <div className="px-3 py-3 border-b border-white/10">
        <div className="bg-white/10 rounded-xl px-3 py-2.5">
          <p className="font-semibold text-sm">{user?.name}</p>
          <p className="text-white/60 text-xs">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-gold text-navy' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        {goldAccess && (
          <NavLink
            to="/goldroom"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-gold text-navy' : 'text-gold/80 hover:bg-gold/10 hover:text-gold'
              }`
            }
          >
            <Lock size={20} />
            Gold Room
          </NavLink>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {user?.role === 'Owner' && (
          <NavLink to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-gold text-navy' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }>
            <UserCog size={20} />
            User Management
          </NavLink>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
