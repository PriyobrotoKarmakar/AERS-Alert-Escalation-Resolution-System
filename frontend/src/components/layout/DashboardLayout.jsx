import { Outlet, useLocation } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"

const DashboardLayout = () => {
  const location = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 h-screen w-full">
        <header className="h-16 border-b bg-white dark:bg-slate-950 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold capitalize text-slate-800 dark:text-slate-100">
              {location.pathname.replace('/', '')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Button>
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 py-1 px-3 rounded-full">
              <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">System Admin</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}

export default DashboardLayout