# Technical Requirements Document for Claude Code
## Floe Application - Expo, React, Supabase, Vercel Stack

---

## Design Philosophy & Core Principles

### Ultra-Minimalist Design Direction

This application follows an **extreme minimalist design philosophy** inspired by the most sophisticated and clean interfaces. The design must:

1. **Embrace Whitespace**: Space is the primary design element. Every interface should breathe.
2. **Monochrome Only**: Strict black and white palette. No colors except for user content.
3. **Typography-First**: Let text hierarchy and spacing create visual interest.
4. **Invisible Interface**: The UI should disappear, letting content dominate.
5. **No Decorative Elements**: Every pixel must serve a functional purpose.
6. **No Emojis**: Absolutely no emojis anywhere in the interface.
7. **Geometric Simplicity**: When icons are necessary, use only simple geometric shapes.

### Design References
- Think of interfaces like: iA Writer, Linear (monochrome mode), Stripe Dashboard, Mirror.xyz
- Swiss design principles: grid systems, typography, and maximum clarity
- Japanese minimalism: removing everything unnecessary until only essence remains

### Implementation Rules
```typescript
const DESIGN_RULES = {
  colors: {
    allowed: ['#000000', '#FFFFFF', 'rgba(0,0,0,0.x)', 'rgba(255,255,255,0.x)'],
    forbidden: ['any color with hue', 'gradients', 'shadows with color']
  },
  spacing: {
    minimum: '24px between elements',
    sections: '64px or more',
    breathing: 'generous padding around all content'
  },
  typography: {
    fonts: 'system fonts only',
    weights: 'maximum 3 weights',
    decoration: 'none except essential emphasis'
  },
  interactions: {
    hover: 'opacity change only',
    transitions: 'subtle and fast (150ms max)',
    feedback: 'minimal and purposeful'
  }
};
```

---

## Overview & Architecture Context

This document contains a series of detailed prompts for Claude Code to build a complete Floe application using:
- **Expo** for cross-platform mobile/tablet development
- **React** for web application
- **Supabase** for backend services (auth, database, storage, real-time)
- **Vercel** for web deployment
- **Expo EAS** for mobile builds and deployment

The application is a privacy-focused personal knowledge management system that uses AI to automatically organize saved content without manual tagging or folders.

---

## PROMPT 1: Initialize Project Structure and Core Configuration

Create a monorepo structure for the Floe application with shared code between web and mobile platforms. Set up the following:

### Project Structure:
```
floe/
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # Expo application
├── packages/
│   ├── shared/              # Shared business logic, types, utilities
│   ├── ui/                  # Shared UI components (React Native Web compatible)
│   └── supabase/            # Supabase client and services
├── config/
│   └── supabase/            # Supabase migrations and types
```

### Initialize the monorepo with:
1. **Turborepo** for monorepo management
2. **TypeScript** configuration shared across all packages
3. **ESLint** and **Prettier** with consistent rules

### For apps/mobile (Expo):
```json
{
  "expo": {
    "name": "Floe",
    "slug": "floe",
    "version": "1.0.0",
    "orientation": "default",
    "icon": "./assets/icon.png",  // Simple black/white geometric icon
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",  // Minimal text or geometric logo only
      "resizeMode": "contain",
      "backgroundColor": "#FFFFFF"  // Pure white background
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/[project-id]"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.floe.app",
      "usesAppleSignIn": true,
      "userInterfaceStyle": "automatic"  // Respect system dark/light mode
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",  // Black geometric icon
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.floe.app",
      "userInterfaceStyle": "automatic"
    },
    "web": {
      "favicon": "./assets/favicon.png",  // Simple black/white favicon
      "bundler": "metro"
    },
    "plugins": [
      "expo-apple-authentication",
      "expo-secure-store",
      "expo-media-library",
      "expo-document-picker",
      "expo-image-picker"
    ]
  }
}
```

**Asset Requirements:**
- All icons must be geometric shapes in pure black (will invert for dark mode)
- No emoji assets anywhere in the project
- Logo should be typographic or simple geometric
- No colored images except user-uploaded content
- Splash screen should be minimal - just the app name in clean typography

### For apps/web (Next.js):
- Configure Next.js 14 with App Router
- Set up Tailwind CSS with a configuration that's compatible with React Native Web
- Configure environment variables for Supabase
- Set up PWA capabilities with next-pwa

### For packages/supabase:
Create a Supabase client configuration that works for both web and mobile:
```typescript
// packages/supabase/src/client.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web'
  }
});
```

### Required dependencies:
- Expo SDK 50+
- React 18+
- React Native 0.73+
- Next.js 14+
- Supabase JS Client 2.38+
- TypeScript 5.3+
- Tailwind CSS 3.4+
- NativeWind for mobile styling

---

## PROMPT 2: Supabase Database Schema and Security

Set up the complete Supabase database schema with Row Level Security (RLS) policies. Create the following tables and relationships:

### Database Schema:

```sql
-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector" with schema public;
create extension if not exists "pg_trgm";

-- Custom types
create type card_type as enum (
  'note', 'image', 'article', 'video', 'pdf', 'quote', 
  'recipe', 'tweet', 'product', 'link', 'audio'
);

create type subscription_tier as enum ('free', 'student', 'pro', 'lifetime');

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  subscription_tier subscription_tier default 'free',
  subscription_expires_at timestamp with time zone,
  storage_used_bytes bigint default 0,
  storage_limit_bytes bigint default 5368709120, -- 5GB
  onboarding_completed boolean default false,
  preferences jsonb default '{
    "theme": "system",
    "language": "en",
    "emailNotifications": true,
    "aiProcessing": true,
    "searchHistory": true
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cards table (main content)
create table public.cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  type card_type not null,
  title text,
  content text, -- For notes and extracted text
  url text,
  source_domain text,
  media_url text,
  thumbnail_url text,
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  media_metadata jsonb default '{}'::jsonb, -- dimensions, duration, size, etc.
  
  -- AI-generated fields
  ai_tags text[] default array[]::text[],
  ai_summary text,
  ai_entities jsonb default '{}'::jsonb,
  ai_colors text[] default array[]::text[], -- hex colors
  ai_sentiment numeric(3,2), -- -1 to 1
  ai_category text,
  ai_processed boolean default false,
  ai_processed_at timestamp with time zone,
  embedding vector(1536), -- OpenAI embeddings
  
  -- Search
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(ai_tags, ' '), '')), 'C')
  ) stored,
  
  -- Organization
  is_pinned boolean default false,
  is_archived boolean default false,
  is_favorite boolean default false,
  manual_tags text[] default array[]::text[],
  smart_space_ids uuid[] default array[]::uuid[],
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  accessed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- Smart Spaces (auto-collections)
create table public.smart_spaces (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  description text,
  icon text default 'folder',  -- Simple text identifier for geometric icons
  color text default '#000000', -- Black for light mode, white for dark mode
  
  -- Rules for automatic inclusion (JSON query)
  rules jsonb not null default '{
    "conditions": [],
    "logic": "AND"
  }'::jsonb,
  /* Example rules:
  {
    "conditions": [
      {"field": "type", "operator": "equals", "value": "image"},
      {"field": "ai_tags", "operator": "contains", "value": "design"}
    ],
    "logic": "AND"
  }
  */
  
  is_active boolean default true,
  is_default boolean default false,
  cards_count integer default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Highlights (for articles/PDFs)
create table public.highlights (
  id uuid default uuid_generate_v4() primary key,
  card_id uuid references public.cards on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  text text not null,
  note text,
  color text default '#ffeb3b',
  position jsonb, -- {start: number, end: number, page?: number}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- OCR Results (for images)
create table public.ocr_results (
  id uuid default uuid_generate_v4() primary key,
  card_id uuid references public.cards on delete cascade not null unique,
  full_text text,
  blocks jsonb, -- Detailed text blocks with positions
  language text,
  confidence numeric(3,2),
  processed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quick capture (temporary storage before processing)
create table public.quick_captures (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  type text not null,
  content jsonb not null,
  processed boolean default false,
  card_id uuid references public.cards on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index idx_cards_user_id on public.cards(user_id);
create index idx_cards_type on public.cards(type);
create index idx_cards_created_at on public.cards(created_at desc);
create index idx_cards_is_pinned on public.cards(is_pinned) where is_pinned = true;
create index idx_cards_ai_tags on public.cards using gin(ai_tags);
create index idx_cards_search on public.cards using gin(search_vector);
create index idx_cards_embedding on public.cards using ivfflat(embedding vector_cosine_ops);

-- Full-text search function
create or replace function search_cards(
  search_query text,
  user_uuid uuid,
  limit_count integer default 50
)
returns table (
  id uuid,
  title text,
  content text,
  type card_type,
  thumbnail_url text,
  created_at timestamp with time zone,
  rank real
)
language plpgsql
as $$
begin
  return query
  select 
    c.id,
    c.title,
    c.content,
    c.type,
    c.thumbnail_url,
    c.created_at,
    ts_rank(c.search_vector, websearch_to_tsquery('english', search_query)) as rank
  from public.cards c
  where 
    c.user_id = user_uuid
    and c.deleted_at is null
    and c.search_vector @@ websearch_to_tsquery('english', search_query)
  order by rank desc
  limit limit_count;
end;
$$;

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.smart_spaces enable row level security;
alter table public.highlights enable row level security;
alter table public.ocr_results enable row level security;
alter table public.quick_captures enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Cards policies
create policy "Users can view own cards" on public.cards
  for select using (auth.uid() = user_id);

create policy "Users can insert own cards" on public.cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update own cards" on public.cards
  for update using (auth.uid() = user_id);

create policy "Users can delete own cards" on public.cards
  for delete using (auth.uid() = user_id);

-- Similar policies for other tables...

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();

create trigger update_cards_updated_at before update on public.cards
  for each row execute function update_updated_at_column();

-- Storage buckets
insert into storage.buckets (id, name, public) values 
  ('cards-media', 'cards-media', false),
  ('user-avatars', 'user-avatars', false),
  ('temp-uploads', 'temp-uploads', false);

-- Storage policies
create policy "Users can upload card media" on storage.objects
  for insert with check (
    bucket_id = 'cards-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own card media" on storage.objects
  for select using (
    bucket_id = 'cards-media' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## PROMPT 3: Authentication and User Management System

Build a complete authentication system using Supabase Auth that works across web and mobile platforms:

### Core Authentication Features:
1. Email/Password authentication
2. Magic link authentication
3. OAuth providers (Google, Apple, GitHub)
4. Session management with refresh tokens
5. Protected routes and navigation guards

### Create the following authentication components in packages/ui/src/auth/:

```typescript
// AuthContext.tsx - Shared authentication context
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@floe/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'apple' | 'github') => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

