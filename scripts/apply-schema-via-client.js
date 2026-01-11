#!/usr/bin/env node

/**
 * Apply schema using Supabase client (alternative method)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function applySchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const schemaPath = path.join(__dirname, '../supabase/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('🚀 Applying schema via Supabase client...\n');

  // Split into statements
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  // Try using RPC if available, otherwise manual application needed
  console.log('⚠️  Direct SQL execution via client requires RPC function');
  console.log('   Please apply schema manually via SQL Editor:\n');
  console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/sql/new\n`);
  console.log('   Or copy the schema file:');
  console.log(`   ${schemaPath}\n`);
}

if (require.main === module) {
  applySchema().catch(console.error);
}

module.exports = { applySchema };
