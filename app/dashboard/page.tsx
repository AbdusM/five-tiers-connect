import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Building2, Ticket, AlertCircle, Flame, Trophy } from 'lucide-react'
import { MindsetLog } from '@/features/cognitive-support/components/MindsetLog'
import { GuiltyReminderWidget } from '@/features/contacts/components/GuiltyReminderWidget'
import { PartnerDirectoryWidget } from '@/features/partners/components/PartnerDirectoryWidget'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // TEST MODE: Allow access without auth
  // Default profile for testing
  // Default profile for testing
  let profile: { full_name: string; role: 'admin' | 'cohort' | 'community' } = {
    full_name: 'Test User',
    role: 'admin'
  }

  if (user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userProfile) {
      profile = userProfile
    }
  }

  // TEST MODE: Get appointments if user exists, otherwise empty
  const { data: appointments } = user
    ? await supabase
      .from('appointments')
      .select('*, business:businesses(*)')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })
      .limit(5)
    : { data: [] }

  // Calculate attendance streak for cohort members
  let attendanceStreak = 0
  let totalCompleted = 0
  if (user && profile?.role === 'cohort') {
    const { data: completedAppointments } = await supabase
      .from('appointments')
      .select('scheduled_date')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('scheduled_date', { ascending: false })

    if (completedAppointments && completedAppointments.length > 0) {
      totalCompleted = completedAppointments.length
      // Simple streak calculation - consecutive completed appointments
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < completedAppointments.length; i++) {
        const apptDate = new Date(completedAppointments[i].scheduled_date)
        apptDate.setHours(0, 0, 0, 0)
        const daysDiff = Math.floor((today.getTime() - apptDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === i) {
          streak++
        } else {
          break
        }
      }
      attendanceStreak = streak
    }
  }

  const quickActions = [
    { href: '/dashboard/schedule', label: 'Book Appointment', icon: Calendar, color: 'bg-blue-500' },
    { href: '/dashboard/partners', label: 'Find Partners', icon: Building2, color: 'bg-green-500' },
  ]

  if (profile?.role === 'cohort' || profile?.role === 'admin') {
    quickActions.push(
      { href: '/dashboard/vouchers', label: 'My Vouchers', icon: Ticket, color: 'bg-purple-500' },
      { href: '/dashboard/crisis', label: 'Crisis Support', icon: AlertCircle, color: 'bg-red-500' }
    )
  }


  // ... existing code ...

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your appointments and services.
        </p>
      </div>

      {/* PRIME: Guilty Reminder Widget (Top Priority) */}
      <GuiltyReminderWidget />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{action.label}</h3>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT COL: Appointments & Progress */}
        <div className="space-y-8">
          {profile?.role === 'cohort' && (attendanceStreak > 0 || totalCompleted > 0) && (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flame className="w-6 h-6 text-orange-600" />
                  <span>Your Progress</span>
                </CardTitle>
                <CardDescription>Track your engagement and attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-4 rounded-lg">
                      <Flame className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Attendance Streak</p>
                      <p className="text-3xl font-bold text-orange-600">{attendanceStreak}</p>
                      <p className="text-xs text-gray-500">consecutive</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-4 rounded-lg">
                      <Trophy className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Completed</p>
                      <p className="text-3xl font-bold text-indigo-600">{totalCompleted}</p>
                      <p className="text-xs text-gray-500">appointments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {appointments && appointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your next scheduled visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{appointment.business?.name}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.scheduled_date).toLocaleDateString()} at{' '}
                          {appointment.scheduled_time}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/schedule">
                    <Button variant="outline" className="w-full">
                      View All Appointments
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COL: Mindset Log */}
        <div className="space-y-8 lg:h-full">
          <MindsetLog />
          {/* Partner Directory moved to dedicated /partners page to reduce dashboard clutter */}
        </div>
      </div>
    </div>
  )
}