// Implement complete context with session persistence
```

### Platform-specific authentication flows:

#### Mobile (Expo):
- Use expo-auth-session for OAuth flows
- Implement expo-secure-store for secure token storage
- Handle deep linking for magic links and OAuth callbacks
- Implement biometric authentication (FaceID/TouchID/Fingerprint)

```typescript
// apps/mobile/src/services/auth.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';

class MobileAuthService {
  async enableBiometric(): Promise<void> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Floe',
        fallbackLabel: 'Use passcode',
      });
      
      if (result.success) {
        await SecureStore.setItemAsync('biometric_enabled', 'true');
      }
    }
  }
  
  async authenticateWithBiometric(): Promise<boolean> {
    // Implement biometric authentication check
  }
}
```

#### Web (Next.js):
- Implement middleware for protected routes
- Set up SSR-compatible authentication
- Handle OAuth redirects
- Implement "Remember me" functionality

```typescript
// apps/web/src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protected routes logic
  if (!session && req.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  
  return res;
}
```

### User onboarding flow:
1. Welcome screen with app benefits
2. Account creation/sign in
3. Profile setup (name, username)
4. Preferences selection (theme, language)
5. Optional: Import data from other services
6. Tutorial/feature highlights

---

## PROMPT 4: Core UI Components and Design System

Create an ultra-minimalist design system emphasizing extreme cleanliness, abundant whitespace, and a strict black/white color palette:

### Design Philosophy:
- **Extreme minimalism**: Remove all unnecessary visual elements
- **Generous whitespace**: Use space as the primary design element
- **Typography-first**: Let content hierarchy drive the interface
- **Invisible interface**: UI should disappear, content should dominate
- **No decorative elements**: Every pixel must have a purpose
- **NO EMOJIS**: Use only text and geometric icons throughout

### Design Tokens:
```typescript
// packages/ui/src/theme/index.ts
export const theme = {
  colors: {
    // Light mode - pure monochrome
    light: {
      background: '#FFFFFF',
      surface: '#FFFFFF', 
      border: '#F0F0F0',  // Barely visible borders
      divider: '#F7F7F7', // Ultra-subtle dividers
      
      text: {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
        disabled: '#CCCCCC',
        inverse: '#FFFFFF'
      },
      
      // Minimal accent states
      hover: 'rgba(0, 0, 0, 0.02)',
      pressed: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.06)',
      focus: '#000000',
    },
    
    // Dark mode - pure black
    dark: {
      background: '#000000',
      surface: '#000000',
      border: '#1A1A1A',  // Barely visible borders
      divider: '#0D0D0D', // Ultra-subtle dividers
      
      text: {
        primary: '#FFFFFF',
        secondary: '#999999',
        tertiary: '#666666', 
        disabled: '#333333',
        inverse: '#000000'
      },
      
      // Minimal accent states
      hover: 'rgba(255, 255, 255, 0.02)',
      pressed: 'rgba(255, 255, 255, 0.04)',
      selected: 'rgba(255, 255, 255, 0.06)',
      focus: '#FFFFFF',
    },
    
    // Semantic colors - monochrome only
    semantic: {
      error: '#000000',    // Use text/icons for errors
      warning: '#666666',  // Gray for warnings
      success: '#000000',  // Use checkmarks/text
      info: '#999999',     // Subtle gray
    }
  },
  
  spacing: {
    // Generous spacing scale
    micro: 4,
    xs: 8,
    sm: 16,
    md: 24,
    lg: 40,
    xl: 64,
    xxl: 96,
    xxxl: 128,
  },
  
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
      mono: 'SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    
    // Minimalist type scale
    fontSize: {
      micro: 11,
      xs: 12,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 21,
      '2xl': 27,
      '3xl': 32,
      display: 48,
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    }
  },
  
  borderRadius: {
    none: 0,
    subtle: 2,
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  
  // Minimal shadows - almost invisible
  shadows: {
    none: 'none',
    subtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
    md: '0 4px 8px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.10)',
  },
  
  animation: {
    duration: {
      instant: 0,
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      linear: 'linear',
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  },
  
  layout: {
    maxWidth: 1200,
    contentWidth: 960,
    articleWidth: 680,
    sidebarWidth: 280,
    
    grid: {
      columns: 12,
      gap: 24,
    }
  }
};
```

### Core Components - Minimalist Implementation:

1. **Card Component** - Ultra-clean content display
```typescript
interface CardProps {
  id: string;
  type: CardType;
  title?: string;
  content?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  isPinned: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
}

// Minimalist card styling
const CardStyles = {
  container: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    padding: 0,
    marginBottom: theme.spacing.xl, // Generous spacing
  },
  image: {
    width: '100%',
    aspectRatio: 'auto',
    borderRadius: 0, // Sharp edges for clean look
  },
  content: {
    paddingTop: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.light.text.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  metadata: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.light.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
    textTransform: 'uppercase', // Subtle sophistication
  }
};
```

2. **Grid Layout** - Clean, spacious grid system
   - Maximum whitespace between items
   - No borders or dividers
   - Content breathes naturally
   - Responsive column system with generous gutters
   - No hover effects, only subtle opacity changes

3. **SearchBar** - Invisible until focused
```typescript
const MinimalSearchBar = {
  container: {
    border: 'none',
    borderBottom: `1px solid ${theme.colors.light.border}`,
    background: 'transparent',
    padding: `${theme.spacing.md}px 0`,
  },
  input: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.light,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    placeholder: 'Search...',
    placeholderColor: theme.colors.light.text.tertiary,
  },
  focused: {
    borderBottom: `1px solid ${theme.colors.light.text.primary}`,
  }
};
```

4. **SmartSpaceCard** - Text-only collection display
   - No icons or decorative elements
   - Simple text label
   - Subtle count indicator
   - Clean typography hierarchy

5. **QuickCapture** - Minimal floating button
   - Simple plus symbol or text
   - No background until hover
   - Clean modal with maximum whitespace
   - Text-first interface

6. **TagDisplay** - Clean text tags
   - No colored backgrounds
   - Simple text with subtle separators
   - Uppercase micro text
   - Generous spacing between tags

### Platform-specific adaptations:

#### Mobile/Tablet:
- Swipe gestures with minimal visual feedback
- Ultra-light haptic feedback (ImpactFeedbackStyle.Light only, used sparingly)
- Clean bottom sheets with abundant padding (80px top padding minimum)
- Simple tab bar with text labels only (no icons)
- Maximalist use of screen space for content
- No floating action buttons - integrate actions inline
- Pull-to-refresh with minimal visual indicator

#### Web:
- Keyboard shortcuts with no visual hints (document in help only)
- Minimal context menus with text only
- No hover states except subtle opacity (0.7)
- Clean panels with invisible borders
- Command palette with pure text interface (no icons)
- Cursor changes minimally (pointer for clickable, text for editable)
- No tooltips unless absolutely necessary for accessibility

### Minimalist UI Principles:

```typescript
// packages/ui/src/principles/minimal.ts

