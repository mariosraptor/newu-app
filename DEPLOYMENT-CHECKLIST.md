# NewU - Deployment Checklist

## Pre-Deployment

- [x] Build completes successfully
- [x] All components render without errors
- [x] Supabase database schema created
- [x] Environment variables configured
- [x] Git repository initialized
- [x] README and documentation complete
- [x] Netlify configuration file created

## Netlify Deployment Steps

### Option 1: Manual Deployment (Quickest)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Go to Netlify:**
   - Visit https://app.netlify.com/
   - Log in or create account

3. **Deploy:**
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `dist` folder
   - Wait for deployment to complete

4. **Configure environment variables:**
   - Go to Site settings → Environment variables
   - Add `VITE_SUPABASE_URL` with your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` with your Supabase anon key
   - Trigger a redeploy after adding variables

### Option 2: Git-Based Deployment (Recommended for Production)

1. **Push to GitHub/GitLab/Bitbucket:**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin master
   ```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Select your Git provider
   - Choose the repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 or higher (set in environment variables if needed)

4. **Add environment variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete

### Option 3: CLI Deployment

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Initialize and deploy:**
   ```bash
   netlify init
   ```

   Or if already initialized:
   ```bash
   netlify deploy --prod
   ```

## Post-Deployment Verification

### Test Core Functionality

- [ ] Site loads without errors
- [ ] Auth screen displays correctly
- [ ] Sign up creates new user
- [ ] Sign in works for existing users
- [ ] Onboarding flow completes (4 steps)
- [ ] User reaches main dashboard after onboarding
- [ ] All 6 tabs are visible and clickable

### Test Each Tab

- [ ] **Home Tab:** Counter runs, mood check-in works
- [ ] **Body Tab:** Milestones display correctly
- [ ] **Triggers Tab:** Trigger map and tools visible
- [ ] **Wellness Tab:** Can log activities, frequency player works
- [ ] **Dreams Tab:** Can add bucket items, progress bars show
- [ ] **Profile Tab:** User info displays, sign out works

### Test Emergency Feature

- [ ] Emergency button visible on all screens
- [ ] Clicking opens modal
- [ ] Check-in flow works
- [ ] Breathing exercise completes

### Test Data Persistence

- [ ] Data saves to Supabase
- [ ] Data persists after page refresh
- [ ] Real-time calculations work (money saved, time free)
- [ ] Multiple journeys can be tracked

## Environment Variables Reference

Required environment variables in Netlify:

```
VITE_SUPABASE_URL=https://qslqidystxroccecwrtf.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Custom Domain Setup (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Configure DNS records as shown
5. Wait for DNS propagation (can take up to 48 hours)
6. Enable HTTPS (automatic via Let's Encrypt)

## Rollback Procedure

If something goes wrong:

1. Go to Netlify dashboard → Deploys
2. Find the last working deployment
3. Click "Publish deploy" on that version
4. Site will rollback immediately

## Monitoring

After deployment, monitor:

- Netlify deployment logs for errors
- Supabase logs for database errors
- Browser console for client-side errors
- User feedback and bug reports

## Next Steps

- [ ] Test with real users
- [ ] Monitor performance metrics
- [ ] Set up error tracking (optional: Sentry)
- [ ] Configure custom domain (if applicable)
- [ ] Set up monitoring/analytics (if desired)

## Support Resources

- **Netlify Docs:** https://docs.netlify.com/
- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/

---

**Last Updated:** 2026-03-17
