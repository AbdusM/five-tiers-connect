const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.log('Could not load .env.local, checking process.env');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    console.log('Checking "receipts" storage bucket...');

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError.message);
        return;
    }

    const receiptBucket = buckets.find(b => b.name === 'receipts');

    if (receiptBucket) {
        console.log('✅ Bucket "receipts" already exists.');
    } else {
        console.log('Creating "receipts" bucket...');
        const { data, error: createError } = await supabase.storage.createBucket('receipts', {
            public: false, // Receipts should be private
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/*', 'application/pdf']
        });

        if (createError) {
            console.error('❌ Error creating bucket:', createError.message);
        } else {
            console.log('✅ Bucket "receipts" created successfully.');
        }
    }
}

setupStorage();