export const MinimalUIRules = {
  // Spacing rules
  spacing: {
    betweenElements: 'minimum 24px',
    betweenSections: 'minimum 64px',
    pageMargins: 'minimum 40px mobile, 80px desktop',
    linHeight: '1.6 minimum for readability',
  },
  
  // Interactive elements
  interactions: {
    hoverOpacity: 0.7,
    pressedOpacity: 0.5,
    disabledOpacity: 0.3,
    transitionDuration: '150ms',
    noDecorations: true,
    noBordersOnFocus: false, // Use opacity instead
  },
  
  // Typography rules
  typography: {
    singleFontFamily: true,
    limitedWeights: ['400', '500', '600'],
    noItalics: true,
    noUnderlines: true,
    subtleHierarchy: true,
  },
  
  // Visual elements
  visuals: {
    noGradients: true,
    noShadows: true, // Except very subtle ones
    noRoundedCorners: false, // But keep them minimal
    noBorders: false, // But make them barely visible
    noIcons: false, // But use sparingly and geometric only
    noEmojis: true, // Strictly forbidden
    noColorAccents: true, // Black and white only
  }
};

// Component examples following minimal principles
export const MinimalButton = {
  base: {
    border: 'none',
    background: 'transparent',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.02em',
    textTransform: 'none',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
  },
  primary: {
    background: '#000',
    color: '#FFF',
  },
  secondary: {
    border: '1px solid #000',
    color: '#000',
  },
  ghost: {
    color: '#000',
    textDecoration: 'none',
  },
  hover: {
    opacity: 0.7,
  }
};

export const MinimalInput = {
  base: {
    border: 'none',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    padding: '8px 0',
    fontSize: '15px',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    transition: 'border-color 150ms ease',
  },
  focus: {
    borderBottom: '1px solid #000',
  },
  placeholder: {
    color: 'rgba(0,0,0,0.3)',
  }
};
```

### Minimalist Layout System:

```typescript
// packages/ui/src/layout/grid.ts

export const MinimalGrid = {
  // Desktop grid - maximum breathing room
  desktop: {
    maxWidth: 1400,
    contentWidth: 1200,
    columns: 12,
    gutter: 40, // Generous gutters
    margin: 80, // Large page margins
    
    // Card grid specific
    cardColumns: {
      xl: 4,  // 3 cards per row
      lg: 3,  // 4 cards per row  
      md: 2,  // 6 cards per row
      sm: 1,  // 12 cards per row
    },
    cardGap: 60, // Large gap between cards
  },
  
  // Mobile grid - still spacious
  mobile: {
    margin: 24,
    gutter: 24,
    cardGap: 40,
    columns: 4,
  },
  
  // Tablet - balanced spacing
  tablet: {
    margin: 40,
    gutter: 32,
    cardGap: 48,
    columns: 8,
  }
};

// Layout components
export const MinimalContainer = styled.div`
  max-width: ${props => props.narrow ? '680px' : '1200px'};
  margin: 0 auto;
  padding: 80px 40px;
  
  @media (max-width: 768px) {
    padding: 40px 24px;
  }
`;

export const MinimalSection = styled.section`
  margin-bottom: 120px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 80px;
  }
`;

export const MinimalHeader = styled.header`
  margin-bottom: 80px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  h1 {
    font-size: 32px;
    font-weight: 400;
    letter-spacing: -0.02em;
    margin: 0;
  }
  
  p {
    font-size: 15px;
    color: rgba(0, 0, 0, 0.5);
    margin-top: 12px;
  }
`;

// Responsive masonry grid for cards
export const MinimalMasonryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 60px 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;
```

### Component Spacing Guidelines:

```typescript
// packages/ui/src/layout/spacing.ts

export const SpacingRules = {
  // Text spacing
  text: {
    paragraphGap: '24px',
    lineHeight: '1.6',
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.05em', // For uppercase micro text
    }
  },
  
  // Component spacing
  components: {
    betweenCards: '60px',
    betweenSections: '120px',
    insideCard: '24px',
    aroundButtons: '16px',
    formFields: '32px',
  },
  
  // Interactive element spacing
  interactive: {
    touchTarget: '44px', // Minimum touch target
    clickPadding: '12px',
    hoverExpansion: '8px', // Extra hover area
  }
};

// Spacing utility classes
export const spacingUtilities = `
  .mt-0 { margin-top: 0; }
  .mt-1 { margin-top: 8px; }
  .mt-2 { margin-top: 16px; }
  .mt-3 { margin-top: 24px; }
  .mt-4 { margin-top: 40px; }
  .mt-5 { margin-top: 64px; }
  .mt-6 { margin-top: 96px; }
  
  .mb-0 { margin-bottom: 0; }
  .mb-1 { margin-bottom: 8px; }
  .mb-2 { margin-bottom: 16px; }
  .mb-3 { margin-bottom: 24px; }
  .mb-4 { margin-bottom: 40px; }
  .mb-5 { margin-bottom: 64px; }
  .mb-6 { margin-bottom: 96px; }
  
  .p-0 { padding: 0; }
  .p-1 { padding: 8px; }
  .p-2 { padding: 16px; }
  .p-3 { padding: 24px; }
  .p-4 { padding: 40px; }
  .p-5 { padding: 64px; }
  
  /* Responsive spacing */
  @media (max-width: 768px) {
    .mt-md-3 { margin-top: 24px; }
    .mb-md-3 { margin-bottom: 24px; }
    .p-md-2 { padding: 16px; }
  }
`;
```

### Dark Mode Implementation:

```typescript
// packages/ui/src/theme/darkMode.ts

export const DarkModeTheme = {
  // Pure black for OLED displays
  colors: {
    background: '#000000',
    surface: '#000000',
    elevated: '#0A0A0A', // Slightly elevated surfaces
    
    // Inverted text hierarchy
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    
    // Minimal borders
    border: 'rgba(255, 255, 255, 0.08)',
    divider: 'rgba(255, 255, 255, 0.05)',
    
    // Interaction states
    hover: 'rgba(255, 255, 255, 0.02)',
    pressed: 'rgba(255, 255, 255, 0.04)',
    selected: 'rgba(255, 255, 255, 0.06)',
  },
  
  // Inverted focus states
  focus: {
    outline: 'rgba(255, 255, 255, 0.2)',
    offset: '2px',
  }
};

// System preference detection
export const useMinimalTheme = () => {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    // Detect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return theme === 'dark' ? DarkModeTheme : LightModeTheme;
};

// CSS variables for theme switching
export const themeCSS = `
  :root {
    --background: #FFFFFF;
    --text-primary: #000000;
    --text-secondary: rgba(0, 0, 0, 0.6);
    --text-tertiary: rgba(0, 0, 0, 0.4);
    --border: rgba(0, 0, 0, 0.05);
    --hover: rgba(0, 0, 0, 0.02);
  }
  
  @media (prefers-color-scheme: dark) {
    :root {
      --background: #000000;
      --text-primary: #FFFFFF;
      --text-secondary: rgba(255, 255, 255, 0.7);
      --text-tertiary: rgba(255, 255, 255, 0.5);
      --border: rgba(255, 255, 255, 0.08);
      --hover: rgba(255, 255, 255, 0.02);
    }
  }
  
  body {
    background: var(--background);
    color: var(--text-primary);
    transition: none; /* No transition on theme change */
  }
`;
```

### Minimalist UX Patterns:

```typescript
// packages/ui/src/patterns/minimal-ux.ts

