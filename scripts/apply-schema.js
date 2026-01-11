#!/usr/bin/env node

/**
 * Automated Schema Application Script
 * Applies the Five Tiers Connect schema to Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function applySchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || (!supabaseKey && !supabaseServiceKey)) {
    console.error('❌ Missing Supabase credentials!');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
    console.error('\n   Get them from: https://supabase.com/dashboard/project/_/settings/api');
    process.exit(1);
  }

  // Use service role key if available (for admin operations), otherwise anon key
  const key = supabaseServiceKey || supabaseKey;
  const supabase = createClient(supabaseUrl, key);

  // Read schema file
  const schemaPath = path.join(__dirname, '../supabase/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('🚀 Applying Five Tiers Connect schema...\n');

  // Split schema into individual statements
  // Remove comments and split by semicolons
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.length < 10) continue; // Skip empty or very short statements

    try {
      // Use RPC to execute SQL (if available) or direct query
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try direct query approach
        const { error: queryError } = await supabase
          .from('_temp')
          .select('*')
          .limit(0);
        
        // If that fails, try using the REST API directly
        if (queryError) {
          // For DDL statements, we need to use the Management API
          // Fall back to manual instruction
          console.log(`⚠️  Statement ${i + 1}/${statements.length} requires manual execution`);
          console.log(`   This is a DDL statement that needs to be run in SQL Editor`);
          continue;
        }
      } else {
        successCount++;
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`   Progress: ${i + 1}/${statements.length}\r`);
        }
      }
    } catch (err) {
      errorCount++;
      errors.push({ statement: i + 1, error: err.message });
    }
  }

  console.log('\n');

  if (errorCount === 0 && successCount > 0) {
    console.log('✅ Schema applied successfully!');
  } else if (errors.length > 0) {
    console.log('⚠️  Some statements need manual execution');
    console.log('\n   Please run the schema in Supabase SQL Editor:');
    console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/sql/new\n`);
  }

  return { success: errorCount === 0, errors };
}

// Run if called directly
if (require.main === module) {
  applySchema()
    .then(({ success }) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = { applySchema };
