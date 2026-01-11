#!/bin/bash

# Five Tiers Connect - Supabase Setup Script

set -e

echo "🚀 Five Tiers Connect - Supabase Setup"
echo "======================================"
echo ""

# Check if already linked
if [ -f "supabase/.temp/project-ref" ]; then
    echo "✅ Already linked to a project"
    CURRENT_REF=$(cat supabase/.temp/project-ref)
    echo "   Current project: $CURRENT_REF"
    read -p "   Link to different project? (y/N): " RELINK
    if [ "$RELINK" != "y" ]; then
        echo "   Using existing link..."
    else
        echo ""
        echo "Available projects:"
        supabase projects list
        echo ""
        read -p "Enter project reference ID: " PROJECT_REF
        supabase link --project-ref "$PROJECT_REF"
    fi
else
    echo "Available projects:"
    supabase projects list
    echo ""
    read -p "Enter project reference ID to link (or 'new' to create): " PROJECT_REF
    
    if [ "$PROJECT_REF" = "new" ]; then
        echo ""
        echo "Creating new project..."
        read -p "Project name: " PROJECT_NAME
        read -p "Organization ID: " ORG_ID
        supabase projects create "$PROJECT_NAME" --org-id "$ORG_ID"
        echo "Check output above for project reference ID, then run this script again"
        exit 0
    else
        supabase link --project-ref "$PROJECT_REF"
    fi
fi

echo ""
echo "📦 Pushing database schema..."
supabase db push

echo ""
echo "✅ Schema pushed successfully!"
echo ""
echo "📋 Getting project credentials..."
echo ""

# Try to get status (might not work if not local)
supabase status 2>/dev/null || echo "   (Local Supabase not running - get credentials from dashboard)"

echo ""
echo "🔑 Next steps:"
echo "   1. Get your credentials from: https://supabase.com/dashboard/project/_/settings/api"
echo "   2. Create .env.local file:"
echo ""
echo "      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
echo "      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "   3. Run: npm run dev"
echo ""
