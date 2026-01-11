import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user after auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        // Create profile if doesn't exist
        if (!profile) {
          const githubName = user.user_metadata?.full_name || 
                           user.user_metadata?.name || 
                           user.user_metadata?.user_name ||
                           'GitHub User'
          
          await supabase.from('users').insert({
            id: user.id,
            email: user.email || user.user_metadata?.email || '',
            full_name: githubName,
            role: 'community', // Default role, can be changed later
          })
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
