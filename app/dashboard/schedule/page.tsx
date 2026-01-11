'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { CalendarIcon, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import type { Appointment, Business } from '@/types/database'
import { isDemoMode } from '@/lib/demo-mode'
import { demoAppointments, demoBusinesses } from '@/lib/demo-data'

interface AppointmentWithBusiness extends Appointment {
  business?: Business
}

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const businessParam = searchParams.get('business')

  const [appointments, setAppointments] = useState<AppointmentWithBusiness[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()

      if (typeof window !== 'undefined' && isDemoMode()) {
        setBusinesses(demoBusinesses)
        setAppointments(demoAppointments as AppointmentWithBusiness[])
        setLoadingData(false)
        return
      }

      // Load appointments (only if user exists)
      const { data: appointmentsData, error: appointmentsError } = user
        ? await supabase
          .from('appointments')
          .select('*, business:businesses(*)')
          .eq('user_id', user.id)
          .order('scheduled_date', { ascending: true })
        : { data: [], error: null }

      if (appointmentsError) throw appointmentsError
      if (appointmentsData) setAppointments(appointmentsData)

      // Load businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (businessesError) {
        // DEV MODE: Mock businesses on error
        if (process.env.NODE_ENV === 'development') {
          const mockBusinesses = [
            { id: '1', name: 'Fresh Cuts Barbershop', type: 'barbershop', is_active: true },
            { id: '2', name: 'Elite Styles Salon', type: 'salon', is_active: true },
          ] as any
          setBusinesses(mockBusinesses)

          // ALSO SET MOCK APPOINTMENTS IF NONE EXIST
          if (appointments.length === 0) {
            setAppointments([
              {
                id: 'm1',
                business_id: '1',
                business: { name: 'Fresh Cuts Barbershop' },
                scheduled_date: '2025-10-15',
                scheduled_time: '14:30',
                status: 'confirmed',
                service_type: 'Mentorship Check-in',
                user_id: 'mock-user'
              },
              {
                id: 'm2',
                business_id: '2',
                business: { name: 'Elite Styles Salon' },
                scheduled_date: '2025-10-22',
                scheduled_time: '10:00',
                status: 'pending',
                service_type: 'Job Interview Prep',
                user_id: 'mock-user'
              }
            ] as any)
          }
        } else {
          throw businessesError
        }
      } else if (businessesData) {
        setBusinesses(businessesData)
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // Suppress errors in dev/guest mode
        console.log("Using fallback/empty data for schedule in dev mode")
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      }
    } finally {
      setLoadingData(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Pre-select business from URL param and open dialog
  useEffect(() => {
    if (businessParam && businesses.length > 0 && !open) {
      const businessExists = businesses.some(b => b.id === businessParam)
      if (businessExists) {
        setSelectedBusiness(businessParam)
        setOpen(true)
      }
    }
  }, [businessParam, businesses, open])

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedBusiness) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      // TEST MODE: Allow form exploration
      if (!user) {
        setError('Note: In test mode, booking requires auth. You can explore the form, but actual booking needs a user.')
        setLoading(false)
        // Uncomment to block booking:
        // return
        return // Still return to prevent actual booking without user
      }

      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          business_id: selectedBusiness,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          service_type: serviceType || 'General',
          status: 'pending',
        })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setSelectedDate(undefined)
        setSelectedTime('')
        setSelectedBusiness('')
        setServiceType('')
        loadData()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Schedule Appointment</h1>
          <p className="text-gray-600 mt-2">Book your visit with a trusted partner in two quick steps.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto h-14 px-8 text-lg">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Book New Appointment</DialogTitle>
              <DialogDescription>
                Select a partner, date, and time for your appointment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="business-select" className="text-base">Select Partner *</Label>
                <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                  <SelectTrigger id="business-select" className="h-12 text-base" aria-required="true">
                    <SelectValue placeholder="Choose a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.length === 0 ? (
                      <SelectItem value="none" disabled>No businesses available</SelectItem>
                    ) : (
                      businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name} - {business.type}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-select" className="text-base">Select Date *</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today
                  }}
                  className="rounded-md border"
                  aria-label="Select appointment date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-select" className="text-base">Select Time *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger id="time-select" className="h-12 text-base" aria-required="true">
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-type" className="text-base">Service Type (Optional)</Label>
                <Input
                  id="service-type"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g., Haircut, Styling"
                  className="h-12 text-base"
                  aria-label="Service type"
                />
              </div>

              {success ? (
                <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-green-800 font-semibold">Appointment booked successfully!</span>
                </div>
              ) : (
                <Button
                  onClick={handleBookAppointment}
                  className="w-full h-14 text-lg"
                  disabled={loading || !selectedDate || !selectedTime || !selectedBusiness}
                >
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
          <CardDescription>View and manage your scheduled visits</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          ) : error && appointments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-4" />
              <p className="text-red-600 mb-2">{error}</p>
              <Button variant="outline" onClick={() => loadData()}>
                Try Again
              </Button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No appointments scheduled yet. Book your first appointment above!
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {appointment.business?.name || 'Unknown Business'}
                    </h3>
                    <p className="text-gray-600">
                      {format(new Date(appointment.scheduled_date), 'EEEE, MMMM d, yyyy')} at {appointment.scheduled_time}
                    </p>
                    {appointment.service_type && (
                      <p className="text-sm text-gray-500 mt-1">
                        Service: {appointment.service_type}
                      </p>
                    )}
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
