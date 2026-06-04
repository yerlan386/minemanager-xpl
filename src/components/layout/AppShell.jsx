import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
