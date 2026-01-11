'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { MessageCircle, CheckCircle2, Clock } from 'lucide-react'

export default function CheckInPage() {
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadCheckIns()
  }, [])

  const loadCheckIns = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // TEST MODE: Show empty state if no user
    if (!user) {
      setCheckIns([])
      return
    }

    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setCheckIns(data)
  }

  const handleRequestCheckIn = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    // TEST MODE: Show message but allow form exploration
    if (!user) {
      setError('Note: In test mode, requesting check-ins requires auth. You can explore the form.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('check_ins')
      .insert({
        user_id: user.id,
        type: 'requested',
        requested_at: new Date().toISOString(),
        notes: notes || null,
      })

    if (error) {
      alert('Error requesting check-in: ' + error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setNotes('')
        loadCheckIns()
      }, 2000)
    }
    setLoading(false)
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'requested':
        return <Clock className="w-4 h-4" />
      case 'scheduled':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Request Check-In</h1>
        <p className="text-gray-600 mt-2">Request a supportive check-in from Five Tiers staff</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request a Check-In</CardTitle>
          <CardDescription>
            This is a non-emergency way to connect with Five Tiers support staff.
            For emergencies, use the Crisis Support page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-8 text-lg w-full">
                <MessageCircle className="w-5 h-5 mr-2" />
                Request Check-In
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Request a Check-In</DialogTitle>
                <DialogDescription>
                  Let us know what you'd like to discuss or if you need support
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-base">What would you like to discuss? (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share anything you'd like support with..."
                    className="min-h-[120px] text-base"
                  />
                </div>

                {success ? (
                  <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-green-800 font-semibold">Check-in requested successfully!</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleRequestCheckIn}
                    className="w-full h-14 text-lg"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {checkIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Check-In Requests</CardTitle>
            <CardDescription>Track the status of your check-in requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-6 border rounded-lg"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`${getStatusColor(checkIn.type)} p-3 rounded-lg`}>
                      {getStatusIcon(checkIn.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">Check-In Request</h3>
                        <Badge className={getStatusColor(checkIn.type)}>
                          {checkIn.type}
                        </Badge>
                      </div>
                      {checkIn.notes && (
                        <p className="text-gray-600 mb-2">{checkIn.notes}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Requested: {format(new Date(checkIn.requested_at || checkIn.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {checkIn.scheduled_at && (
                        <p className="text-sm text-indigo-600 mt-1">
                          Scheduled: {format(new Date(checkIn.scheduled_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      )}
                      {checkIn.completed_at && (
                        <p className="text-sm text-green-600 mt-1">
                          Completed: {format(new Date(checkIn.completed_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
