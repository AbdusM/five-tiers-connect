import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is admin (or allow in dev mode)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Allow if admin or in development
    if (profile?.role !== 'admin' && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    // Seed data
    const businesses = [
      {
        name: 'Philly Cuts Barbershop',
        type: 'barbershop',
        address: '123 Market Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19104',
        phone: '(215) 555-0101',
        email: 'phillycuts@example.com',
        is_active: true,
        is_youth_friendly: true,
        hours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' }
        }
      },
      {
        name: 'Community Salon',
        type: 'salon',
        address: '456 Broad Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19106',
        phone: '(215) 555-0202',
        email: 'community@example.com',
        is_active: true,
        is_youth_friendly: true
      },
      {
        name: 'Downtown Barbers',
        type: 'barbershop',
        address: '789 Chestnut Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19107',
        phone: '(215) 555-0303',
        is_active: true,
        is_youth_friendly: false
      }
    ]

    const { data: createdBusinesses, error: businessError } = await supabase
      .from('businesses')
      .upsert(businesses, { onConflict: 'name' })
      .select()

    if (businessError) {
      return NextResponse.json({ error: businessError.message }, { status: 500 })
    }

    // Create invite codes if admin
    if (profile?.role === 'admin') {
      const inviteCodes = [
        {
          code: 'BETA2024',
          role: 'cohort',
          created_by: user.id,
          expires_at: '2025-12-31T23:59:59Z'
        },
        {
          code: 'TEST123',
          role: 'cohort',
          created_by: user.id,
          expires_at: '2025-12-31T23:59:59Z'
        }
      ]

      await supabase
        .from('invite_codes')
        .upsert(inviteCodes, { onConflict: 'code' })
    }

    return NextResponse.json({
      success: true,
      businesses: createdBusinesses?.length || 0,
      message: 'Test data seeded successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
