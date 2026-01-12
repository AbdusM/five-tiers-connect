'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Zap, User, Building2, Ticket, AlertCircle } from 'lucide-react'
import { isDemoMode, setDemoMode } from '@/lib/demo-mode'

export default function DevModePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const [demoEnabled, setDemoEnabled] = useState(false)

  useEffect(() => {
    setDemoEnabled(isDemoMode())
  }, [])

  const enableAdminAccess = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Create a test session
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()

        if (authError && authError.message.includes('not enabled')) {
          // If anonymous auth not enabled, prompt for signup
          setMessage('Please sign up first, then we can enable admin mode')
          router.push('/auth/signup')
          return
        }

        if (authData?.user) {
          // Create user profile with admin role
          await supabase.from('users').upsert({
            id: authData.user.id,
            email: `dev-${Date.now()}@test.com`,
            full_name: 'Dev Admin',
            role: 'admin'
          })
        }
      } else {
        // Make current user admin
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email || `dev-${user.id}@test.com`,
            full_name: 'Dev Admin',
            role: 'admin'
          }, { onConflict: 'id' })
      }

      setMessage('✅ Admin access enabled! Redirecting...')
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1000)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-white flex items-center justify-center gap-4 tracking-tight">
            <Zap className="w-12 h-12 md:w-16 md:h-16 text-indigo-500 fill-indigo-500/20" />
            Beta Testing Mode
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-medium">
            Access all features for testing and validation.
          </p>
        </div>

        {/* Primary Admin Access Card */}
        <Card className="border border-indigo-500/30 bg-indigo-950/10 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-2xl text-white">
              <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
              Enable Admin Access
            </CardTitle>
            <CardDescription className="text-indigo-200/60 text-base">
              Get full admin privileges to test analytics, implementation, and partner features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Button
              onClick={enableAdminAccess}
              size="lg"
              className="w-full h-16 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.2)] transition-all hover:scale-[1.01]"
              disabled={loading}
            >
              {loading ? 'Enabling Access...' : 'Enable Admin Access'}
            </Button>
            {message && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 font-medium animate-in fade-in slide-in-from-top-2 ${message.startsWith('✅')
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                : 'bg-red-950/30 border-red-500/30 text-red-400'
                }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Demo Mode Card */}
          <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Zap className="w-5 h-5 text-amber-500" />
                Demo Mode
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Toggle canned data for offline demos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-sm font-medium text-neutral-300">
                  Status: <span className={demoEnabled ? 'text-amber-400' : 'text-neutral-500'}>{demoEnabled ? 'Enabled' : 'Disabled'}</span>
                </span>
                <Badge variant={demoEnabled ? 'default' : 'secondary'} className={demoEnabled ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-neutral-800 text-neutral-400'}>
                  {demoEnabled ? 'On' : 'Off'}
                </Badge>
              </div>
              <Button
                variant="outline"
                className="w-full border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                onClick={() => {
                  const next = !demoEnabled
                  setDemoMode(next)
                  setDemoEnabled(next)
                }}
              >
                {demoEnabled ? 'Disable Demo Mode' : 'Enable Demo Mode'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Access Card */}
          <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <User className="w-5 h-5 text-blue-500" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Schedule', path: '/dashboard/schedule' },
                { label: 'Partners', path: '/dashboard/partners' },
                { label: 'Analytics', path: '/dashboard/analytics' }
              ].map((link) => (
                <Button
                  key={link.path}
                  variant="ghost"
                  className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800 h-10 px-4"
                  onClick={() => router.push(link.path)}
                >
                  <span className="w-2 h-2 rounded-full bg-neutral-700 mr-3 group-hover:bg-white transition-colors" />
                  {link.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Test Features Card */}
          <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Building2 className="w-5 h-5 text-emerald-500" />
                Test Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {['Cohort Vouchers', 'Check-In Requests', 'Crisis Support', 'Trusted Contacts'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-800/50 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    <span className="text-sm text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seed Data Card */}
          <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Ticket className="w-5 h-5 text-pink-500" />
                Seed Test Data
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Create test businesses and invite codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-dashed border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
                onClick={() => {
                  window.open('http://localhost:3000/api/seed', '_blank')
                }}
              >
                Run Seed Script (Test Data)
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Documentation Card */}
        <Card className="border border-blue-900/30 bg-blue-950/10" data-testid="testing-resources-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-400">
              <AlertCircle className="w-5 h-5" />
              Testing Resources
            </CardTitle>
            <CardDescription className="text-blue-300/60">
              Documentation for comprehensive testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-bold text-blue-200 uppercase tracking-wider">Reference Docs:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-mono">STAKEHOLDER_GUIDE.md</div>
                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-mono">USER_STORIES.md</div>
              </div>
            </div>
            <div className="pt-4 border-t border-blue-500/10">
              <p className="text-xs text-blue-400/60 text-center">
                All features ready for testing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


