# Floe - AI-Powered Knowledge Management

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/floe)
[![EAS Build](https://img.shields.io/badge/Built%20with-Expo%20EAS-4630EB.svg)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A privacy-focused personal knowledge management system with AI-powered auto-organization. Built with modern web technologies and an ultra-minimalist design philosophy.

## ✨ Features

### 🧠 AI-Powered Intelligence
- **Smart Spaces**: Automatic content organization based on AI rules
- **Advanced Search**: Full-text and vector similarity search
- **Content Analysis**: AI-powered tagging, categorization, and sentiment analysis
- **Related Content**: Discover connections between your saved items

### 📱 Cross-Platform Experience
- **Web App**: Next.js 15 with App Router and ultra-minimalist design
- **Mobile Apps**: Native iOS and Android apps built with Expo
- **Real-Time Sync**: Instant synchronization across all devices
- **Offline Support**: Access your content anywhere, anytime

### 🎨 Ultra-Minimalist Design
- **Black & White Only**: Strict monochrome palette for distraction-free focus
- **Typography-First**: Content hierarchy through typography, not decoration
- **Extreme Whitespace**: Generous spacing for visual breathing room
- **Invisible Interface**: UI disappears to let your content dominate

### 🔒 Privacy-First Architecture
- **Data Ownership**: Your data belongs to you
- **Local Processing**: AI processing with privacy controls
- **Secure Authentication**: OAuth, biometric, and magic link options
- **End-to-End Security**: Comprehensive security at every layer

## 🏗️ Architecture

- **Frontend**: Next.js (web) + Expo (mobile)
- **Backend**: Supabase (auth, database, real-time)
- **Storage**: UploadThing (files, media)
- **AI**: Anthropic Claude (processing, analysis)
- **Monorepo**: Turborepo

## Project Structure

```
floe/
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # Expo mobile application
├── packages/
│   ├── shared/              # Shared business logic, types, utilities
│   ├── ui/                  # Shared UI components
│   └── supabase/            # Supabase client and services
├── config/                  # Configuration files
└── PROGRESS.md              # Development progress tracker
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- UploadThing account
- Anthropic API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd getfloe
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Fill in your API keys and URLs
   ```

3. **Set up Supabase:**
   - Create a new Supabase project
   - Copy the project URL and anon key to your `.env.local`
   - Run the database migrations (see Setup Guide below)

4. **Set up UploadThing:**
   - Create a new UploadThing project
   - Copy the token to your `.env.local`

5. **Set up Anthropic Claude:**
   - Get your API key from Anthropic
   - Add it to your `.env.local`

### Development

```bash
# Start all apps in development mode
npm run dev

# Start specific app
npm run dev --filter=@floe/web
npm run dev --filter=@floe/mobile

# Build all packages
npm run build

# Lint and type check
npm run lint
npm run type-check
```

### URLs in Development

- Web app: http://localhost:3000
- Mobile app: Use Expo Go app with QR code

## Next Steps - Setup Required

### 1. **Supabase Setup** ⚠️ **Required**
You need to:
- Create a Supabase project
- Run the database schema (see `PROGRESS.md` for SQL)
- Configure Row Level Security policies
- Set up storage buckets

### 2. **UploadThing Setup** ⚠️ **Required**
You need to:
- Create an UploadThing account
- Get your token
- Configure file upload limits

### 3. **Anthropic Setup** ⚠️ **Required**
You need to:
- Get an Anthropic API key
- Set usage limits if needed

### 4. **Mobile Assets** 📱
Create the following assets:
- `apps/mobile/assets/icon.png` (1024x1024)
- `apps/mobile/assets/adaptive-icon.png` (1024x1024)
- `apps/mobile/assets/splash.png` (1242x2436)
- `apps/mobile/assets/favicon.png` (32x32)

**Design Requirements:**
- Pure black geometric shapes
- No colors except black/white
- No emojis anywhere
- Minimal, clean design

## 📊 Development Progress

| Prompt | Feature | Status | Description |
|--------|---------|--------|-------------|
| 1 | Project Structure | ✅ Complete | Turborepo setup, Next.js + Expo apps |
| 2 | Database Schema | ✅ Complete | Supabase with RLS, vectors, search |
| 3 | Authentication | ✅ Complete | OAuth, biometric, magic links |
| 4 | UI Components | ✅ Complete | Minimalist design system |
| 5 | Content Capture | ✅ Complete | Multi-format content processing |
| 6 | Search System | ✅ Complete | Full-text + vector similarity search |
| 7 | Smart Spaces | ✅ Complete | AI-powered auto-organization |
| 8 | Real-time Sync | 🔄 In Progress | Live updates and offline support |
| 9 | Media Processing | ⏳ Planned | OCR, transcription, thumbnails |
| 10 | AI Integration | ⏳ Planned | Complete Claude integration |
| 11 | Performance | ⏳ Planned | Optimization and caching |
| 12 | UI Polish | ⏳ Planned | Animations and micro-interactions |
| 13 | Testing & Deploy | ⏳ Planned | Comprehensive testing suite |

**Current Status**: 7/13 prompts completed (54% complete)

## Development Philosophy

**Ultra-Minimalist Design:**
- Strict black & white color palette
- Extreme whitespace and clean typography
- No decorative elements or emojis
- Content-first, invisible interface
- Swiss design principles

**Privacy-First:**
- No tracking or analytics
- Local-first data approach
- User controls all their data
- AI processing respects privacy

## Commands

```bash
# Development
npm run dev              # Start all apps
npm run build            # Build all packages
npm run lint             # Lint all code
npm run type-check       # TypeScript checking
npm run clean            # Clean build artifacts

# Package-specific
npm run dev --filter=@floe/web
npm run build --filter=@floe/shared
npm run lint --filter=@floe/mobile
```

## License

Private project - All rights reserved

---

**Progress:** See `PROGRESS.md` for detailed development status and next steps.