export const MinimalUXPatterns = {
  // Entry points - clean and focused
  entryPoints: {
    homepage: 'Single input field, nothing else',
    dashboard: 'Content grid immediately, no welcome messages',
    search: 'Search bar at top, results below, no filters visible',
    capture: 'Single action, no options initially',
  },
  
  // Progressive disclosure
  disclosure: {
    rule: 'Show only essential information first',
    advanced: 'Hide behind subtle "..." or arrow',
    settings: 'Minimal visible options, rest in advanced',
    metadata: 'Show on hover or tap, not by default',
  },
  
  // Error handling - subtle and inline
  errors: {
    display: 'Inline text, no modals or toasts',
    color: 'Same as primary text, just different weight',
    recovery: 'Single action to fix, clearly stated',
    prevention: 'Disable invalid actions silently',
  },
  
  // Empty states - poetic and minimal
  emptyStates: {
    newUser: 'Start by adding your first memory',
    noResults: 'Nothing found',
    error: 'Something went wrong. Try again.',
    loading: '...', // Just three dots
  },
  
  // Confirmation patterns
  confirmations: {
    delete: 'Inline confirmation, no modal',
    save: 'No confirmation, assume success',
    destructive: 'Two-step inline process',
  }
};

// Minimalist copy writing
export const MinimalCopywriting = {
  principles: [
    'Use fewer words',
    'No exclamation marks',
    'No emoji',
    'Lowercase when possible',
    'Technical precision over friendliness',
  ],
  
  examples: {
    welcome: 'start here',
    error: 'try again',
    success: 'saved',
    loading: '...',
    empty: 'nothing here',
    notFound: 'not found',
    offline: 'offline',
  }
};

// Minimalist form design
export const MinimalForms = `
  input, textarea {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border);
    padding: 8px 0;
    font-size: 15px;
    width: 100%;
    transition: border-color 150ms ease;
  }
  
  input:focus, textarea:focus {
    outline: none;
    border-bottom-color: var(--text-primary);
  }
  
  label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    display: block;
    margin-bottom: 8px;
  }
  
  button[type="submit"] {
    background: var(--text-primary);
    color: var(--background);
    border: none;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: opacity 150ms ease;
    margin-top: 32px;
  }
  
  button[type="submit"]:hover {
    opacity: 0.7;
  }
  
  /* No placeholders - use labels instead */
  ::placeholder {
    color: transparent;
  }
`;

// Minimalist modal/dialog design
export const MinimalModal = {
  overlay: {
    background: 'rgba(255, 255, 255, 0.9)', // Light overlay
    backdropFilter: 'blur(10px)',
    '@media (prefers-color-scheme: dark)': {
      background: 'rgba(0, 0, 0, 0.9)',
    }
  },
  
  content: {
    background: 'var(--background)',
    border: 'none',
    borderRadius: 0,
    padding: '80px',
    maxWidth: '600px',
    margin: '10vh auto',
    boxShadow: 'none',
    
    '@media (max-width: 768px)': {
      padding: '40px',
      margin: '5vh 20px',
    }
  },
  
  header: {
    fontSize: '21px',
    fontWeight: '400',
    marginBottom: '40px',
    letterSpacing: '-0.02em',
  },
  
  close: {
    position: 'absolute',
    top: '40px',
    right: '40px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    fontWeight: '300',
    cursor: 'pointer',
    opacity: 0.5,
    transition: 'opacity 150ms ease',
    
    '&:hover': {
      opacity: 1,
    }
  }
};
```

### Navigation Design - Ultra Minimal:

```typescript
// packages/ui/src/components/Navigation.tsx

export const MinimalNavigation = {
  // Desktop - Horizontal text-only nav
  desktop: {
    container: {
      padding: '32px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      marginBottom: '64px',
    },
    items: {
      display: 'flex',
      gap: '40px',
      fontSize: '14px',
      fontWeight: '400',
      textTransform: 'lowercase', // Subtle sophistication
      letterSpacing: '0.02em',
    },
    active: {
      opacity: 1,
      fontWeight: '500',
    },
    inactive: {
      opacity: 0.5,
    }
  },
  
  // Mobile - Bottom tab bar with text only
  mobile: {
    container: {
      position: 'fixed',
      bottom: 0,
      background: '#FFF',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      padding: '16px 0',
    },
    items: {
      display: 'flex',
      justifyContent: 'space-around',
    },
    tab: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      opacity: 0.5,
    },
    activeTab: {
      opacity: 1,
      fontWeight: '500',
    }
  }
};
```

---

## PROMPT 5: Content Capture and Processing System

Build a comprehensive content capture system that handles multiple input types and processes them with AI:

### Content Capture Methods:

1. **Browser Extension** (Chrome/Firefox/Safari/Edge):
```typescript
// Extension manifest v3
{
  "manifest_version": 3,
  "name": "Floe clipper",
  "permissions": ["activeTab", "storage", "contextMenus"],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}

// Implement capture functionality:
// - Right-click to save image/text
// - Toolbar button for full page
// - Highlight text to save quote
// - Auto-detect recipe/article structure
```

2. **Mobile Share Sheet Integration**:
```typescript
// apps/mobile/src/services/shareHandler.ts
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';

class ShareHandler {
  async handleIncomingShare(data: any) {
    const { type, content } = data;
    
    switch(type) {
      case 'text/plain':
        return this.processText(content);
      case 'image/*':
        return this.processImage(content);
      case 'application/pdf':
        return this.processPDF(content);
      case 'text/html':
        return this.processWebpage(content);
    }
  }
}
```

3. **Quick Capture Widget**:
   - iOS: Widget Extension
   - Android: App Widget
   - Web: PWA shortcut

### AI Processing Pipeline:

```typescript
// packages/shared/src/services/contentProcessor.ts
class ContentProcessor {
  constructor(
    private supabase: SupabaseClient,
    private openai: OpenAI
  ) {}
  
  async processCard(card: Card): Promise<ProcessedCard> {
    const pipeline = [
      this.extractContent,
      this.generateEmbedding,
      this.extractEntities,
      this.generateTags,
      this.analyzeSentiment,
      this.categorize,
      this.generateSummary
    ];
    
    let processedData = { ...card };
    
    for (const step of pipeline) {
      processedData = await step.call(this, processedData);
    }
    
    return processedData;
  }
  
  private async extractContent(card: Card) {
    switch(card.type) {
      case 'image':
        return this.processImage(card);
      case 'article':
        return this.processArticle(card);
      case 'pdf':
        return this.processPDF(card);
      default:
        return card;
    }
  }
  
  private async processImage(card: Card) {
    // Use OCR for text extraction
    const ocrText = await this.performOCR(card.mediaUrl);
    
    // Use vision AI for object detection
    const objects = await this.detectObjects(card.mediaUrl);
    
    // Extract colors
    const colors = await this.extractColors(card.mediaUrl);
    
    return {
      ...card,
      content: ocrText,
      ai_tags: objects,
      ai_colors: colors
    };
  }
  
  private async generateEmbedding(card: Card) {
    const text = `${card.title || ''} ${card.content || ''} ${card.ai_tags?.join(' ') || ''}`;
    
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 1536
    });
    
    return {
      ...card,
      embedding: response.data[0].embedding
    };
  }
}
```

### Content-Specific Handlers:

1. **Image Handler**:
   - Generate multiple size variants
   - Extract EXIF data
   - Perform OCR
   - Detect faces/objects
   - Extract color palette

2. **Article Handler**:
   - Extract clean text (Readability)
   - Identify author/publication date
   - Generate summary
   - Extract key quotes
   - Estimate reading time

3. **PDF Handler**:
   - Text extraction
   - Page thumbnails
   - Highlight/annotation support
   - Table detection

4. **Video Handler**:
   - Thumbnail extraction
   - Duration detection
   - Transcript extraction (if available)
   - Platform-specific metadata

---

## PROMPT 6: Search and Discovery System

Implement a powerful search system with multiple search strategies:

### Search Types:

1. **Full-Text Search** using Supabase/PostgreSQL:
```typescript
// packages/shared/src/services/search.ts
class SearchService {
  async textSearch(query: string, filters?: SearchFilters) {
    const { data, error } = await supabase
      .rpc('search_cards', {
        search_query: query,
        user_uuid: userId,
        limit_count: 50
      });
    
    return this.rankResults(data);
  }
}
```

2. **Semantic Search** using embeddings:
```typescript
async semanticSearch(query: string) {
  // Generate query embedding
  const queryEmbedding = await this.generateEmbedding(query);
  
  // Search using pgvector
  const { data } = await supabase
    .rpc('match_cards', {
      query_embedding: queryEmbedding,
      match_threshold: 0.78,
      match_count: 50
    });
    
  return data;
}
```

3. **Visual Search** for images:
```typescript
async visualSearch(imageUrl: string) {
  // Extract visual features
  const features = await this.extractVisualFeatures(imageUrl);
  
  // Find similar images
  const similar = await supabase
    .from('cards')
    .select('*')
    .eq('type', 'image')
    .overlaps('ai_colors', features.colors)
    .overlaps('ai_tags', features.objects);
    
  return similar;
}
```

### Search UI Components:

1. **SearchInterface**:
```typescript
interface SearchInterfaceProps {
  onSearch: (query: string, filters: Filters) => void;
  suggestions: string[];
  recentSearches: string[];
}

