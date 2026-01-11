'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
    Calendar,
    Building2,
    Ticket,
    AlertCircle,
    BarChart3,
    LogOut,
    Home,
    MessageCircle,
    Users,
    Menu,
    X,
    LayoutDashboard,
    UserCheck,
    Heart
} from 'lucide-react'

interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
    roles?: string[]
}

interface NavSection {
    title: string
    items: NavItem[]
}

const navSections: NavSection[] = [
    {
        title: 'Overview',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
            { href: '/dashboard/roadmap', label: 'My Roadmap', icon: <BarChart3 className="w-5 h-5" /> },
            { href: '/dashboard/caseload', label: 'Caseload', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
        ]
    },
    {
        title: 'Connect',
        items: [
            { href: '/dashboard/schedule', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
            { href: '/dashboard/partners', label: 'Partners', icon: <Building2 className="w-5 h-5" /> },
            { href: '/dashboard/contacts', label: 'My Team', icon: <Users className="w-5 h-5" />, roles: ['cohort', 'admin'] },
            { href: '/dashboard/check-in', label: 'Daily Check-In', icon: <UserCheck className="w-5 h-5" />, roles: ['cohort', 'admin'] },
            { href: '/dashboard/vouchers', label: 'Vouchers', icon: <Ticket className="w-5 h-5" />, roles: ['cohort', 'admin'] },
            { href: '/dashboard/resources', label: 'Community Resources', icon: <Heart className="w-5 h-5" />, roles: ['cohort', 'admin'] },
        ]
    }
]

export function MobileNav({ userRole = 'community' }: { userRole?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const filteredSections = navSections.map(section => ({
        ...section,
        items: section.items.filter(item => !item.roles || item.roles.includes(userRole) || userRole === 'admin')
    })).filter(section => section.items.length > 0)

    return (
        <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
            <div className="flex items-center justify-between p-4">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left ml-2">
                        <span className="text-xl font-black italic tracking-tighter text-gray-900">
                            WE UP <span className="text-indigo-600 not-italic font-normal text-xs ml-1 tracking-normal">BETA</span>
                        </span>
                    </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 top-16 bg-white z-40 overflow-y-auto pb-20 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 space-y-6">
                        {filteredSections.map((section, idx) => (
                            <div key={idx}>
                                <h3 className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link key={item.href} href={item.href}>
                                                <Button
                                                    variant={isActive ? 'secondary' : 'ghost'}
                                                    className={`w-full justify-start h-12 text-lg mb-1 ${isActive
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'text-gray-600'
                                                        }`}
                                                >
                                                    <span className={`mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                        {item.icon}
                                                    </span>
                                                    {item.label}
                                                </Button>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="pt-6 border-t border-gray-100">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-600"
                                onClick={handleSignOut}
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
