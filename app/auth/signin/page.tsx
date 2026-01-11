'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Github } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGitHubSignIn = async () => {
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

  // Auto-login if ?guest=true is present
  const [autoGuestAttempted, setAutoGuestAttempted] = useState(false)

  const handleGuestLogin = async () => {
    setLoading(true)
    setError('')

    const guestEmail = 'guest_dev_mode@gmail.com'
    const guestPassword = 'GuestMode123!'

    try {
      // 1. Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      })

      if (!signInError && signInData.user) {
        console.log('Guest login successful:', signInData.user.id)
        router.push('/dashboard')
        router.refresh()
        return
      }

      console.log('Guest sign-in failed, attempting signup:', signInError?.message)

      // 2. If sign in fails, try to sign up
      if (signInError && (signInError.message.includes('Invalid login credentials') || signInError.message.includes('Email not confirmed'))) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: guestEmail,
          password: guestPassword,
          options: {
            data: {
              full_name: 'Guest Developer',
              role: 'community'
            }
          }
        })

        if (signUpError) {
          console.error('Guest signup error:', signUpError)
          // If the user exists but password mismatch, we might get "User already registered" depending on config.
          setError(`Guest setup failed: ${signUpError.message}`)
          setLoading(false)
          return
        }

        if (authData.user) {
          // Create profile for the guest user
          const { error: profileError } = await supabase.from('users').upsert({
            id: authData.user.id,
            email: guestEmail,
            full_name: 'Guest Developer',
            role: 'community'
          }, { onConflict: 'id' })

          if (profileError) {
            console.error('Profile creation error:', profileError)
          }

          router.push('/dashboard')
          router.refresh()
        } else {
          setError('Guest account created but requires email confirmation.')
          setLoading(false)
        }
      } else {
        // Some other sign-in error
        setError(signInError?.message || 'Unknown error')
        setLoading(false)
      }

    } catch (err: any) {
      console.error('Unexpected guest login error:', err)
      setError(`Unexpected error: ${err.message || 'Unknown'}`)
      setLoading(false)
    }
  }

  // Check for URL param ?guest=true
  if (typeof window !== 'undefined' && !autoGuestAttempted) {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('guest') === 'true') {
      setAutoGuestAttempted(true)
      handleGuestLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Sign In</CardTitle>
          <CardDescription>
            Access your Five Tiers Connect account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant="default"
                className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
                onClick={handleGuestLogin}
                disabled={loading}
              >
                {loading ? 'Entering Guest Mode...' : '🚀 Guest Mode (Dev Only)'}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-lg"
              onClick={handleGitHubSignIn}
              disabled={githubLoading || loading}
            >
              <Github className="w-5 h-5 mr-2" />
              {githubLoading ? 'Connecting...' : 'Sign in with GitHub'}
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

          <form onSubmit={handleSignIn} className="space-y-4 mt-4">
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-14 text-lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-indigo-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div >
  )
}

