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

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptType[]>([])
  const [uploading, setUploading] = useState(false)
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'pending' | 'processed'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
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
        setReceipts(demoReceipts as unknown as ReceiptType[])
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

      if (receiptsData) setReceipts(receiptsData as ReceiptType[])

      const { data: appts } = await supabase
        .from('appointments')
        .select('id, scheduled_date, scheduled_time, business:businesses(name)')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: false })
        .limit(20)
      if (appts) setAppointments(appts as unknown as Appointment[])

      const { data: voucherData } = await supabase
        .from('vouchers')
        .select('id, amount, status, business:businesses(name)')
        .eq('cohort_member_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (voucherData) setVouchers(voucherData as unknown as Voucher[])
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Receipts</h1>
        <p className="text-gray-600 mt-2">Upload receipts, review details, and attach to vouchers or appointments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload a receipt</CardTitle>
          <CardDescription>Photo or PDF. We’ll scan and let you edit details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="file" accept="image/*,.pdf" onChange={handleUpload} disabled={uploading} />
          <p className="text-xs text-gray-500">
            In Test/Demo mode this creates a placeholder receipt without uploading.
          </p>
          <Button disabled={uploading}>{uploading ? 'Uploading...' : 'Done'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your receipts</CardTitle>
          <CardDescription>Recently added receipts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Add receipt details</h4>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            <Input
              placeholder="Merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
            <Input
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              placeholder="Date (YYYY-MM-DD)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              placeholder="Category (optional)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Select value={status} onValueChange={(v) => setStatus(v as 'pending' | 'processed')}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
              <SelectTrigger><SelectValue placeholder="Attach to appointment (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {appointments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {(a as any).business?.name || 'Appointment'} · {a.scheduled_date} {a.scheduled_time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
              <SelectTrigger><SelectValue placeholder="Attach to voucher (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {vouchers.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    Voucher {v.id.slice(0, 4)} · ${v.amount} · {v.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={uploading}>
              Save Receipt
            </Button>
          </div>

          {receipts.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No receipts yet. Upload one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{r.merchant || 'Receipt'}</p>
                    <p className="text-sm text-gray-600">
                      {r.date} · ${r.amount ?? 0}{r.category ? ` · ${r.category}` : ''}
                    </p>
                  </div>
                  <Badge variant="secondary">{r.status || 'processed'}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
