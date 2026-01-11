import { createClient } from '@/lib/supabase/server'
import { SidebarNav } from '@/components/sidebar-nav'
import { MobileNav } from '@/components/mobile-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // TEST MODE: Auth is optional - allow free navigation
  // In production, uncomment the redirect below
  // if (!user) {
  //   redirect('/auth/signin')
  // }

  // Get user role from profile (if user exists)
  let userRole = 'admin' // Default to admin for testing
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    userRole = profile?.role || 'community'
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row">
      <SidebarNav userRole={userRole} />

      <div className="flex-1 flex flex-col min-h-screen md:ml-72 transition-all duration-300">
        <MobileNav userRole={userRole} />

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
