'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Github } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'community' | 'partner'>('community')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [consent, setConsent] = useState(false)
  const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)

  const supabase = createClient()

  const handleGitHubSignUp = async () => {
    setGithubLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setGithubLoading(false)
    }
  }

  const checkInviteCode = async (code: string) => {
    if (!code) {
      setInviteCodeValid(null)
      return
    }

    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .is('used_by', null)
      .single()

    if (error || !data) {
      setInviteCodeValid(false)
    } else {
      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setInviteCodeValid(false)
      } else {
        setInviteCodeValid(true)
      }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!consent) {
      setError('Please acknowledge the privacy and consent statement')
      setLoading(false)
      return
    }

    // If invite code provided, validate it
    if (inviteCode) {
      const { data: codeData } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', inviteCode.toUpperCase())
        .is('used_by', null)
        .single()

      if (!codeData) {
        setError('Invalid or already used invite code')
        setLoading(false)
        return
      }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      phone: phone || undefined,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Failed to create account')
      setLoading(false)
      return
    }

    // Determine final role
    let finalRole: 'community' | 'cohort' | 'partner' | 'admin' = role
    if (inviteCode && inviteCodeValid) {
      finalRole = 'cohort'
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        role: finalRole,
      })

    if (profileError) {
      setError('Failed to create profile: ' + profileError.message)
      setLoading(false)
      return
    }

    // Mark invite code as used if applicable
    if (inviteCode && inviteCodeValid) {
      await supabase
        .from('invite_codes')
        .update({ used_by: authData.user.id, used_at: new Date().toISOString() })
        .eq('code', inviteCode.toUpperCase())
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription>
            Join Five Tiers Connect to access community services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-lg"
              onClick={handleGitHubSignUp}
              disabled={githubLoading || loading}
            >
              <Github className="w-5 h-5 mr-2" />
              {githubLoading ? 'Connecting...' : 'Sign up with GitHub'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(215) 555-1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={role} onValueChange={(value: 'community' | 'partner') => setRole(value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community">Community Member</SelectItem>
                  <SelectItem value="partner">Partner Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code (Optional)</Label>
              <div className="relative">
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter cohort invite code"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value)
                    checkInviteCode(e.target.value)
                  }}
                  className="h-12 text-lg uppercase"
                />
                {inviteCode && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {inviteCodeValid === true && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {inviteCodeValid === false && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              {inviteCode && inviteCodeValid === false && (
                <p className="text-sm text-red-600">Invalid or expired invite code</p>
              )}
              {inviteCode && inviteCodeValid === true && (
                <p className="text-sm text-green-600">Valid invite code - you'll be enrolled in Cohort Track</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5"
                  required
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  I acknowledge the privacy policy and consent to using this platform. 
                  I understand this is a community service platform and not a clinical or legal service.
                </Label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg"
              disabled={loading || Boolean(inviteCode && inviteCodeValid === false)}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-indigo-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
