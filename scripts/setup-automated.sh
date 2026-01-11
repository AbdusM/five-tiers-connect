#!/bin/bash

# Automated Five Tiers Connect Setup
# This script handles the complete setup process

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "🚀 Five Tiers Connect - Automated Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "   Install: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo -e "${YELLOW}⚠️  Project not linked${NC}"
    echo ""
    echo "Available projects:"
    supabase projects list
    echo ""
    read -p "Enter project reference ID: " PROJECT_REF
    
    if [ -z "$PROJECT_REF" ]; then
        echo -e "${RED}❌ Project ref required${NC}"
        exit 1
    fi
    
    echo "Linking to project..."
    supabase link --project-ref "$PROJECT_REF" <<< ""
fi

PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null || echo "")
echo -e "${GREEN}✅ Linked to project: $PROJECT_REF${NC}"
echo ""

# Get project URL
PROJECT_URL="https://${PROJECT_REF}.supabase.co"
echo "📋 Project URL: $PROJECT_URL"
echo ""

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo ""
    echo "Getting API keys from Supabase..."
    echo ""
    echo "Please get your keys from:"
    echo "   ${PROJECT_URL}/settings/api"
    echo ""
    read -p "Enter NEXT_PUBLIC_SUPABASE_URL [$PROJECT_URL]: " SUPABASE_URL
    SUPABASE_URL=${SUPABASE_URL:-$PROJECT_URL}
    
    read -p "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_KEY
    
    if [ -z "$SUPABASE_KEY" ]; then
        echo -e "${RED}❌ API key required${NC}"
        exit 1
    fi
    
    # Create .env.local
    cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
EOF
    
    echo -e "${GREEN}✅ Created .env.local${NC}"
    echo ""
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Apply schema
echo "📦 Applying database schema..."
echo ""

# Try to apply via SQL file directly using psql if available
if command -v psql &> /dev/null; then
    echo "Using psql to apply schema..."
    # This would require the database connection string
    echo -e "${YELLOW}⚠️  psql requires database password${NC}"
    echo "   Falling back to manual method..."
fi

# Use Node.js script if available
if command -v node &> /dev/null && [ -f "scripts/apply-schema.js" ]; then
    echo "Using Node.js script to apply schema..."
    node scripts/apply-schema.js || {
        echo ""
        echo -e "${YELLOW}⚠️  Automated schema application not available${NC}"
        echo "   Please apply schema manually:"
        echo ""
        echo "   1. Go to: ${PROJECT_URL}/sql/new"
        echo "   2. Copy contents of: supabase/schema.sql"
        echo "   3. Paste and run"
        echo ""
        read -p "Press Enter after you've applied the schema..."
    }
else
    echo -e "${YELLOW}⚠️  Please apply schema manually:${NC}"
    echo ""
    echo "   1. Go to: ${PROJECT_URL}/sql/new"
    echo "   2. Copy contents of: supabase/schema.sql"
    echo "   3. Paste and run"
    echo ""
    read -p "Press Enter after you've applied the schema..."
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify schema was applied (check tables in Supabase)"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "To create admin user:"
echo "  1. Sign up at /auth/signup"
echo "  2. In Supabase → users table → change role to 'admin'"
echo ""
