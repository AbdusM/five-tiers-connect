'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Building2, 
  Ticket, 
  AlertCircle, 
  BarChart3,
  LogOut,
  Home,
  MessageCircle,
  Users
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { href: '/dashboard/schedule', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
  { href: '/dashboard/partners', label: 'Partners', icon: <Building2 className="w-5 h-5" /> },
  { href: '/dashboard/contacts', label: 'Contacts', icon: <Users className="w-5 h-5" />, roles: ['cohort', 'admin'] },
  { href: '/dashboard/vouchers', label: 'Vouchers', icon: <Ticket className="w-5 h-5" />, roles: ['cohort', 'admin'] },
  { href: '/dashboard/receipts', label: 'Receipts', icon: <Ticket className="w-5 h-5" /> },
  { href: '/dashboard/check-in', label: 'Check-In', icon: <MessageCircle className="w-5 h-5" />, roles: ['cohort', 'admin'] },
  { href: '/dashboard/crisis', label: 'Crisis Support', icon: <AlertCircle className="w-5 h-5" />, roles: ['cohort', 'admin'] },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['admin'] },
  { href: '/dev-mode', label: 'Help & Docs', icon: <BarChart3 className="w-5 h-5" /> },
]

export function DashboardNav({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // TEST MODE: Show all nav items (auth is optional)
  // In production, filter by role:
  // const filteredNavItems = navItems.filter(
  //   item => !item.roles || item.roles.includes(userRole)
  // )
  const filteredNavItems = navItems // Show all for testing

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
              Five Tiers Connect
            </Link>
            <div className="flex space-x-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} data-nav-link={item.label.toLowerCase()}>
                    <Button
                      data-nav-label={item.label.toLowerCase()}
                      variant={isActive ? 'default' : 'ghost'}
                      className="h-12 px-4"
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}
