'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Ticket, CheckCircle2, Calendar, Building2, ArrowRight, Sparkles, Clock } from 'lucide-react'
import { isDemoMode } from '@/lib/demo-mode'
import { demoVouchers, demoBusinesses } from '@/lib/demo-data'
import { Voucher, Business } from '@/types/database'
import Link from 'next/link'

type VoucherWithBusiness = Voucher & {
  business: Business | null
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherWithBusiness[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'used' | 'expired'>('all')

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    // Demo mode: use canned vouchers
    if (typeof window !== 'undefined' && isDemoMode()) {
      setVouchers(demoVouchers as VoucherWithBusiness[]) // safe cast as demoVouchers are compliant
      setBusinesses(demoBusinesses as Business[])
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('No user found, using demo data')
      setVouchers(demoVouchers as VoucherWithBusiness[])
      setBusinesses(demoBusinesses as Business[])
      setLoading(false)
      return
    }

    // Real Supabase Load (for auth'd users)
    const { data: vouchersData } = await supabase
      .from('vouchers')
      .select('*, business:businesses(*)')
      .eq('cohort_member_id', user.id)
      .order('created_at', { ascending: false })

    if (vouchersData) setVouchers(vouchersData as VoucherWithBusiness[])

    // Load businesses
    const { data: businessesData } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (businessesData) setBusinesses(businessesData)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'used':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'expired':
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  const filteredVouchers = vouchers.filter(v => {
    if (activeTab === 'all') return true
    return v.status === activeTab
  })

  const activeCount = vouchers.filter(v => v.status === 'active').length
  const usedCount = vouchers.filter(v => v.status === 'used').length
  const expiredCount = vouchers.filter(v => v.status === 'expired').length

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Ticket className="w-10 h-10 text-purple-400" />
          My Vouchers
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">
          Manage your service vouchers for partner businesses. Use them to book appointments with barbershops, salons, and other community partners.
        </p>
      </div>

      {/* Stats Summary */}
      {vouchers.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass-panel border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider">Active</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</p>
                </div>
                <Sparkles className="w-8 h-8 text-emerald-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider">Used</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{usedCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-blue-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider">Expired</p>
                  <p className="text-2xl font-bold text-zinc-400 mt-1">{expiredCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-zinc-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs and Vouchers List */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto mb-6 gap-2 bg-zinc-900/50 border border-white/10">
          <TabsTrigger value="all" className="py-2 text-sm data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/30">
            All ({vouchers.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="py-2 text-sm data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30">
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="used" className="py-2 text-sm data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30">
            Used ({usedCount})
          </TabsTrigger>
          <TabsTrigger value="expired" className="py-2 text-sm data-[state=active]:bg-zinc-500/20 data-[state=active]:text-zinc-400 data-[state=active]:border-zinc-500/30">
            Expired ({expiredCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card className="glass-panel border-white/10">
              <CardContent className="py-12 text-center text-zinc-400">
                Loading vouchers...
              </CardContent>
            </Card>
          ) : filteredVouchers.length === 0 ? (
            <Card className="glass-panel border-white/10">
              <CardContent className="py-16 text-center">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {activeTab === 'all' ? 'No vouchers yet' : `No ${activeTab} vouchers`}
                </h3>
                <p className="text-zinc-400 max-w-sm mx-auto">
                  {activeTab === 'all'
                    ? 'You don\'t have any vouchers at this time. Contact your administrator to request vouchers for partner services.'
                    : activeTab === 'active'
                      ? 'You don\'t have any active vouchers. Check your used or expired vouchers, or contact support for new ones.'
                      : `You don't have any ${activeTab} vouchers.`
                  }
                </p>
                {activeTab === 'active' && (
                  <Link href="/dashboard/partners">
                    <Button className="mt-6 bg-purple-500 hover:bg-purple-600 text-white">
                      Browse Partners
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredVouchers.map((voucher) => (
                <div key={voucher.id} className="glass-panel p-5 rounded-xl border border-white/10 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {/* Status Chip */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${voucher.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}>
                        {voucher.status}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2 group-hover:text-purple-300 transition-colors">
                        {voucher.amount}
                      </h3>
                      <p className="text-sm text-zinc-300 font-medium">
                        Service Voucher
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {voucher.business?.name || 'Unknown Business'}
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 p-2 rounded-lg border border-white/5">
                      <Ticket className="w-5 h-5 text-purple-400/80" />
                    </div>
                  </div>

                  {/* Insight Line */}
                  <div className="mb-4 pt-2 border-t border-white/5">
                    <p className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {(() => {
                        if (!voucher.expires_at) return 'No expiration'
                        const days = Math.ceil((new Date(voucher.expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                        if (days < 0) return 'Expired'
                        if (days < 7) return <span className="text-amber-400">Expires in {days} days — act soon</span>
                        return <span>Valid for {days} more days</span>
                      })()}
                    </p>
                  </div>

                  {voucher.status === 'active' ? (
                    <Link href="/dashboard/schedule" className="block">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 h-10">
                        Use Voucher <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full bg-zinc-800/50 text-zinc-500 border border-white/5 h-10">
                      {voucher.status === 'used' ? 'Redeemed' : 'Expired'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
