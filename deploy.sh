#!/bin/bash

# NewU Deployment Script
# This script helps deploy NewU to Netlify

echo "🚀 NewU Deployment Script"
echo "=========================="
echo ""

# Check if build directory exists
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix errors and try again."
        exit 1
    fi
    echo "✅ Build completed successfully"
else
    echo "📦 dist/ directory already exists"
    read -p "🔄 Rebuild project? (y/n): " rebuild
    if [ "$rebuild" = "y" ] || [ "$rebuild" = "Y" ]; then
        npm run build
        if [ $? -ne 0 ]; then
            echo "❌ Build failed. Please fix errors and try again."
            exit 1
        fi
        echo "✅ Build completed successfully"
    fi
fi

echo ""
echo "📋 Deployment Options:"
echo "1. Manual deployment (drag & drop dist/ to Netlify)"
echo "2. CLI deployment (requires netlify-cli)"
echo "3. Git-based deployment (push to remote and deploy via Netlify)"
echo ""
read -p "Choose option (1-3): " option

case $option in
    1)
        echo ""
        echo "📤 Manual Deployment Instructions:"
        echo "1. Go to https://app.netlify.com/"
        echo "2. Click 'Add new site' → 'Deploy manually'"
        echo "3. Drag and drop the 'dist' folder from this directory"
        echo "4. After deployment, add environment variables:"
        echo "   - VITE_SUPABASE_URL"
        echo "   - VITE_SUPABASE_ANON_KEY"
        echo ""
        echo "✅ Ready for manual deployment!"
        ;;
    2)
        echo ""
        echo "🌐 Deploying via Netlify CLI..."

        # Check if netlify-cli is installed
        if ! command -v netlify &> /dev/null; then
            echo "⚠️  netlify-cli not found. Installing..."
            npm install -g netlify-cli
        fi

        echo "🔐 Logging in to Netlify..."
        netlify login

        echo "🚀 Deploying to production..."
        netlify deploy --prod --dir=dist

        echo ""
        echo "⚠️  Don't forget to add environment variables in Netlify dashboard:"
        echo "   - VITE_SUPABASE_URL"
        echo "   - VITE_SUPABASE_ANON_KEY"
        ;;
    3)
        echo ""
        echo "📦 Git-Based Deployment Instructions:"
        echo "1. Push your code to GitHub/GitLab/Bitbucket"
        echo "   git remote add origin <your-repo-url>"
        echo "   git push -u origin master"
        echo ""
        echo "2. Go to https://app.netlify.com/"
        echo "3. Click 'Add new site' → 'Import an existing project'"
        echo "4. Connect to your Git provider and select repository"
        echo "5. Configure build settings:"
        echo "   - Build command: npm run build"
        echo "   - Publish directory: dist"
        echo "6. Add environment variables:"
        echo "   - VITE_SUPABASE_URL"
        echo "   - VITE_SUPABASE_ANON_KEY"
        echo "7. Click 'Deploy site'"
        echo ""
        echo "✅ Ready for Git-based deployment!"
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "✅ Deployment preparation complete!"