// Features:
// - Natural language input ("images from last week")
// - Auto-complete with AI suggestions
// - Filter builder UI
// - Search history
// - Saved searches
```

2. **FilterPanel**:
   - Date range picker
   - Content type selector
   - Tag filter
   - Color filter (for images)
   - Smart Space filter
   - Sentiment filter

3. **SearchResults**:
   - Grouped by relevance/date/type
   - Infinite scroll
   - Result highlighting
   - Quick actions (pin, open, share)

### Discovery Features:

1. **Serendipity Mode**:
```typescript
class SerendipityService {
  async getRandomMemories(count: number = 10) {
    // Get random cards from different time periods
    const periods = this.getRandomPeriods();
    const memories = [];
    
    for (const period of periods) {
      const cards = await this.getCardsFromPeriod(period);
      memories.push(...this.selectRandom(cards, 2));
    }
    
    return memories;
  }
  
  async getDailyHighlight() {
    // Surface interesting old content
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return await supabase
      .from('cards')
      .select('*')
      .gte('created_at', oneYearAgo.toISOString())
      .lte('created_at', new Date(oneYearAgo.getTime() + 86400000).toISOString())
      .limit(1)
      .single();
  }
}
```

2. **Related Content**:
   - Find similar cards using embeddings
   - Suggest related tags
   - Show cards from same source
   - Time-based associations

---

## PROMPT 7: Smart Spaces and Organization System

Build an intelligent auto-organization system using Smart Spaces:

### Smart Space Engine:

```typescript
// packages/shared/src/services/smartSpaces.ts
interface SmartSpaceRule {
  field: 'type' | 'tag' | 'color' | 'source' | 'date' | 'sentiment';
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

interface SmartSpace {
  id: string;
  name: string;
  icon: string;
  color: string;
  rules: {
    conditions: SmartSpaceRule[];
    logic: 'AND' | 'OR';
  };
}

class SmartSpaceEngine {
  async evaluateCard(card: Card, space: SmartSpace): boolean {
    const { conditions, logic } = space.rules;
    
    const results = conditions.map(condition => 
      this.evaluateCondition(card, condition)
    );
    
    return logic === 'AND' 
      ? results.every(r => r === true)
      : results.some(r => r === true);
  }
  
  async updateSpaceMembership(card: Card) {
    const spaces = await this.getAllUserSpaces();
    const memberships = [];
    
    for (const space of spaces) {
      if (await this.evaluateCard(card, space)) {
        memberships.push(space.id);
      }
    }
    
    await supabase
      .from('cards')
      .update({ smart_space_ids: memberships })
      .eq('id', card.id);
  }
  
  async suggestSpaces(userId: string): Promise<SmartSpaceSuggestion[]> {
    // Analyze user's content patterns
    const patterns = await this.analyzeUserPatterns(userId);
    
    // Generate space suggestions
    return patterns.map(pattern => ({
      name: pattern.name,
      icon: this.selectIcon(pattern.dominantType),
      rules: this.generateRules(pattern),
      estimatedCards: pattern.matchCount
    }));
  }
}
```

### Default Smart Spaces:

```typescript
const DEFAULT_SPACES = [
  {
    name: 'Recent',
    icon: 'clock', // Use geometric clock icon or just text
    rules: {
      conditions: [
        { field: 'date', operator: 'greater', value: 'now-7d' }
      ],
      logic: 'AND'
    }
  },
  {
    name: 'Images',
    icon: 'image', // Simple geometric square icon
    rules: {
      conditions: [
        { field: 'type', operator: 'equals', value: 'image' },
      ],
      logic: 'AND'
    }
  },
  {
    name: 'Reading',
    icon: 'text', // Simple line icon representing text
    rules: {
      conditions: [
        { field: 'type', operator: 'equals', value: 'article' },
        { field: 'tag', operator: 'contains', value: 'read-later' }
      ],
      logic: 'OR'
    }
  },
  {
    name: 'Archive',
    icon: 'archive', // Simple box icon
    rules: {
      conditions: [
        { field: 'is_archived', operator: 'equals', value: true }
      ],
      logic: 'AND'
    }
  }
];

// Minimalist Smart Space Card Design
export const SmartSpaceCardStyles = {
  container: {
    padding: theme.spacing.lg,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
    marginBottom: theme.spacing.md,
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing.xl,
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    paddingBottom: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: theme.typography.letterSpacing.tight,
    color: theme.colors.light.text.primary,
  },
  count: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.light.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  // No preview images - just clean text
  hover: {
    opacity: 0.7,
  }
};

// Minimal icon set using pure CSS/SVG
export const MinimalIcons = {
  // Use only geometric shapes - no decorative elements
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
    <rect x="3" y="7" width="18" height="13"/>
  </svg>`,
  
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 6v6l4 2"/>
  </svg>`,
  
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
    <rect x="3" y="3" width="18" height="18"/>
    <circle cx="8" cy="8" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>`,
  
  text: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
    <line x1="3" y1="7" x2="21" y2="7"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="17" x2="15" y2="17"/>
  </svg>`,
  
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,
  
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
    <circle cx="10" cy="10" r="7"/>
    <path d="M21 21l-6-6"/>
  </svg>`,
  
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
    <line x1="6" y1="6" x2="18" y2="18"/>
    <line x1="6" y1="18" x2="18" y2="6"/>
  </svg>`,
};
```

### Manual Organization Features:

1. **Drag & Drop Interface**:
   - Move cards between spaces
   - Reorder pinned items
   - Bulk selection and operations

2. **Quick Actions**:
   - Pin/Unpin (Top of Mind)
   - Archive
   - Add to specific space
   - Share
   - Delete

3. **Bulk Operations**:
```typescript
class BulkOperations {
  async execute(cardIds: string[], operation: BulkOperation) {
    const updates = {};
    
    switch(operation.type) {
      case 'addTag':
        updates.manual_tags = supabase.sql`array_append(manual_tags, ${operation.value})`;
        break;
      case 'moveToSpace':
        updates.smart_space_ids = supabase.sql`array_append(smart_space_ids, ${operation.value})`;
        break;
      case 'archive':
        updates.is_archived = true;
        break;
    }
    
    await supabase
      .from('cards')
      .update(updates)
      .in('id', cardIds);
  }
}
```

---

## PROMPT 8: Real-time Sync and Offline Support

Implement real-time synchronization and offline capabilities:

### Real-time Sync with Supabase:

```typescript
// packages/shared/src/services/realtimeSync.ts
class RealtimeSync {
  private channels: Map<string, RealtimeChannel> = new Map();
  
