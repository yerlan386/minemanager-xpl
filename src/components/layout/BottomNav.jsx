import { NavLink } from 'react-router-dom'
import { Home, Pickaxe, Users, Wrench, ClipboardList } from 'lucide-react'

const NAV = [
  { to: '/',            icon: Home,          label: 'Dashboard' },
  { to: '/shift',       icon: Pickaxe,       label: 'Shift' },
  { to: '/hr',          icon: Users,         label: 'HR' },
  { to: '/operations',  icon: Wrench,        label: 'Operations' },
  { to: '/compliance',  icon: ClipboardList, label: 'Compliance' }
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30 pb-safe lg:hidden">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] ${
              isActive ? 'text-navy' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-gold/20' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
