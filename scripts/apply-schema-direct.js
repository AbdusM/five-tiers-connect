#!/usr/bin/env node

/**
 * Direct Schema Application using Supabase REST API
 * This uses the Management API to execute SQL directly
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function applySchemaDirect() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
    console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
    console.error('   Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your-key');
    process.exit(1);
  }

  // Read schema
  const schemaPath = path.join(__dirname, '../supabase/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('🚀 Applying schema via Supabase API...\n');

  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    console.error('❌ Invalid Supabase URL');
    process.exit(1);
  }

  // Use Supabase Management API
  const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: schema
    });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Schema applied successfully!\n');
          resolve(true);
        } else {
          console.error(`❌ Error: ${res.statusCode}`);
          console.error(data);
          
          // Fallback to manual instructions
          console.log('\n⚠️  Automated application failed.');
          console.log('   Please apply schema manually:');
          console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/sql/new\n`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      console.log('\n⚠️  Please apply schema manually:');
      console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/sql/new\n`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

if (require.main === module) {
  applySchemaDirect()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { applySchemaDirect };
