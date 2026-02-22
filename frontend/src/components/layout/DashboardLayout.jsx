import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, User, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCurrentUser, logout } from '@/api/auth'

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState({ name: 'User', email: '' })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser()
        setUser({
          name: response.data.name || 'User',
          email: response.data.email || ''
        })
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('token')
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {

      localStorage.removeItem('token')
      navigate('/login')
    }
  }

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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 py-1 px-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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