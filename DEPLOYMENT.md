# NewU - Deployment Guide

## Deploy to Netlify

### Option 1: Deploy via Netlify CLI (Recommended)

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy the site:
   ```bash
   netlify deploy --prod
   ```

   When prompted:
   - Choose "Create & configure a new site"
   - Select your team
   - Enter site name (e.g., `newu-addiction-recovery`)
   - Set publish directory to: `dist`

### Option 2: Deploy via Netlify Dashboard

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Go to [https://app.netlify.com/](https://app.netlify.com/)

3. Click "Add new site" → "Deploy manually"

4. Drag and drop the `dist` folder

### Option 3: Deploy via Git (Continuous Deployment)

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [https://app.netlify.com/](https://app.netlify.com/)

3. Click "Add new site" → "Import an existing project"

4. Connect to your Git provider and select the repository

5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

6. Add environment variables (if not already configured in Supabase):
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

7. Click "Deploy site"

## Environment Variables

The following environment variables are required and should already be in your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** When deploying to Netlify, make sure to add these environment variables in your Netlify site settings:
- Go to Site settings → Environment variables
- Add both variables with their values

## Post-Deployment

After deployment:

1. Test the authentication flow
2. Complete the onboarding process
3. Verify all 6 tabs are working
4. Test the emergency button
5. Verify Supabase connection is working

## Custom Domain (Optional)

To add a custom domain:

1. Go to your Netlify site settings
2. Click "Domain management"
3. Click "Add custom domain"
4. Follow the instructions to configure DNS

## Project Structure

```
NewU/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication screens
│   │   ├── onboarding/     # 4-step onboarding flow
│   │   ├── emergency/      # Emergency/panic support
│   │   └── tabs/           # 6 main app tabs
│   ├── contexts/           # React context (auth)
│   └── lib/                # Supabase client & utilities
├── dist/                   # Build output (generated)
└── netlify.toml           # Netlify configuration
```

## Support

For issues or questions:
- Check the Netlify deployment logs
- Verify Supabase environment variables
- Ensure database migrations are applied
