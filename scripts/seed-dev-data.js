#!/usr/bin/env node

/**
 * Seed Development Data
 * Creates test data for beta testing without blockers
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedData() {
  console.log('🌱 Seeding development data...\n');

  try {
    // 1. Create test admin user (if auth user exists)
    console.log('📝 Creating test users...');
    
    // First, check if we need to create auth user
    // Note: This requires the auth user to exist first via signup
    // For now, we'll create the profile data that can be linked later
    
    // 2. Create test businesses
    console.log('🏢 Creating test businesses...');
    
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
        is_youth_friendly: true,
        hours: {
          monday: { open: '10:00', close: '19:00' },
          tuesday: { open: '10:00', close: '19:00' },
          wednesday: { open: '10:00', close: '19:00' },
          thursday: { open: '10:00', close: '19:00' },
          friday: { open: '10:00', close: '19:00' },
          saturday: { open: '09:00', close: '17:00' }
        }
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
    ];

    // Insert businesses (ignore duplicates)
    const createdBusinesses = [];
    for (const business of businesses) {
      const { data, error } = await supabase
        .from('businesses')
        .insert(business)
        .select()
        .single();
      
      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          // Already exists, skip
          continue;
        }
        console.error(`⚠️  Error creating ${business.name}:`, error.message);
      } else if (data) {
        createdBusinesses.push(data);
      }
    }

    console.log(`✅ Created ${createdBusinesses.length} businesses`);

    // 3. Create test invite codes
    console.log('🎫 Creating test invite codes...');
    
    // Get any admin user for created_by (or use a placeholder)
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminUser) {
      const inviteCodes = [
        {
          code: 'BETA2024',
          role: 'cohort',
          created_by: adminUser.id,
          expires_at: '2025-12-31T23:59:59Z'
        },
        {
          code: 'TEST123',
          role: 'cohort',
          created_by: adminUser.id,
          expires_at: '2025-12-31T23:59:59Z'
        }
      ];

      const { error: inviteError } = await supabase
        .from('invite_codes')
        .upsert(inviteCodes, { onConflict: 'code' });

      if (inviteError) {
        console.error('⚠️  Invite code error:', inviteError.message);
      } else {
        console.log('✅ Created test invite codes: BETA2024, TEST123');
      }
    } else {
      console.log('⚠️  No admin user found - invite codes will be created after you make yourself admin');
    }

    console.log('\n✅ Seed data complete!');
    console.log('\n📋 Test Data Created:');
    console.log('   - 3 test businesses (2 youth-friendly)');
    if (adminUser) {
      console.log('   - 2 test invite codes (BETA2024, TEST123)');
    }
    console.log('\n🚀 You can now test all features!');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
