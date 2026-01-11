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
    BarChart3,
    LogOut,
    Home,
    Users,
    UserCheck,
    Heart,
    Sparkles,
    Zap,
    Target,
    TrendingUp
} from 'lucide-react'

// Lux Story Style Integration
// We use a dark aesthetic for the sidebar to contrast with the light dashboard
// Typography: Serif for Brand, Mono for Section Headers
// Items: Styled like "Quest Objectives"

interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
    roles?: string[]
    badge?: string // Lux-style badge (e.g., 'Lvl 1', 'New')
}

interface NavSection {
    title: string // Section Header (e.g., 'HARMONICS' style)
    items: NavItem[]
}

const navSections: NavSection[] = [
    {
        title: 'CORE RESONANCE', // Was 'Overview'
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
            { href: '/dashboard/timeline', label: 'Timeline', icon: <TrendingUp className="w-4 h-4" /> },
            { href: '/dashboard/roadmap', label: 'Life Path', icon: <Target className="w-4 h-4" />, badge: 'Lvl 2' }, // Renamed Roadmap -> Life Path
            { href: '/dashboard/caseload', label: 'Caseload', icon: <Users className="w-4 h-4" />, roles: ['admin'], badge: 'Active' },
        ]
    },
    {
        title: 'CONNECTIONS', // Was 'Connect'
        items: [
            { href: '/dashboard/schedule', label: 'Manage Appointments', icon: <Calendar className="w-4 h-4" /> },
            { href: '/dashboard/partners', label: 'Partner Directory', icon: <Building2 className="w-4 h-4" /> },
            { href: '/dashboard/contacts', label: 'My Squad', icon: <Sparkles className="w-4 h-4" />, roles: ['cohort', 'admin'] }, // Renamed Team -> Squad
            { href: '/dashboard/check-in', label: 'Daily Alignment', icon: <Zap className="w-4 h-4" />, roles: ['cohort', 'admin'] }, // Renamed Check-in -> Alignment
            { href: '/dashboard/vouchers', label: 'Resource Vouchers', icon: <Ticket className="w-4 h-4" />, roles: ['cohort', 'admin'] },
            { href: '/dashboard/resources', label: 'Knowledge Base', icon: <Heart className="w-4 h-4" />, roles: ['cohort', 'admin'] },
            { href: '/dashboard/receipts', label: 'Receipts', icon: <Ticket className="w-4 h-4" /> },
        ]
    }
]

export function SidebarNav({ userRole = 'community' }: { userRole?: string }) {
    const pathname = usePathname()
    const router = useRouter()

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
        <div className="w-72 bg-zinc-950 border-r border-white/10 h-screen flex flex-col fixed left-0 top-0 z-40 hidden md:flex font-sans text-gray-100 shadow-2xl">
            {/* Header: Lux Brand Style */}
            <div className="flex flex-col justify-center h-24 px-6 border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-950">
                <span className="text-2xl font-serif tracking-tight text-white flex items-center gap-2">
                    <span className="text-emerald-400 text-3xl">✻</span> WE UP
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/80 font-mono mt-1 pl-8">
                    Re-Entry OS v1.0
                </span>
            </div>

            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8 no-scrollbar">
                {filteredSections.map((section, idx) => (
                    <div key={idx}>
                        {/* Section Header: Mono, Spaced, Subtle */}
                        <h3 className="mb-4 px-4 text-[10px] font-mono font-bold text-zinc-200 uppercase tracking-[0.2em]">
                            {section.title}
                        </h3>
                        <div className="space-y-2">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link key={item.href} href={item.href} data-nav-link={item.label.toLowerCase()}>
                                        <div
                                            data-nav-label={item.label.toLowerCase()}
                                            className={`group relative flex items-center justify-between w-full p-3 rounded-lg text-sm transition-all duration-300 border ${isActive
                                                ? 'bg-zinc-900 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 hover:border-white/5'
                                                }`}
                                        >
                                            {/* Active Indicator Line */}
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_#10b981]" />
                                            )}

                                            <div className="flex items-center gap-3 relative z-10">
                                                <span className={`${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors`}>
                                                    {item.icon}
                                                </span>
                                                <span className={`font-medium ${isActive ? 'tracking-wide' : ''}`}>
                                                    {item.label}
                                                </span>
                                            </div>

                                            {/* Badge / Status */}
                                            {item.badge && (
                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${isActive
                                                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                                    : 'border-zinc-700 text-zinc-600 bg-zinc-900'
                                                    }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / User Profile Area */}
            <div className="p-4 border-t border-white/10 bg-zinc-900/50">
                <Link href="/dev-mode">
                    <div className="w-full mb-3 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:border-emerald-400/40 hover:text-white transition-colors">
                        Help & Docs
                    </div>
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors h-12"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="font-mono text-xs uppercase tracking-wider">Disconnect</span>
                </Button>
            </div>
        </div>
    )
}
