'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { demoReceipts } from '@/lib/demo-data'
import { isDemoMode } from '@/lib/demo-mode'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Receipt as ReceiptType, Appointment, Voucher } from '@/types/database'
import { Receipt as ReceiptIcon, Upload, Save, Calendar, Tag } from 'lucide-react'

// Extended types for joined data
type ReceiptWithRelations = ReceiptType & {
  appointment?: {
    id: string
    scheduled_date: string
    scheduled_time: string
    business: { name: string } | null
  } | null
  voucher?: {
    id: string
    amount: number
    status: string
  } | null
}

type AppointmentWithBusiness = Appointment & {
  business: { name: string } | null
}

type VoucherWithBusiness = Voucher & {
  business: { name: string } | null
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptWithRelations[]>([])
  const [uploading, setUploading] = useState(false)
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'pending' | 'processed'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<AppointmentWithBusiness[]>([])
  const [vouchers, setVouchers] = useState<VoucherWithBusiness[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<string>('none')
  const [selectedVoucher, setSelectedVoucher] = useState<string>('none')

  const supabase = createClient()
  const router = useRouter()
  const RECEIPT_BUCKET = 'receipts'

  const generateId = () =>
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const load = async () => {
      if (isDemoMode()) {
        setReceipts(demoReceipts as ReceiptWithRelations[])
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setReceipts([])
        return
      }
      const { data: receiptsData } = await supabase
        .from('receipts')
        .select('*, appointment:appointments(id, scheduled_date, scheduled_time, business:businesses(name)), voucher:vouchers(id, amount, status)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (receiptsData) setReceipts(receiptsData as ReceiptWithRelations[])

      const { data: appts } = await supabase
        .from('appointments')
        .select('*, business:businesses(name)')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: false })
        .limit(20)
      if (appts) setAppointments(appts as AppointmentWithBusiness[])

      const { data: voucherData } = await supabase
        .from('vouchers')
        .select('*, business:businesses(name)')
        .eq('cohort_member_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (voucherData) setVouchers(voucherData as VoucherWithBusiness[])
    }
    load()
  }, [supabase])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      if (isDemoMode()) {
        setUploading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please sign in to upload a receipt.')
        setUploading(false)
        return
      }
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${generateId()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from(RECEIPT_BUCKET).upload(filePath, file)
      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }
      // Store path on the in-progress form
      setStatus('pending')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setError(null)
    if (!merchant.trim()) {
      setError('Merchant is required.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError('Amount must be greater than 0.')
      return
    }
    if (!date) {
      setError('Please add a date for this receipt.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (isDemoMode() || !user) {
      // Demo: local append
      const newReceipt: ReceiptType = {
        id: generateId(),
        user_id: 'demo',
        merchant: merchant || 'Receipt',
        amount: Number(amount) || 0,
        date: date || new Date().toISOString().slice(0, 10),
        category,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setReceipts(prev => [newReceipt, ...prev])
      setMerchant('')
      setAmount('')
      setDate('')
      setCategory('')
      setSelectedAppointment('')
      setSelectedVoucher('')
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          merchant: merchant || null,
          amount: amount ? Number(amount) : null,
          date: date || null,
          category: category || null,
          status,
          appointment_id: selectedAppointment === 'none' ? null : selectedAppointment,
          voucher_id: selectedVoucher === 'none' ? null : selectedVoucher,
        })
      if (insertError) {
        setError(insertError.message)
        return
      }
      // reload
      const { data: receiptsData } = await supabase
        .from('receipts')
        .select('*, appointment:appointments(id, scheduled_date, scheduled_time, business:businesses(name)), voucher:vouchers(id, amount, status)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (receiptsData) setReceipts(receiptsData as ReceiptType[])
      setMerchant('')
      setAmount('')
      setDate('')
      setCategory('')
      setSelectedAppointment('none')
      setSelectedVoucher('none')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save receipt now.')
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <ReceiptIcon className="w-10 h-10 text-orange-400" />
          Receipts
        </h1>
        <p className="text-zinc-400 mt-2 text-lg max-w-2xl">
          Upload and track your expenses. Attach receipts to vouchers or appointments for complete record keeping.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            Upload Receipt
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Photo or PDF. We’ll scan and let you edit details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 rounded-xl p-8 text-center transition-colors bg-zinc-900/20 group cursor-pointer relative">
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 rounded-full bg-zinc-800 group-hover:bg-indigo-500/10 transition-colors">
                <Upload className="w-8 h-8 text-zinc-400 group-hover:text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-zinc-300">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-zinc-500">
                In Test/Demo mode this creates a placeholder
              </p>
            </div>
          </div>
          {uploading && (
            <div className="text-center text-indigo-400 text-sm animate-pulse">
              Processing upload...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry & List */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-1">
          <Card className="glass-panel border-white/10 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Receipt Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Input
                  placeholder="Merchant Name"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                />
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
                  <Input
                    placeholder="0.00"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                  />
                </div>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                />
                <Input
                  placeholder="Category (e.g. Grooming)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                />

                <div className="pt-2 space-y-2">
                  <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                    <SelectTrigger className="bg-zinc-900/50 border-white/10 text-zinc-300">
                      <SelectValue placeholder="Link to Appointment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Appointment</SelectItem>
                      {appointments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.business?.name} · {a.scheduled_date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
                    <SelectTrigger className="bg-zinc-900/50 border-white/10 text-zinc-300">
                      <SelectValue placeholder="Link to Voucher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Voucher</SelectItem>
                      {vouchers.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          ${v.amount} Voucher ({v.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={uploading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white mt-4"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            Recent Receipts
            <Badge className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800">{receipts.length}</Badge>
          </h3>

          {receipts.length === 0 ? (
            <Card className="glass-panel border-white/10 border-dashed">
              <CardContent className="py-12 text-center text-zinc-500">
                <ReceiptIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No receipts uploaded yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {receipts.map((r) => (
                <div key={r.id} className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                      <ReceiptIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{r.merchant || 'Unknown Merchant'}</h4>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span>{r.date}</span>
                        {r.category && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">{r.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-white">${r.amount?.toFixed(2)}</p>
                    <Badge variant="outline" className={`mt-1 text-xs px-2 py-0 border-0 ${r.status === 'processed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
