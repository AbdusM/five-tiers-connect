import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Building2, Ticket, AlertCircle, Flame, Trophy } from 'lucide-react'
import { MindsetLog } from '@/features/cognitive-support/components/MindsetLog'
import { GuiltyReminderWidget } from '@/features/contacts/components/GuiltyReminderWidget'
import { PartnerDirectoryWidget } from '@/features/partners/components/PartnerDirectoryWidget'

import { format } from 'date-fns'
import { demoAppointments } from '@/lib/demo-data'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } = { user: null } } = await supabase.auth.getUser()

  let profile: { full_name: string; role: 'admin' | 'cohort' | 'community' } = {
    full_name: 'Test Scout',
    role: 'admin'
  }

  if (user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    if (userProfile) profile = userProfile
  }

  // Get next appointment
  const { data: appointments } = user
    ? await supabase
      .from('appointments')
      .select('*, business:businesses(*)')
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .order('scheduled_date', { ascending: true })
      .limit(1)
    : { data: [] }

  const nextAppt = (appointments && appointments[0]) || (!user ? demoAppointments[0] : null)

  const abilities = [
    { href: '/dashboard/schedule', label: 'Book Appointment', icon: Calendar, color: 'text-blue-400', glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50' },
    { href: '/dashboard/partners', label: 'Partner Network', icon: Building2, color: 'text-emerald-400', glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:border-emerald-500/50' },
  ]

  if (profile?.role === 'cohort' || profile?.role === 'admin') {
    abilities.push(
      { href: '/dashboard/vouchers', label: 'Vouchers', icon: Ticket, color: 'text-purple-400', glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:border-purple-500/50' },
      { href: '/dashboard/resources', label: 'Crisis Support', icon: AlertCircle, color: 'text-red-400', glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:border-red-500/50' }
    )
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero Section: "Mission Brief" */}
      <div className="border-b border-white/5 pb-6 animate-border-marquee rounded-xl p-6 bg-zinc-900/50">
        <h2 className="text-xs font-mono text-emerald-500/70 tracking-[0.2em] mb-2 uppercase">Protocol Initiated</h2>
        <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Scout'}.
        </h1>
        {nextAppt ? (
          <p className="mt-2 text-zinc-400 font-mono text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Next Signal: {nextAppt.business?.name} ({new Date(nextAppt.scheduled_date).toLocaleDateString()})
          </p>
        ) : (
          <p className="mt-2 text-zinc-500 text-lg">Systems online. Ready for your next move.</p>
        )}
      </div>

      {/* Primary Priority: Guilty Reminder */}
      <GuiltyReminderWidget />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: Abilities (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest pl-1">Available Abilities</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {abilities.map((ability) => {
              const Icon = ability.icon
              return (
                <Link key={ability.href} href={ability.href}>
                  <div className={`glass-panel p-6 rounded-xl transition-all duration-300 border-white/10 group ${ability.glow} animate-border-marquee relative overflow-hidden`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/10 group-hover:bg-zinc-800 transition-colors">
                        <Icon className={`w-6 h-6 ${ability.color}`} />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-300 group-hover:text-white transition-colors uppercase border border-white/10 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-100 group-hover:text-white transition-colors">
                      {ability.label}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Progress / Stats Block (Condensed) */}
          {(profile?.role === 'cohort') && (
            <div className="glass-panel p-6 rounded-xl mt-8">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/10 p-3 rounded-full">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Engagement Streak</h4>
                  <p className="text-xs text-zinc-400">Keep the momentum flow.</p>
                </div>
                <div className="ml-auto text-2xl font-mono text-orange-400 font-bold">
                  XXX Days
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: HUD (Mindset) */}
        <div className="space-y-6">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest pl-1">Cognitive State</h3>
          <MindsetLog />
        </div>

      </div>
    </div>
  )
}
