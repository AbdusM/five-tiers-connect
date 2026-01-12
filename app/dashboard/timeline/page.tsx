'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { format, differenceInDays } from 'date-fns'
import {
  Calendar,
  CheckCircle2,
  Ticket,
  Users,
  Building2,
  Target,
  TrendingUp,
  Clock,
  Award,
  ArrowRight,
  FileText,
  Receipt
} from 'lucide-react'
import { isDemoMode } from '@/lib/demo-mode'
import { demoAppointments, demoVouchers, demoCheckIns, demoReceipts, demoBusinesses } from '@/lib/demo-data'
import { ResilienceGraph } from '@/features/timeline/components/ResilienceGraph'

interface TimelineEvent {
  id: string
  type: 'appointment' | 'voucher' | 'goal' | 'contact' | 'milestone' | 'check-in' | 'receipt'
  title: string
  description?: string
  date: Date
  status: 'completed' | 'upcoming' | 'in-progress' | 'processed'
  icon: React.ReactNode
  color: string
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'upcoming' | 'in-progress'>('all')

  const supabase = createClient()

  useEffect(() => {
    loadTimeline()
  }, [])

  const loadTimeline = async () => {
    setLoading(true)

    // Check for user session
    const { data: { session } } = await supabase.auth.getSession()

    // ----------------------------------------------------
    // DEMO DATA PATH (No Session or Demo Mode Active)
    // ----------------------------------------------------
    if ((typeof window !== 'undefined' && isDemoMode()) || !session) {
      console.log('Using demo timeline data')
      const demoEvents: TimelineEvent[] = []

      // 1. Map Demo Appointments
      demoAppointments.forEach(apt => {
        demoEvents.push({
          id: apt.id,
          type: 'appointment',
          title: apt.business?.name || 'Appointment',
          description: apt.service_type,
          date: new Date(`${apt.scheduled_date}T${apt.scheduled_time}`),
          status: apt.status as any,
          icon: <Calendar className="w-5 h-5" />,
          color: 'text-blue-400'
        })
      })

      // 2. Map Demo Vouchers
      demoVouchers.forEach(v => {
        demoEvents.push({
          id: v.id,
          type: 'voucher',
          title: `$${v.amount} Voucher`,
          description: demoBusinesses.find(b => b.id === v.business_id)?.name || 'Service voucher',
          date: new Date(v.created_at),
          status: v.status === 'used' ? 'completed' : 'in-progress',
          icon: <Ticket className="w-5 h-5" />,
          color: 'text-purple-400'
        })
      })

      // 3. Map Demo Check-Ins
      demoCheckIns.forEach(c => {
        // Use existing dates or fallback to recent timestamps if missing in demo data
        const date = c.completed_at ? new Date(c.completed_at) : new Date(c.created_at)
        demoEvents.push({
          id: c.id,
          type: 'check-in',
          title: c.type === 'completed' ? 'Check-In Completed' : 'Check-In Requested',
          description: c.notes,
          date: date,
          status: c.type === 'completed' ? 'completed' : 'in-progress',
          icon: <Users className="w-5 h-5" />,
          color: 'text-emerald-400'
        })
      })

      // 4. Map Demo Receipts
      demoReceipts.forEach(r => {
        demoEvents.push({
          id: r.id,
          type: 'receipt',
          title: `Receipt: ${r.merchant}`,
          description: `$${r.amount} - ${r.category}`,
          date: new Date(r.date || r.created_at || new Date().toISOString()),
          status: 'completed',
          icon: <Receipt className="w-5 h-5" />,
          color: 'text-orange-400'
        })
      })


      setEvents(demoEvents.sort((a, b) => b.date.getTime() - a.date.getTime()))
      setLoading(false)
      return
    }

    // ----------------------------------------------------
    // REAL DATA PATH (Authenticated)
    // ----------------------------------------------------
    const user = session.user
    const timelineEvents: TimelineEvent[] = []

    // 1. Fetch Appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*, business:businesses(*)')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false })
      .limit(10)

    appointments?.forEach(apt => {
      timelineEvents.push({
        id: apt.id,
        type: 'appointment',
        title: `${apt.business?.name || 'Appointment'}`,
        description: apt.service_type || (apt.status === 'completed' ? 'Completed appointment' : 'Scheduled appointment'),
        date: new Date(`${apt.scheduled_date}T${apt.scheduled_time}`),
        status: apt.status === 'completed' ? 'completed' : apt.status === 'confirmed' ? 'upcoming' : 'in-progress',
        icon: <Calendar className="w-5 h-5" />,
        color: 'text-blue-400'
      })
    })

    // 2. Fetch Vouchers
    const { data: vouchers } = await supabase
      .from('vouchers')
      .select('*, business:businesses(*)')
      .eq('cohort_member_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    vouchers?.forEach(v => {
      timelineEvents.push({
        id: v.id,
        type: 'voucher',
        title: `$${v.amount} Voucher`,
        description: (v as any).business?.name || 'Service voucher',
        date: new Date(v.created_at),
        status: v.status === 'used' ? 'completed' : v.status === 'active' ? 'in-progress' : 'completed',
        icon: <Ticket className="w-5 h-5" />,
        color: 'text-purple-400'
      })
    })