  subscribeToUserChanges(userId: string, handlers: {
    onCardInsert?: (card: Card) => void;
    onCardUpdate?: (card: Card) => void;
    onCardDelete?: (id: string) => void;
    onSpaceUpdate?: (space: SmartSpace) => void;
  }) {
    const channel = supabase
      .channel(`user-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'cards',
          filter: `user_id=eq.${userId}`
        },
        (payload) => handlers.onCardInsert?.(payload.new as Card)
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'cards',
          filter: `user_id=eq.${userId}`
        },
        (payload) => handlers.onCardUpdate?.(payload.new as Card)
      )
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'cards',
          filter: `user_id=eq.${userId}`
        },
        (payload) => handlers.onCardDelete?.(payload.old.id)
      )
      .subscribe();
    
    this.channels.set(userId, channel);
  }
  
  async handleConflicts(local: Card, remote: Card): Promise<Card> {
    // Implement conflict resolution strategy
    // Last-write-wins with field-level merging
    
    const merged = { ...local };
    
    // Preserve local changes for user-edited fields
    if (local.updated_at > remote.updated_at) {
      merged.title = local.title;
      merged.content = local.content;
      merged.manual_tags = local.manual_tags;
    }
    
    // Always use latest AI-processed data
    if (remote.ai_processed_at > local.ai_processed_at) {
      merged.ai_tags = remote.ai_tags;
      merged.ai_summary = remote.ai_summary;
      merged.embedding = remote.embedding;
    }
    
    return merged;
  }
}
```

### Offline Support:

```typescript
// packages/shared/src/services/offlineManager.ts
class OfflineManager {
  private queue: OfflineQueue;
  private storage: AsyncStorage | LocalStorage;
  
  async cacheForOffline(cards: Card[]) {
    // Store cards in local storage
    await this.storage.setItem('offline_cards', JSON.stringify(cards));
    
    // Cache images for offline viewing
    for (const card of cards) {
      if (card.type === 'image' && card.thumbnailUrl) {
        await this.cacheImage(card.thumbnailUrl);
      }
    }
  }
  
  async queueOperation(operation: OfflineOperation) {
    await this.queue.add(operation);
    
    // Try to sync if online
    if (await this.isOnline()) {
      await this.syncQueue();
    }
  }
  
  async syncQueue() {
    const operations = await this.queue.getAll();
    
    for (const op of operations) {
      try {
        await this.executeOperation(op);
        await this.queue.remove(op.id);
      } catch (error) {
        console.error('Sync failed for operation:', op.id);
      }
    }
  }
  
  private async executeOperation(op: OfflineOperation) {
    switch(op.type) {
      case 'CREATE_CARD':
        return await supabase.from('cards').insert(op.data);
      case 'UPDATE_CARD':
        return await supabase.from('cards').update(op.data).eq('id', op.id);
      case 'DELETE_CARD':
        return await supabase.from('cards').delete().eq('id', op.id);
    }
  }
}
```

### Platform-specific offline implementation:

#### Mobile (Expo):
```typescript
// apps/mobile/src/services/offlineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';

class MobileOfflineStorage {
  async cacheImage(url: string): Promise<string> {
    const filename = this.getFilenameFromUrl(url);
    const fileUri = `${FileSystem.documentDirectory}cache/${filename}`;
    
    const downloadResult = await FileSystem.downloadAsync(url, fileUri);
    return downloadResult.uri;
  }
  
  async setupOfflineSync() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.syncOfflineChanges();
      }
    });
  }
}
```

#### Web (Next.js):
```typescript
// apps/web/src/services/serviceWorker.ts
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('floe-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
        '/icons/icon-192x192.png',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/offline');
      });
    })
  );
});
```

---

## PROMPT 9: Media Processing and Storage

Implement comprehensive media handling with Supabase Storage:

### Image Processing Pipeline:

```typescript
// packages/shared/src/services/mediaProcessor.ts
class MediaProcessor {
  async processImage(file: File | Blob, userId: string): Promise<ProcessedImage> {
    // Validate file
    if (!this.isValidImage(file)) {
      throw new Error('Invalid image format');
    }
    
    // Generate variants
    const variants = await this.createImageVariants(file);
    
    // Upload to Supabase Storage
    const uploads = await Promise.all([
      this.uploadVariant(variants.original, userId, 'original'),
      this.uploadVariant(variants.thumbnail, userId, 'thumbnail'),
      this.uploadVariant(variants.medium, userId, 'medium')
    ]);
    
    // Extract metadata
    const metadata = await this.extractImageMetadata(file);
    
    // Perform AI analysis
    const aiAnalysis = await this.analyzeImage(uploads[0].url);
    
    return {
      originalUrl: uploads[0].url,
      thumbnailUrl: uploads[1].url,
      mediumUrl: uploads[2].url,
      metadata,
      ...aiAnalysis
    };
  }
  
  private async createImageVariants(file: File): Promise<ImageVariants> {
    // For web: use Canvas API
    // For mobile: use expo-image-manipulator
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Create thumbnail (200x200)
        const thumbnail = this.resizeImage(img, 200, 200);
        
        // Create medium (800px width)
        const medium = this.resizeImage(img, 800);
        
        resolve({
          original: file,
          thumbnail,
          medium
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  private async uploadVariant(
    file: File | Blob,
    userId: string,
    variant: string
  ): Promise<{ url: string }> {
    const filename = `${userId}/${Date.now()}-${variant}.webp`;
    
    const { data, error } = await supabase.storage
      .from('cards-media')
      .upload(filename, file, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('cards-media')
      .getPublicUrl(filename);
    
    return { url: publicUrl };
  }
}
```

### OCR Implementation:

```typescript
// packages/shared/src/services/ocr.ts
class OCRService {
  async extractText(imageUrl: string): Promise<OCRResult> {
    // Option 1: Use Tesseract.js for client-side OCR
    const worker = await Tesseract.createWorker('eng');
    const { data } = await worker.recognize(imageUrl);
    await worker.terminate();
    
    return {
      text: data.text,
      confidence: data.confidence,
      blocks: data.blocks.map(block => ({
        text: block.text,
        bbox: block.bbox,
        confidence: block.confidence
      }))
    };
    
    // Option 2: Use cloud service (Google Vision, AWS Textract)
    // Implement based on preference
  }
  
  async extractFromPDF(pdfFile: File): Promise<string> {
    // Use pdf.js for text extraction
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(pdfFile)).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  }
}
```

### Video/Audio Handling:

```typescript
class MediaHandler {
  async processVideo(videoUrl: string): Promise<ProcessedVideo> {
    // Extract thumbnail
    const thumbnail = await this.extractVideoThumbnail(videoUrl);
    
    // Get metadata
    const metadata = await this.getVideoMetadata(videoUrl);
    
    // Store reference (not the video itself)
    return {
      url: videoUrl,
      thumbnail,
      duration: metadata.duration,
      platform: this.detectPlatform(videoUrl),
      title: metadata.title
    };
  }
  
  private detectPlatform(url: string): string {
    const patterns = {
      youtube: /(?:youtube\.com|youtu\.be)/,
      vimeo: /vimeo\.com/,
      twitter: /twitter\.com/,
      instagram: /instagram\.com/
    };
    
    for (const [platform, pattern] of Object.entries(patterns)) {
      if (pattern.test(url)) return platform;
    }
    
    return 'unknown';
  }
}
```

---

## PROMPT 10: AI Integration and Processing

Implement comprehensive AI features using OpenAI and other services:

### AI Service Configuration:

```typescript
// packages/shared/src/services/ai/config.ts
export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    models: {
      embedding: 'text-embedding-3-small',
      completion: 'gpt-4-turbo-preview',
      vision: 'gpt-4-vision-preview'
    }
  },
  limits: {
    maxTokens: 1000,
    temperature: 0.7,
    embeddingDimensions: 1536
  }
};
```

### Core AI Processing:

```typescript
// packages/shared/src/services/ai/processor.ts
class AIProcessor {
  private openai: OpenAI;
  private cache: Map<string, any> = new Map();
  
  async processContent(content: string, type: CardType): Promise<AIAnalysis> {
    // Check cache first
    const cacheKey = this.getCacheKey(content);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Run parallel AI tasks
    const [tags, summary, entities, sentiment, category] = await Promise.all([
      this.generateTags(content, type),
      this.generateSummary(content),
      this.extractEntities(content),
      this.analyzeSentiment(content),
      this.categorizeContent(content, type)
    ]);
    
    const result = {
      tags,
      summary,
      entities,
      sentiment,
      category,
      processedAt: new Date()
    };
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  private async generateTags(content: string, type: CardType): Promise<string[]> {
    const prompt = `
      Analyze this ${type} content and generate 5-10 relevant tags.
      Content: ${content.substring(0, 1000)}
      
      Return tags as a JSON array of strings.
    `;
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });
    
    const response = JSON.parse(completion.choices[0].message.content);
    return response.tags;
  }
  
  private async extractEntities(content: string): Promise<Entity[]> {
    const prompt = `
      Extract named entities from this text:
      ${content.substring(0, 2000)}
      
      Categories: PERSON, ORGANIZATION, LOCATION, DATE, PRODUCT, EVENT
      
      Return as JSON: { entities: [{ text: string, type: string }] }
    `;
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    const response = JSON.parse(completion.choices[0].message.content);
    return response.entities;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // Token limit
      dimensions: 1536
    });
    
    return response.data[0].embedding;
  }
  
  async analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Analyze this image and provide: objects detected, scene description, dominant colors, and suggested tags. Return as JSON.'
            },
            { 
              type: 'image_url', 
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 500
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
}
```

### Smart Suggestions:

```typescript
class SmartSuggestions {
  async getSuggestions(userId: string, context: SuggestionContext) {
    // Analyze user's recent activity
    const recentCards = await this.getRecentCards(userId, 20);
    const patterns = this.analyzePatterns(recentCards);
    
    // Generate suggestions based on context
    switch(context.type) {
      case 'search':
        return this.getSearchSuggestions(context.query, patterns);
      case 'tags':
        return this.getTagSuggestions(context.card, patterns);
      case 'related':
        return this.getRelatedContent(context.card, userId);
    }
  }
  
  private async getRelatedContent(card: Card, userId: string) {
    // Use embedding similarity
    const similar = await supabase.rpc('match_cards', {
      query_embedding: card.embedding,
      match_threshold: 0.75,
      match_count: 10,
      user_uuid: userId
    });
    
    return similar.filter(c => c.id !== card.id);
  }
}
```

---

## PROMPT 11: Performance Optimization and Monitoring

Implement performance optimizations and monitoring:

### Performance Optimizations:

```typescript
// packages/shared/src/utils/performance.ts

// 1. Image lazy loading with Intersection Observer
class LazyImageLoader {
  private observer: IntersectionObserver;
  
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target as HTMLImageElement);
          }
        });
      },
      { rootMargin: '50px' }
    );
  }
  
  observe(img: HTMLImageElement) {
    this.observer.observe(img);
  }
  
  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      this.observer.unobserve(img);
    }
  }
}

// 2. Virtual scrolling for large lists
class VirtualScroller {
  private itemHeight: number;
  private containerHeight: number;
  private items: any[];
  
  getVisibleItems(scrollTop: number): VisibleItems {
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.ceil(
      (scrollTop + this.containerHeight) / this.itemHeight
    );
    
    return {
      items: this.items.slice(startIndex, endIndex),
      offsetY: startIndex * this.itemHeight
    };
  }
}

// 3. Request debouncing and throttling
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 4. Optimistic updates
class OptimisticUpdater {
  async updateCard(cardId: string, updates: Partial<Card>) {
    // Update UI immediately
    this.updateLocalState(cardId, updates);
    
    try {
      // Sync with server
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', cardId)
        .single();
      
      if (error) throw error;
      
      // Update with server response
      this.updateLocalState(cardId, data);
    } catch (error) {
      // Revert on failure
      this.revertLocalState(cardId);
      throw error;
    }
  }
}
```

### Caching Strategy:

```typescript
// packages/shared/src/services/cache.ts
class CacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private persistentCache: IDBDatabase | null = null;
  
  async initialize() {
    // Setup IndexedDB for persistent caching
    this.persistentCache = await this.openDatabase();
  }
  
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data as T;
    }
    
    // Check persistent cache
    if (this.persistentCache) {
      const persistEntry = await this.getFromIndexedDB(key);
      if (persistEntry && !this.isExpired(persistEntry)) {
        // Promote to memory cache
        this.memoryCache.set(key, persistEntry);
        return persistEntry.data as T;
      }
    }
    
    return null;
  }
  
  async set<T>(key: string, data: T, ttl: number = 300000) {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    // Store in memory
    this.memoryCache.set(key, entry);
    
    // Store in IndexedDB
    if (this.persistentCache) {
      await this.saveToIndexedDB(key, entry);
    }
  }
  
  // Implement cache invalidation strategies
  async invalidatePattern(pattern: string) {
    // Clear matching keys from both caches
    const keysToDelete = Array.from(this.memoryCache.keys())
      .filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => this.memoryCache.delete(key));
    
    if (this.persistentCache) {
      await this.deleteFromIndexedDB(keysToDelete);
    }
  }
}
```

### Analytics and Monitoring:

```typescript
// packages/shared/src/services/analytics.ts
class Analytics {
  // Performance monitoring
  trackPerformance(metric: string, value: number) {
    if ('performance' in window && 'measure' in window.performance) {
      performance.mark(`${metric}-start`);
      
      setTimeout(() => {
        performance.mark(`${metric}-end`);
        performance.measure(metric, `${metric}-start`, `${metric}-end`);
        
        const measure = performance.getEntriesByName(metric)[0];
        this.sendMetric({
          name: metric,
          value: measure.duration,
          timestamp: Date.now()
        });
      }, 0);
    }
  }
  
  // Error tracking
  trackError(error: Error, context?: any) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };
    
    // Send to logging service
    this.sendError(errorData);
  }
  
  // User behavior analytics
  trackEvent(event: string, properties?: any) {
    const eventData = {
      event,
      properties,
      userId: this.getUserId(),
      timestamp: Date.now()
    };
    
    // Queue for batch sending
    this.eventQueue.push(eventData);
    
    if (this.eventQueue.length >= 10) {
      this.flushEvents();
    }
  }
  
  private async sendMetric(metric: any) {
    // Send to Vercel Analytics or custom endpoint
    await fetch('/api/analytics/performance', {
      method: 'POST',
      body: JSON.stringify(metric)
    });
  }
}
```

---

## PROMPT 12: Minimalist UI Polish and Subtle Animations

Create refined, barely-noticeable animations and interactions that enhance the minimalist aesthetic:

### Animation Philosophy:
- **Invisible Motion**: Animations should be felt, not seen
- **Purpose-Driven**: Every animation must improve usability
- **Consistency**: All animations follow the same timing and easing
- **Restraint**: When in doubt, use less animation

### Animation System:

```typescript
// packages/ui/src/animations/minimal.ts
import { Animated, Easing } from 'react-native';

// Minimalist animation constants
export const ANIMATION_CONFIG = {
  duration: {
    instant: 0,
    subtle: 100,
    standard: 150,
    slow: 200, // Maximum duration
  },
  easing: {
    standard: Easing.out(Easing.quad), // Subtle deceleration
    enter: Easing.out(Easing.quad),
    exit: Easing.in(Easing.quad),
  },
  opacity: {
    hover: 0.7,
    pressed: 0.5,
    disabled: 0.3,
  }
};

// Web animations - CSS only
export const minimalAnimations = `
  * {
    transition-property: opacity, transform;
    transition-duration: 150ms;
    transition-timing-function: ease-out;
  }
  
  /* No color transitions ever */
  .no-transition {
    transition: none;
  }
  
  /* Subtle fade only */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  /* Minimal slide for modals/sheets */
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(8px); /* Very subtle */
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Mobile animations - React Native
export class MinimalMobileAnimations {
  static fadeIn(value: Animated.Value) {
    return Animated.timing(value, {
      toValue: 1,
      duration: ANIMATION_CONFIG.duration.standard,
      easing: ANIMATION_CONFIG.easing.standard,
      useNativeDriver: true
    });
  }
  
  static fadeOut(value: Animated.Value) {
    return Animated.timing(value, {
      toValue: 0,
      duration: ANIMATION_CONFIG.duration.subtle,
      easing: ANIMATION_CONFIG.easing.exit,
      useNativeDriver: true
    });
  }
  
  // No spring animations - too playful for minimalist design
  // No complex transforms - only opacity and subtle translations
}
```

### Minimalist Interactive Components:

```typescript
// packages/ui/src/components/MinimalCard.tsx
import { Pressable, View } from 'react-native';
import { useState } from 'react';

export const MinimalCard = ({ children, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={{
        opacity: isPressed ? 0.5 : 1,
        // No scale transforms - too playful
        // No shadows - breaks minimalism
        // No border changes - too busy
      }}
    >
      <View style={{
        padding: 0, // No padding on container
        margin: 0,
        backgroundColor: 'transparent',
      }}>
        {children}
      </View>
    </Pressable>
  );
};

// Minimal button with text only
export const MinimalButton = ({ label, onPress, variant = 'primary' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const styles = {
    primary: {
      color: '#000',
      fontWeight: '500',
    },
    secondary: {
      color: '#666',
      fontWeight: '400',
    },
    ghost: {
      color: '#999',
      fontWeight: '400',
    }
  };
  
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={{
        opacity: isHovered ? 0.7 : 1,
        padding: '12px 0', // Vertical padding only
      }}
    >
      <Text style={styles[variant]}>{label}</Text>
    </Pressable>
  );
};
```

### Gesture Handlers - Minimal Feedback:

```typescript
// packages/ui/src/gestures/MinimalSwipe.tsx
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

export const MinimalSwipeableCard = ({ children, onDismiss }) => {
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      // Only horizontal swipes
      translateX.value = event.translationX;
      // Fade out as user swipes
      opacity.value = 1 - Math.abs(event.translationX) / 300;
    },
    onEnd: (event) => {
      const threshold = 150; // Higher threshold for accidental swipes
      
      if (Math.abs(event.translationX) > threshold) {
        // Complete the dismissal
        opacity.value = withTiming(0, { duration: 100 });
        translateX.value = withTiming(
          event.translationX > 0 ? 500 : -500,
          { duration: 100 },
          () => runOnJS(onDismiss)()
        );
      } else {
        // Return to origin
        opacity.value = withTiming(1, { duration: 150 });
        translateX.value = withTiming(0, { duration: 150 });
      }
    }
  });
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }]
  }));
  
  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};
