#!/bin/bash

# Script to fix TypeScript dependency issues and clean build

echo "🔧 Fixing TypeScript dependency issues..."

# Function to clean package node_modules
clean_package_deps() {
    local package_dir="$1"
    if [ -d "$package_dir/node_modules" ]; then
        echo "🧹 Cleaning $package_dir/node_modules"
        rm -rf "$package_dir/node_modules"
        rm -f "$package_dir/package-lock.json"
    fi
}

# Clean all package-level node_modules (they're corrupted)
clean_package_deps "packages/types"
clean_package_deps "packages/database" 
clean_package_deps "packages/trpc"
clean_package_deps "apps/api"
clean_package_deps "apps/web"
clean_package_deps "apps/mobile"

echo "✅ Cleaned corrupted package dependencies"
echo ""
echo "🔄 Now run: npm run install:all"
echo "📦 Then run: npm run build"
