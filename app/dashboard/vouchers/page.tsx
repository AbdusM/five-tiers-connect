'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Ticket, CheckCircle2 } from 'lucide-react'

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Check local storage for persistent mock data (or generate if empty)
    if (typeof window !== 'undefined') {
      const storedVouchers = localStorage.getItem('vouchers_data')
      if (storedVouchers) {
        setVouchers(JSON.parse(storedVouchers))
        setLoading(false)
        return
      }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // DEV MODE / GUEST: Provide Mock Vouchers
      const mockVouchers = [
        {
          id: 'v1',
          business: { name: 'Fresh Cuts Barbershop' },
          amount: 25,
          created_at: '2025-09-01T10:00:00Z',
          expires_at: '2025-12-31T23:59:59Z',
          status: 'active',
          cohort_member_id: 'guest'
        },
        {
          id: 'v2',
          business: { name: 'Men\'s Wearhouse' },
          amount: 150,
          created_at: '2025-08-15T09:00:00Z',
          expires_at: '2025-11-30T23:59:59Z',
          status: 'used',
          used_at: '2025-10-01T14:00:00Z',
          cohort_member_id: 'guest'
        }
      ] as any[]

      setVouchers(mockVouchers)
      if (typeof window !== 'undefined') {
        localStorage.setItem('vouchers_data', JSON.stringify(mockVouchers))
      }
      setLoading(false)
      return
    }

    // Real Supabase Load (for auth'd users)
    const { data: vouchersData } = await supabase
      .from('vouchers')
      .select('*, business:businesses(*)')
      .eq('cohort_member_id', user.id)
      .order('created_at', { ascending: false })

    if (vouchersData) setVouchers(vouchersData)

    // Load businesses
    const { data: businessesData } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (businessesData) setBusinesses(businessesData)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'used':
        return 'bg-blue-100 text-blue-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">My Vouchers</h1>
        <p className="text-gray-600 mt-2">Manage your service vouchers for partner businesses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Vouchers</CardTitle>
          <CardDescription>View and use your available vouchers</CardDescription>
        </CardHeader>
        <CardContent>
          {vouchers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No vouchers available at this time.</p>
              <p className="text-sm mt-2">Contact your administrator to request vouchers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Ticket className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {voucher.business?.name || 'Unknown Business'}
                      </h3>
                      <p className="text-gray-600">
                        ${voucher.amount} voucher
                      </p>
                      {voucher.expires_at && (
                        <p className="text-sm text-gray-500 mt-1">
                          Expires: {format(new Date(voucher.expires_at), 'MMM d, yyyy')}
                        </p>
                      )}
                      {voucher.used_at && (
                        <p className="text-sm text-gray-500 mt-1">
                          Used: {format(new Date(voucher.used_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(voucher.status)}>
                      {voucher.status}
                    </Badge>
                    {voucher.status === 'active' && (
                      <Button
                        onClick={() => window.location.href = '/dashboard/schedule'}
                        className="h-12 px-6"
                      >
                        Use Voucher
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
