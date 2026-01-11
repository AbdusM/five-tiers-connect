export type UserRole = 'community' | 'cohort' | 'partner' | 'admin'

export interface BusinessHours {
  open: string
  close: string
}

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  name: string
  type: 'barbershop' | 'salon'
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email?: string
  owner_id: string
  is_active: boolean
  is_youth_friendly?: boolean
  hours?: Record<string, BusinessHours>
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  business_id: string
  scheduled_date: string
  scheduled_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  service_type?: string
  notes?: string
  voucher_id?: string
  created_at: string
  updated_at: string
}

export interface Voucher {
  id: string
  cohort_member_id: string
  business_id: string
  amount: number
  status: 'active' | 'used' | 'expired'
  expires_at?: string
  used_at?: string
  created_at: string
  updated_at: string
}

export interface CrisisLog {
  id: string
  user_id: string
  type: 'mental_health' | 'housing' | 'legal' | 'employment' | 'other'
  description: string
  routed_to?: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}

export interface InviteCode {
  id: string
  code: string
  role: 'cohort'
  used_by?: string
  used_at?: string
  expires_at?: string
  created_by: string
  created_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  type: 'requested' | 'scheduled' | 'completed'
  requested_at?: string
  scheduled_at?: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface TrustedContact {
  id: string
  user_id: string
  name: string
  relationship: string
  phone: string
  email?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface PartnerApplication {
  id: string
  business_name: string
  business_type: 'barbershop' | 'salon'
  owner_name: string
  owner_email: string
  owner_phone: string
  address: string
  city: string
  state: string
  zip: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  business_id: string
  user_id: string
  rating: number
  text?: string
  created_at: string
}

export interface Receipt {
  id: string
  user_id: string
  appointment_id?: string
  voucher_id?: string
  merchant?: string
  amount?: number
  date?: string
  category?: string
  status: 'pending' | 'processed'
  raw_data?: unknown
  created_at: string
  updated_at: string
}