```

### Loading States - Minimal Skeleton:

```typescript
// packages/ui/src/components/MinimalSkeleton.tsx
export const MinimalSkeleton = ({ width, height }) => {
  // No shimmering - too distracting
  // Simple gray rectangle that fades in
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: 'rgba(0,0,0,0.05)', // Barely visible
        animation: 'fadeIn 150ms ease-out',
      }}
    />
  );
};

// Content loading pattern
export const MinimalContentLoader = () => (
  <View style={{ padding: 40 }}>
    <MinimalSkeleton width="60%" height={20} />
    <View style={{ height: 16 }} />
    <MinimalSkeleton width="100%" height={1} />
    <View style={{ height: 32 }} />
    <MinimalSkeleton width="80%" height={16} />
    <View style={{ height: 8 }} />
    <MinimalSkeleton width="90%" height={16} />
  </View>
);
```

### Minimalist Feedback Components:

```typescript
// packages/ui/src/components/MinimalFeedback.tsx

// No toast notifications - too intrusive
// Use inline text feedback instead
export const MinimalFeedback = ({ message, type = 'info' }) => {
  const styles = {
    info: { color: 'rgba(0,0,0,0.6)', fontSize: 13 },
    success: { color: 'rgba(0,0,0,0.8)', fontSize: 13 },
    error: { color: '#000', fontSize: 13, fontWeight: '500' }
  };
  
  return (
    <Text style={styles[type]}>{message}</Text>
  );
};

