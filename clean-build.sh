#!/bin/bash

# Enhanced cleanup script to remove build files from source directories

echo "🧹 Cleaning ALL build files (including source directory pollution)..."

# Function to safely remove directory if it exists
remove_dir() {
    if [ -d "$1" ]; then
        echo "Removing $1"
        rm -rf "$1"
        echo "✅ Removed $1"
    else
        echo "⏭️  $1 does not exist, skipping"
    fi
}

# Function to remove build files from source directories
clean_source_pollution() {
    echo "🔍 Removing build files polluted in source directories..."
    
    # Remove JS, map, and d.ts files from API source
    find apps/api/src -name "*.js" -type f -delete 2>/dev/null || true
    find apps/api/src -name "*.js.map" -type f -delete 2>/dev/null || true
    find apps/api/src -name "*.d.ts" -type f -delete 2>/dev/null || true
    find apps/api/src -name "*.d.ts.map" -type f -delete 2>/dev/null || true
    
    # Remove JS, map, and d.ts files from package sources
    find packages -name "*.js" -type f -delete 2>/dev/null || true
    find packages -name "*.js.map" -type f -delete 2>/dev/null || true
    find packages -name "*.d.ts" -type f -not -path "*/node_modules/*" -delete 2>/dev/null || true
    find packages -name "*.d.ts.map" -type f -delete 2>/dev/null || true
    
    echo "✅ Cleaned source directory pollution"
}

# Clean build pollution from source directories
clean_source_pollution

# Remove proper build directories
remove_dir "apps/api/dist"
remove_dir "apps/web/dist"
remove_dir "apps/web/.next"
remove_dir "packages/database/dist"
remove_dir "packages/types/dist"
remove_dir "packages/trpc/dist"

# Also check for any other potential build directories
remove_dir "packages/ui/dist"
remove_dir "packages/utils/dist"

echo ""
echo "🎉 Build cleanup completed!"
echo ""
echo "You can now run 'npm run build:packages' to rebuild cleanly."
