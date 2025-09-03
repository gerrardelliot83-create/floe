# Floe - Personal Productivity Platform

Transform your productivity with Floe's intelligent time management, task organization, and mindful productivity practices.

## 🚀 Features

### Core Features
- **⏱️ Pomodoro Timer**
  - Multiple session types: 45/15 (Deep Work), 25/5 (Pomodoro), or Custom
  - Visual progress tracking with circular timer
  - Session notes and task linking
  - Auto-transition between focus and break periods

- **📝 Advanced Task Management** 
  - Rich text editor powered by EditorJS
  - Subtasks, tags, and priority levels
  - Deadline tracking and filtering
  - Superlist-inspired interface

- **📅 Smart Calendar**
  - Schedule deep work sessions
  - Task deadline integration
  - Multiple view modes (Month, Week, Day)
  - Session configuration per event

- **🔥 Gamification & Streaks**
  - Daily streak tracking
  - Achievement system
  - Level progression
  - Focus time statistics

- **🎨 Beautiful UI**
  - Glassmorphism design system
  - Dynamic background images
  - Mobile-responsive layouts
  - Smooth animations with Framer Motion

### Additional Features
- **🚀 Onboarding Flow** - Personalized setup for new users
- **👤 User Profiles** - Custom preferences and settings
- **💬 Inspirational Quotes** - Rotating motivational messages
- **🔧 Admin Panel** - Content management system
- **📊 Statistics Dashboard** - Track productivity metrics

## 🛠️ Tech Stack

- **Frontend:** React, Next.js 15, TypeScript
- **Styling:** Vanilla CSS with glassmorphism design
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Magic Links
- **File Storage:** UploadThing
- **Animations:** Framer Motion v12
- **Rich Text:** EditorJS
- **Deployment:** Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/floe.git
cd floe/mindflo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# UploadThing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `lib/supabase/schema.sql`
   - Enable email authentication
   - Configure redirect URLs

5. Set up UploadThing:
   - Create an UploadThing account
   - Get your API keys
   - Add them to `.env.local`

## 🚀 Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📱 Mobile Responsiveness

The app is fully responsive with breakpoints at:
- Mobile: < 480px
- Tablet: < 768px  
- Desktop: > 1024px

## 🎨 Customization

### Fonts
- Headings: Lora (serif)
- Body: Inter (sans-serif)

### Color Scheme
Edit CSS variables in `app/globals.css`:
- Primary: #00D4FF (cyan)
- Secondary: #FF6B6B (red)
- Accent: #4ECDC4 (teal)
- Success: #06FFA5 (green)
- Warning: #FFB800 (yellow)
- Error: #FF3838 (red)

### Background Images
Add new backgrounds in `public/backgrounds/` and update the admin panel.

## 📊 Database Schema

The app uses the following main tables:
- `profiles` - User profiles and preferences
- `tasks` - Task management with rich content
- `sessions` - Pomodoro session tracking
- `calendar_events` - Scheduled deep work sessions
- `streaks` - Gamification data
- `quotes` - Inspirational quotes
- `backgrounds` - Custom background images

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy!

```bash
vercel --prod
```

### Environment Variables for Production

Set these in your Vercel dashboard:
- All variables from `.env.local`
- Update `NEXT_PUBLIC_APP_URL` to your production URL

## 🔒 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Magic link authentication for passwordless login
- Admin-only routes protected by middleware
- Secure file uploads with UploadThing

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Audio notifications require user interaction to enable
- EditorJS requires client-side rendering (no SSR)
- Calendar recurring events not yet implemented

## 📞 Support

For support, email support@getfloe.app or open an issue on GitHub.

---

Built with ❤️ by the Floe Team