// Loading indicator - just three dots
export const MinimalLoader = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 300);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Text style={{ 
      fontFamily: 'monospace',
      fontSize: 16,
      letterSpacing: 2,
      minWidth: 30
    }}>
      {dots}
    </Text>
  );
};

// Progress indicator - simple line
export const MinimalProgress = ({ progress }) => (
  <View style={{
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  }}>
    <View style={{
      height: 1,
      backgroundColor: '#000',
      width: `${progress * 100}%`,
      transition: 'width 150ms ease-out',
    }} />
  </View>
);
```

### Focus States - Minimal but Accessible:

```typescript
// packages/ui/src/accessibility/focus.ts
export const minimalFocusStyles = `
  /* Remove default focus outlines */
  *:focus {
    outline: none;
  }
  
  /* Keyboard navigation focus only */
  *:focus-visible {
    outline: 1px solid rgba(0,0,0,0.2);
    outline-offset: 2px;
  }
  
  /* Dark mode focus */
  @media (prefers-color-scheme: dark) {
    *:focus-visible {
      outline-color: rgba(255,255,255,0.2);
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    *:focus-visible {
      outline: 2px solid currentColor;
    }
  }
`;
```

---

## PROMPT 13: Testing, Security, and Deployment

Set up comprehensive testing, security measures, and deployment:

### Testing Setup:

```typescript
// packages/shared/src/__tests__/setup.ts
import '@testing-library/jest-native/extend-expect';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    })),
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn()
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn()
      }))
    }
  }))
}));

// Setup MSW
export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Test Examples:

```typescript
// Card creation test
describe('Card Creation', () => {
  it('should create a card with AI processing', async () => {
    const { result } = renderHook(() => useCards(), {
      wrapper: TestProviders
    });
    
    const cardData = {
      type: 'note',
      title: 'Test Note',
      content: 'Test content'
    };
    
    await act(async () => {
      await result.current.createCard(cardData);
    });
    
    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0]).toMatchObject({
      ...cardData,
      ai_tags: expect.any(Array),
      ai_processed: true
    });
  });
});

// Search functionality test
describe('Search', () => {
  it('should return relevant results', async () => {
    const { result } = renderHook(() => useSearch());
    
    await act(async () => {
      await result.current.search('design inspiration');
    });
    
    expect(result.current.results).toHaveLength(5);
    expect(result.current.results[0].relevance).toBeGreaterThan(0.7);
  });
});
```

### Security Implementation:

```typescript
// packages/shared/src/security/index.ts

// Input validation
export const validators = {
  email: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  url: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  sanitizeHtml: (html: string) => {
    // Use DOMPurify or similar
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    });
  }
};

// Rate limiting
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(identifier: string, limit: number, window: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts
    const validAttempts = attempts.filter(
      time => now - time < window
    );
    
    if (validAttempts.length >= limit) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
}

// Content Security Policy
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};
```

### Deployment Configuration:

#### Vercel Deployment (Web):
```json
// apps/web/vercel.json
{
  "functions": {
    "app/api/*": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

#### Expo EAS Build (Mobile):
```json
// apps/mobile/eas.json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-large"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "@supabase-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "@apple-id",
        "ascAppId": "@asc-app-id",
        "appleTeamId": "@apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

### Monitoring and Error Handling:

```typescript
// packages/shared/src/monitoring/sentry.ts
import * as Sentry from '@sentry/react-native';

export const initializeSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: Sentry.reactNavigationIntegration(),
        tracingOrigins: ['localhost', /^\//],
      }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // Filter sensitive information
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }
      return event;
    }
  });
};

// Error boundary component
export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

---

## Final Notes for Claude Code

This comprehensive technical requirements document provides everything needed to build the Floe application with an **ultra-minimalist design philosophy**. 

### Critical Design Implementation Priorities:

1. **Minimalism Above All**: Every design decision should favor simplicity and space over features
2. **No Colors**: Strictly black and white only - no accent colors, no gradients
3. **No Emojis**: Use text or geometric icons only throughout the entire interface
4. **Maximum Whitespace**: When in doubt, add more space between elements
5. **Typography-First**: Let font weights and sizes create the visual hierarchy

### Key Implementation Priorities:

1. **Start with the foundation**: Set up the monorepo, Supabase backend, and authentication first
2. **Build core features progressively**: Cards CRUD → Search → AI processing → Smart Spaces
3. **Optimize for performance**: Implement lazy loading, caching, and virtualization from the start
4. **Ensure cross-platform compatibility**: Test components on web, iOS, and Android regularly
5. **Maintain security**: Implement RLS policies, input validation, and rate limiting throughout

### Minimalist Development Guidelines:

- **Remove Before Adding**: Always try to remove elements before adding new ones
- **Question Every Pixel**: Each visual element must justify its existence
- **Invisible Interface**: The UI should fade away, letting content dominate
- **Subtle Interactions**: Animations should be felt, not seen (150ms max, opacity only)
- **Clean Code**: The minimalist philosophy extends to code - keep it simple and clean

Remember to:
- Use TypeScript strictly for type safety
- Implement error boundaries and proper error handling
- Add loading states with minimal visual impact (no spinners, just dots or lines)
- Test critical paths with unit and integration tests
- Monitor performance and errors in production

### Design Inspiration Checklist:
- ✓ Does it look like it could be in an art gallery?
- ✓ Would a Swiss designer approve?
- ✓ Is there more whitespace than content?
- ✓ Can you remove anything else?
- ✓ Does the interface disappear when using it?

The application should feel like a **calm, quiet space** - a digital sanctuary that respects the user's attention and mental space. It should be so minimal that users focus entirely on their content, not the interface. Think of it as **digital paper** - clean, simple, and purely functional.