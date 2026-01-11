'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Users, Calendar, Ticket, AlertCircle, TrendingUp, CheckCircle2, Heart, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    activeVouchers: 0,
    openCrisisRequests: 0,
    noShowRate: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      // Total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Total appointments
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })

      // Completed appointments
      const { count: completedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // No-show appointments
      const { count: noShowCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'no_show')

      // Active vouchers
      const { count: voucherCount } = await supabase
        .from('vouchers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Open crisis requests
      const { count: crisisCount } = await supabase
        .from('crisis_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

      const noShowRate = appointmentCount && appointmentCount > 0
        ? ((noShowCount || 0) / appointmentCount) * 100
        : 0

      setStats({
        totalUsers: userCount || 0,
        totalAppointments: appointmentCount || 0,
        completedAppointments: completedCount || 0,
        activeVouchers: voucherCount || 0,
        openCrisisRequests: crisisCount || 0,
        noShowRate: Math.round(noShowRate * 10) / 10,
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }
  const [connectionStats, setConnectionStats] = useState({ total: 0, crisis: 0, community: 0 })

  // Load analytic events from localStorage for demo
  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]')
        const total = storedEvents.length
        const crisis = storedEvents.filter((e: any) => e.category === 'crisis').length
        const community = storedEvents.length - crisis
        setConnectionStats({ total, crisis, community })
      } catch (e) {
        console.error('Failed to load analytics', e)
      }
    }

    loadAnalytics()
    // Poll every 2 seconds for live updates during demo
    const interval = setInterval(loadAnalytics, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
        <p className="text-gray-600">Measuring Community Stability and Resource Connections.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Community Connections</CardTitle>
            <Heart className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionStats.total}</div>
            <p className="text-xs text-gray-500">Resource links accessed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Stability Score</CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vouchers Redeemed</CardTitle>
            <Ticket className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,240</div>
            <p className="text-xs text-gray-500">Across 15 barbershops</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Check-Ins</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,892</div>
            <p className="text-xs text-gray-500">Consistent engagement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Diversion Impact</CardTitle>
            <CardDescription>
              Users connecting to care instead of crisis (Stepping Up Goal).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Crisis Interventions</p>
                <p className="text-xs text-gray-500">Emergency & Hotline calls</p>
              </div>
              <div className="font-bold text-red-600">{connectionStats.crisis}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Community Support</p>
                <p className="text-xs text-gray-500">Housing, Jobs, Legal access</p>
              </div>
              <div className="font-bold text-blue-600">{connectionStats.community}</div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Evidence Based
                </Badge>
                <p className="text-xs text-gray-500">
                  Each connection represents a potential diversion from the justice system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Stability Trends</CardTitle>
            <CardDescription>Cohort engagement over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
              Chart Visualization Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
