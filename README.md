# NewU - Identity Transformation Platform

**Tagline:** "Become Someone New."

**Mission:** The strength you need is already inside you. NewU helps you find it.

## Overview

NewU is a complete identity transformation platform for people recovering from smoking, vaping, snus, and alcohol addiction. Unlike traditional apps that focus on what you're losing, NewU focuses entirely on what you're gaining — your new identity, your new body, your new life, your new self.

## Core Philosophy

**You are not quitting anything. You are becoming someone new.**

This single reframe changes everything. The app is built on the principle that identity transformation is more powerful than willpower.

## Features

### 🏠 Home Dashboard
- Live time-free counter (days, hours, minutes, seconds)
- Real-time money saved calculator
- Science-backed health recovery timeline
- Daily mood check-in
- Educational science facts
- Milestone celebration system

### 💪 My Body
- Health milestone tracking with science-backed timeline
- Selfie transformation tracker
- Body healing visualization
- Achievement celebrations

### 🧠 My Triggers
- Personal trigger mapping with tracking
- CBT tools (90-second pause practice)
- Identity statement reinforcement
- Resistance rate tracking

### 🌟 My Wellness
- Activity logging (gym, meditation, healthy meals, etc.)
- Vitality score system
- Frequency healing player (432Hz, 528Hz, 396Hz, 963Hz)
- Recent activity tracking

### 🎯 My Dreams (Bucket List)
- Track dreams with associated costs
- Live progress bars showing savings toward goals
- Achievement celebration
- Visual motivation system

### 👤 Profile
- Journey overview and statistics
- Personal "My Why" statement
- Account settings
- Sign out functionality

### 🆘 Emergency Support
- Always-visible emergency button
- Compassionate crisis check-in
- 90-second breathing exercise
- Multiple support pathways

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email/password)
- **Hosting:** Netlify

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd newu
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run database migrations:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration file from `supabase/migrations/20260317192612_create_newu_schema.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Netlify.

### Quick Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy via Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
NewU/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication screens
│   │   ├── emergency/         # Emergency support system
│   │   ├── onboarding/        # 4-step onboarding flow
│   │   └── tabs/              # 6 main application tabs
│   ├── contexts/              # React contexts (auth)
│   ├── lib/                   # Utilities and Supabase client
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── supabase/
│   └── migrations/            # Database migrations
├── dist/                      # Build output (generated)
├── netlify.toml              # Netlify configuration
└── package.json              # Dependencies and scripts
```

## Database Schema

The app uses Supabase PostgreSQL with Row Level Security (RLS):

- **profiles** - User profile information
- **journeys** - User addiction recovery journeys
- **triggers** - Personal trigger mapping
- **trigger_logs** - Trigger activation history
- **activities** - Wellness activities
- **bucket_items** - Dreams/goals with cost tracking
- **milestones** - Achievement tracking
- **daily_checkins** - Daily mood tracking
- **journal_entries** - User reflections
- **selfie_records** - Transformation photos

## Science Foundation

NewU is built on evidence-based principles:

- **Neuroplasticity:** The brain physically rewires through consistent new choices
- **90-second rule:** Cravings last 90 seconds if you don't feed them
- **HRV tracking:** Heart Rate Variability improves as you heal
- **Dopamine restoration:** Timeline of brain chemistry recovery
- **Health recovery:** Science-backed timeline of body healing

## Design Principles

- **Clean & Minimal:** Nike meets healthcare meets mindfulness
- **Mobile-First:** Optimized for mobile use with responsive design
- **Empowering:** Focus on what you're gaining, not losing
- **Compassionate:** Zero shame, pure support
- **Evidence-Based:** Science-backed but human-centered

## Color Palette

- Primary Background: `#F8F9FC` (near white)
- Primary Accent: `#2A5ACA` (trust blue)
- Secondary Accent: `#1A8A5A` (growth green)
- Success: `#2ABA7A` (bright green)
- Emergency: `#E84A3A` (clear red)
- Text Primary: `#1A1A2A` (near black)
- Text Secondary: `#6A7A9A` (medium grey-blue)

## Contributing

This is a private project. For questions or issues, please contact the development team.

## License

Proprietary - All Rights Reserved

## Support

For technical support or questions:
- Check the deployment logs in Netlify
- Verify Supabase connection and environment variables
- Review database migrations are properly applied

---

**Built with:** React, TypeScript, Tailwind CSS, Supabase, and Netlify

**Philosophy:** "You don't need willpower. You need identity. From today — you are someone new."
