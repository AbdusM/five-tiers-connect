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

        {/* Emergency Disclaimer Footer */}
        <footer className="py-4 px-6 text-center border-t border-neutral-200 dark:border-white/5 bg-neutral-100/50 dark:bg-black/20">
          <p className="text-[10px] md:text-xs text-neutral-500 dark:text-zinc-500 font-medium">
            For immediate life-threatening emergencies, dial <span className="text-red-600 dark:text-red-400 font-bold">911</span>.
            For mental health crisis, dial <span className="text-indigo-600 dark:text-indigo-400 font-bold">988</span>.
          </p>
        </footer>
      </div>
    </div>
  )
}
