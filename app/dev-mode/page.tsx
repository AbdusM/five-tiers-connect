'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Zap, User, Building2, Ticket, AlertCircle } from 'lucide-react'

export default function DevModePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Zap className="w-12 h-12 text-indigo-500" />
            Beta Testing Mode
          </h1>
          <p className="text-xl text-gray-600">
            Access all features for testing
          </p>
        </div>

        <Card className="border-2 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-indigo-600" />
              Enable Admin Access
            </CardTitle>
            <CardDescription>
              Get admin access to test all features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={enableAdminAccess}
              size="lg"
              className="w-full h-14 text-lg"
              disabled={loading}
            >
              {loading ? 'Enabling...' : 'Enable Admin Access'}
            </Button>
            {message && (
              <div className={`p-3 rounded-lg ${
                message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/schedule')}>
                Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/partners')}>
                Partners
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/analytics')}>
                Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Test Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-start">Cohort Vouchers</Badge>
                <Badge variant="outline" className="w-full justify-start">Check-In Requests</Badge>
                <Badge variant="outline" className="w-full justify-start">Crisis Support</Badge>
                <Badge variant="outline" className="w-full justify-start">Trusted Contacts</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seed Test Data</CardTitle>
            <CardDescription>
              Create test businesses and invite codes for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.open('http://localhost:3000/api/seed', '_blank')
              }}
            >
              Run Seed Script (opens in new tab)
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Or run: <code className="bg-gray-100 px-2 py-1 rounded">npm run seed</code>
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Testing Resources
            </CardTitle>
            <CardDescription>
              Documentation for comprehensive testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">📖 Documentation:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li><strong>STAKEHOLDER_GUIDE.md</strong> - Complete testing guide with step-by-step instructions</li>
                <li><strong>USER_STORIES.md</strong> - All user stories with acceptance criteria</li>
                <li><strong>QUICK_START.md</strong> - 3-step quick start guide</li>
                <li><strong>docs/PARTNER_DIRECTORY.md</strong> - Partner directory feature documentation</li>
              </ul>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                All user stories are implemented and ready for testing. See USER_STORIES.md for complete list.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