    // 3. Fetch Check-ins
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    checkIns?.forEach(c => {
      const date = c.completed_at ? new Date(c.completed_at) : new Date(c.created_at)
      timelineEvents.push({
        id: c.id,
        type: 'check-in',
        title: c.type === 'completed' ? 'Check-In Completed' : 'Check-In Requested',
        description: c.notes || 'Routine check-in',
        date: date,
        status: c.type === 'completed' ? 'completed' : 'in-progress',
        icon: <Users className="w-5 h-5" />,
        color: 'text-emerald-400'
      })
    })

    setEvents(timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime()))
    setLoading(false)
  }

  const filteredEvents = events.filter(e => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'completed') return e.status === 'completed' || e.status === 'processed'
    if (selectedFilter === 'upcoming') return e.status === 'upcoming'
    if (selectedFilter === 'in-progress') return e.status === 'in-progress'
    return true
  })

  // Simple stats calculation
  const completedCount = events.filter(e => e.status === 'completed' || e.status === 'processed').length
  const upcomingCount = events.filter(e => e.status === 'upcoming').length
  const inProgressCount = events.filter(e => e.status === 'in-progress').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'processed':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono uppercase tracking-wider text-[10px]">Completed</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono uppercase tracking-wider text-[10px]">Upcoming</Badge>
      case 'in-progress':
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 font-mono uppercase tracking-wider text-[10px]">Active</Badge>
      default:
        return null
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const daysDiff = differenceInDays(now, date)

    if (daysDiff === 0) return 'Today'
    if (daysDiff === 1) return 'Yesterday'
    if (daysDiff === -1) return 'Tomorrow'
    if (daysDiff > 0 && daysDiff <= 7) return `${daysDiff} days ago`
    if (daysDiff > 7 && daysDiff <= 30) return `${Math.floor(daysDiff / 7)} weeks ago`

    // Future dates
    const futureDays = Math.abs(daysDiff)
    if (futureDays <= 7) return `In ${futureDays} days`
    return format(date, 'MMM d, yyyy')
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em]">Chronicle</h2>
        <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight flex items-center gap-3">
          Activity Timeline
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Visual record of your progress, appointments, and milestones.
        </p>
      </div>

      {/* Featured Graph - Apple Style */}
      <div className="glass-panel p-0 overflow-hidden rounded-xl border-white/10 relative animate-border-marquee">
        <ResilienceGraph />
      </div>

      {/* Stats Summary - Glass Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Completed</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{completedCount}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500/20" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-orange-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Active</p>
              <p className="text-2xl font-bold text-orange-400 mt-1 font-mono">{inProgressCount}</p>
            </div>
            <Clock className="w-6 h-6 text-orange-500/20" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Upcoming</p>
              <p className="text-2xl font-bold text-blue-400 mt-1 font-mono">{upcomingCount}</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-500/20" />
          </div>
        </div>
      </div>

      {/* Filter Tabs - Pill Style */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'All Activity', count: events.length },
          { id: 'completed', label: 'Completed', count: completedCount, color: 'text-emerald-400' },
          { id: 'in-progress', label: 'Active', count: inProgressCount, color: 'text-orange-400' },
          { id: 'upcoming', label: 'Upcoming', count: upcomingCount, color: 'text-blue-400' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id as any)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wide rounded-full border transition-all ${selectedFilter === filter.id
              ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg'
              : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
              }`}
          >
            {filter.label} <span className="opacity-50 ml-1">({filter.count})</span>
          </button>
        ))}
      </div>

      {/* Timeline Feed */}
      {loading ? (
        <div className="glass-panel p-12 text-center text-zinc-500 font-mono text-sm animate-pulse">
          Initializing timeline data...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-xl border-white/5">
          <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <TrendingUp className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-serif text-zinc-200 mb-2">No activity recorded</h3>
          <p className="text-zinc-500 text-sm font-mono max-w-sm mx-auto">
            Your timeline will populate as you book appointments, receive vouchers, and hit milestones.
          </p>
        </div>
      ) : (
        <div className="relative pl-4 md:pl-8">
          {/* Vertical Line */}
          <div className="absolute left-[27px] md:left-[43px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/20 via-blue-500/20 to-transparent" />

          <div className="space-y-8">
            {filteredEvents.map((event, index) => {
              const isToday = differenceInDays(new Date(), event.date) === 0

              return (
                <div key={event.id} className="relative flex gap-6 group">

                  {/* Timeline Node */}
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300 ${event.status === 'completed' || event.status === 'processed'
                      ? 'bg-zinc-900 border-emerald-500/20 group-hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : event.status === 'upcoming'
                        ? 'bg-zinc-900 border-blue-500/20 group-hover:border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-zinc-900 border-orange-500/20 group-hover:border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                      }`}>
                      <div className={event.color}>
                        {event.icon}
                      </div>
                    </div>
                    {isToday && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Event Card */}
                  <div className={`flex-1 glass-panel p-5 rounded-xl border border-white/5 group-hover:border-white/10 transition-all duration-300 ${isToday ? 'bg-zinc-800/30' : ''
                    }`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-serif text-zinc-100 group-hover:text-white transition-colors">{event.title}</h3>
                          {getStatusBadge(event.status)}
                        </div>
                        {event.description && (
                          <p className="text-zinc-400 text-sm mb-3 font-mono leading-relaxed">{event.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>{format(event.date, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{getRelativeTime(event.date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Icon for Upcoming */}
                      {event.status === 'upcoming' && (
                        <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-zinc-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
