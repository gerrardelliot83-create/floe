# 🚀 Complete Deployment Guide for Floe

## 📋 **PHASE 1: Third-Party Service Setup**

### 1. **Supabase Setup**

**Step 1.1: Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Choose your organization
5. Fill in:
   - **Project Name**: `floe-production`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for setup to complete (~2 minutes)

**Step 1.2: Get Supabase Credentials**
1. In your Supabase dashboard, go to **Settings → API**
2. Copy these values (you'll need them later):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key** (anon, public)
   - **Service Role Key** (secret, keep secure!)

**Step 1.3: Deploy Database Schema**
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste **ALL** content from `config/supabase/schema.sql`
4. Click "Run" (this will take ~30 seconds)
5. Repeat for `config/supabase/policies.sql`
6. Repeat for `config/supabase/storage.sql`
7. Repeat for `config/supabase/seed.sql`

**Step 1.4: Configure Authentication**
1. Go to **Authentication → Settings**
2. Under **Site URL**, add: `http://localhost:3000` (for development)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (replace with your domain later)
4. **Enable OAuth providers** you want:
   - **Google**: Follow Supabase docs to set up Google OAuth
   - **GitHub**: Follow Supabase docs to set up GitHub OAuth
5. Save changes

### 2. **Anthropic (Claude AI) Setup**

**Step 2.1: Get Claude API Key**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up/Sign in
3. Go to **API Keys**
4. Click "Create Key"
5. Name it "Floe Production"
6. Copy the API key (starts with `sk-ant-...`)
7. **Important**: This key is shown only once, save it securely!

### 3. **UploadThing Setup**

**Step 3.1: Create UploadThing Account**
1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign up/Sign in with GitHub
3. Create a new app: "Floe"
4. Go to **API Keys**
5. Copy your **UploadThing Token** (starts with `sk_live_` or `sk_test_`)

**Step 3.2: Configure File Uploads**
1. In UploadThing dashboard, your file router is already configured in the code
2. The app supports:
   - **Images**: Max 8MB, 5 files at once
   - **Documents**: Max 16MB PDFs, 10MB Word docs
   - **Audio**: Max 32MB, 3 files at once
   - **Video**: Max 64MB

### 4. **Vercel Setup**

**Step 4.1: Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Install Vercel GitHub App on your repositories

### 5. **Expo Setup**

**Step 5.1: Create Expo Account**
1. Go to [expo.dev](https://expo.dev)
2. Sign up/Sign in
3. Install Expo CLI globally:
```bash
npm install -g @expo/cli eas-cli
```

4. Login to Expo:
```bash
expo login
eas login
```

## 📋 **PHASE 2: Environment Configuration**

### Create Environment Files

**Step 2.1: Root Environment (.env.local)**
Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Anthropic Claude AI
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# UploadThing
UPLOADTHING_TOKEN=your-uploadthing-token-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Step 2.2: Web App Environment**
Create `apps/web/.env.local` with the same content as above.

**Step 2.3: Mobile App Environment**
Create `apps/mobile/.env` (note: no .local for Expo):

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
EXPO_PUBLIC_ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

## 📋 **PHASE 3: GitHub Repository Setup**

### Step 3.1: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New Repository"
3. Name: `floe`
4. Set as Private (recommended for now)
5. Don't initialize with README (we have our files)
6. Create repository

### Step 3.2: Add Repository Secrets
1. In your GitHub repo, go to **Settings → Secrets and variables → Actions**
2. Add these **Repository Secrets**:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
UPLOADTHING_TOKEN=your-uploadthing-token-here

# Vercel (get these from Vercel dashboard → Settings → General)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Expo (get from expo.dev → Account settings → Access tokens)
EXPO_TOKEN=your-expo-token

# Optional: Notifications
SLACK_WEBHOOK_URL=your-slack-webhook-for-notifications
CODECOV_TOKEN=your-codecov-token-for-coverage
SNYK_TOKEN=your-snyk-token-for-security
LHCI_GITHUB_APP_TOKEN=your-lighthouse-token
```

### Step 3.3: Initialize Git and Push
```bash
# Navigate to your project directory
cd /mnt/c/Users/Dell/desktop/getfloe

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "🎉 Initial commit - Complete Floe application

✅ All 13 prompts implemented:
- Ultra-minimalist design system
- Claude AI integration
- Cross-platform (Web + Mobile)
- Real-time sync with offline support
- Smart spaces auto-organization
- Advanced search with vector similarity
- Media processing with OCR
- Production-ready deployment

🚀 Ready for deployment"

# Add remote repository (replace with your GitHub URL)
git remote add origin https://github.com/yourusername/floe.git

# Push to GitHub
git push -u origin main
```

## 📋 **PHASE 4: Web Deployment (Vercel)**

### Step 4.1: Connect Vercel to GitHub
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository `floe`
4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && npm run build:web`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `npm install`

### Step 4.2: Configure Environment Variables in Vercel
1. In project settings, go to **Environment Variables**
2. Add all your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `UPLOADTHING_SECRET`
   - `UPLOADTHING_APP_ID`
3. Set them for **Production**, **Preview**, and **Development**

### Step 4.3: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (~3-5 minutes)
3. Your web app will be available at: `https://your-project-name.vercel.app`

### Step 4.4: Configure Custom Domain (Optional)
1. Go to **Settings → Domains**
2. Add your custom domain
3. Configure DNS settings as shown
4. Update Supabase redirect URLs with your new domain

## 📋 **PHASE 5: Mobile Deployment (Expo EAS)**

### Step 5.1: Configure EAS
```bash
# Navigate to mobile app
cd apps/mobile

# Initialize EAS
eas build:configure

# This creates eas.json - verify the configuration
```

### Step 5.2: Build for Development/Testing
```bash
# Build development version (for testing)
eas build --platform all --profile development

# This will:
# - Build iOS and Android versions
# - Provide QR codes for testing
# - Take ~10-20 minutes
```

### Step 5.3: Build for Production
```bash
# Build production version
eas build --platform all --profile production

# For app store submission
eas submit --platform all
```

## 📋 **PHASE 6: Testing & Verification**

### Step 6.1: Test Web Application
1. Open your deployed web app
2. Test these flows:
   - **Sign up/Sign in**: Create account and authenticate
   - **Content Creation**: Add notes, links, images
   - **Search**: Test full-text and filtered search
   - **Smart Spaces**: Create and auto-organize content
   - **AI Features**: Verify Claude AI processing works
   - **Real-time Sync**: Open in multiple tabs, verify sync

### Step 6.2: Test Mobile Application
1. Download Expo Go app on your phone
2. Scan QR code from EAS build
3. Test these flows:
   - **Authentication**: Sign up/login with biometrics
   - **Content Capture**: Camera, gallery, text notes
   - **Offline Mode**: Disable internet, create content, re-enable
   - **Push Notifications**: Test if configured
   - **Cross-platform Sync**: Changes should sync with web

### Step 6.3: Run Automated Tests
```bash
# Install dependencies
npm install

# Run all tests
npm run test:ci

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 🚨 **Troubleshooting Common Issues**

### Build Failures
1. **Dependency issues**: Run `npm install` in root, then `npm run build`
2. **TypeScript errors**: Run `npm run type-check` to identify issues
3. **Environment variables**: Verify all required vars are set

### Database Issues
1. **Connection errors**: Check Supabase URL and keys
2. **RLS policy errors**: Verify user authentication
3. **Schema issues**: Re-run schema files in order

### Deployment Issues
1. **Vercel build fails**: Check build logs, verify environment vars
2. **Mobile app crashes**: Check Expo logs, verify native dependencies
3. **API failures**: Verify third-party service configurations

Your Floe application is now deployed and ready for production use! 🎉

### 1.1 Production Environment Variables

Create production `.env` files for each environment:

#### **Web App** (`apps/web/.env.production`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# UploadThing
UPLOADTHING_SECRET=your_production_uploadthing_secret
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_production_app_id

# Claude AI
ANTHROPIC_API_KEY=your_production_claude_api_key

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_MOBILE_SCHEME=floe
```

#### **Mobile App** (`apps/mobile/.env.production`)
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# UploadThing
EXPO_PUBLIC_UPLOADTHING_APP_ID=your_production_app_id
UPLOADTHING_TOKEN=your_production_mobile_token

# Claude AI (if needed for mobile features)
ANTHROPIC_API_KEY=your_production_claude_api_key

# App Configuration
EXPO_PUBLIC_WEB_URL=https://your-domain.com
```

### 1.2 Update App Configuration Files

Update Expo configuration for production:

```json
// apps/mobile/app.config.ts
export default {
  expo: {
    name: "Floe",
    slug: "floe",
    scheme: "floe",
    version: "1.0.0",
    ios: {
      bundleIdentifier: "com.yourcompany.floe",
      buildNumber: "1"
    },
    android: {
      package: "com.yourcompany.floe",
      versionCode: 1
    },
    extra: {
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
}
```

## Step 2: Supabase Production Setup

### 2.1 Create Production Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project for production
3. Choose a strong database password
4. Select closest region to users

### 2.2 Configure Database Schema
```bash
# Apply database schema
cd config/supabase
```

Execute these files in order:
1. `schema.sql` - Core database structure
2. `policies.sql` - Row Level Security policies
3. `storage.sql` - Storage buckets and policies
4. `seed.sql` - Initial data and functions

### 2.3 Configure Authentication
In Supabase Dashboard → Authentication → Settings:

**Site URL**: `https://your-domain.com`
**Redirect URLs**:
- `https://your-domain.com/auth/callback`
- `floe://auth/callback`

**OAuth Providers** (configure as needed):
- Google OAuth
- Apple OAuth (for iOS)
- GitHub OAuth

### 2.4 Storage Configuration
In Supabase Dashboard → Storage:
1. Verify buckets are created: `user-avatars`
2. Check RLS policies are applied
3. Configure CORS for your domain

## Step 3: UploadThing Production Setup

### 3.1 Production App Configuration
1. Go to [UploadThing Dashboard](https://uploadthing.com/dashboard)
2. Create production application
3. Configure file upload endpoints:
   - `/api/uploadthing` (web)
   - Mobile token-based uploads
4. Set allowed file types and size limits
5. Configure webhook URLs (optional)

### 3.2 Security Settings
- Enable token-based authentication for mobile
- Configure CORS for your domain
- Set up rate limiting
- Review file type restrictions

## Step 4: Vercel Web Deployment

### 4.1 Prepare for Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Build and test locally
cd apps/web
npm run build
npm run start
```

### 4.2 Deploy to Vercel
```bash
# From project root
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? Your account/team
# Link to existing project? No
# Project name: floe
# In which directory is your code located? apps/web
```

### 4.3 Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

Add all production environment variables from Step 1.1

### 4.4 Configure Custom Domain (Optional)
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable automatic SSL

### 4.5 Configure Build & Development Settings
- **Build Command**: `cd ../.. && npm run build --filter=web`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `npm install`
- **Framework Preset**: Next.js

## Step 5: Expo EAS Mobile Deployment

### 5.1 Setup EAS CLI
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

### 5.2 Configure EAS Build
```bash
cd apps/mobile

# Initialize EAS configuration
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "env": {
        "ENVIRONMENT": "preview"
      }
    },
    "production": {
      "env": {
        "ENVIRONMENT": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./path-to-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 5.3 Build for Production

#### iOS Build
```bash
# Build iOS app
eas build --platform ios --profile production

# Submit to App Store (after build completes)
eas submit --platform ios --profile production
```

#### Android Build
```bash
# Build Android app
eas build --platform android --profile production

# Submit to Google Play (after build completes)
eas submit --platform android --profile production
```

### 5.4 Configure App Store / Google Play

#### iOS App Store Connect
1. Create app listing
2. Upload screenshots and metadata
3. Configure app information
4. Set pricing and availability
5. Submit for review

#### Google Play Console
1. Create app listing
2. Upload APK/AAB via EAS Submit
3. Configure store listing
4. Set content rating
5. Set pricing and distribution

## Step 6: Monitoring and Analytics

### 6.1 Error Tracking
Configure error tracking services:

#### Sentry (Recommended)
```bash
npm install @sentry/nextjs @sentry/react-native
```

#### Vercel Analytics
Enable in Vercel Dashboard → Analytics

### 6.2 Performance Monitoring
- Vercel Web Analytics
- Expo Application Services (EAS) insights
- Supabase Dashboard metrics

### 6.3 Uptime Monitoring
Set up monitoring for:
- Web application availability
- API endpoint health
- Database connectivity
- File upload functionality

## Step 7: CI/CD Pipeline (Optional)

### 7.1 GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web app
        run: npm run build --filter=web

      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  build-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build mobile app
        run: eas build --platform all --non-interactive --profile production
```

## Step 8: Security Checklist

### 8.1 Environment Security
- [ ] All API keys are in environment variables
- [ ] No secrets in code repository
- [ ] Environment variables are production-ready
- [ ] Rate limiting is configured

### 8.2 Database Security
- [ ] Row Level Security (RLS) enabled
- [ ] Service role key is secure
- [ ] Database backups are configured
- [ ] SSL connections enforced

### 8.3 Application Security
- [ ] HTTPS enforced everywhere
- [ ] CORS properly configured
- [ ] File upload restrictions in place
- [ ] Authentication flows tested
- [ ] Data validation implemented

## Step 9: Performance Optimization

### 9.1 Web Performance
- [ ] Next.js Image optimization enabled
- [ ] Static assets are cached
- [ ] API routes are optimized
- [ ] Bundle size is minimized

### 9.2 Mobile Performance
- [ ] App size is optimized
- [ ] Images are compressed
- [ ] API calls are efficient
- [ ] Offline functionality works

### 9.3 Database Performance
- [ ] Indexes are optimized
- [ ] Queries are efficient
- [ ] Connection pooling configured
- [ ] Vector operations optimized

## Step 10: Post-Deployment Verification

### 10.1 Functional Testing
- [ ] User registration and login
- [ ] Content capture works
- [ ] Search functionality
- [ ] Smart spaces auto-organization
- [ ] File uploads and processing
- [ ] Cross-platform data sync

### 10.2 Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Mobile app startup < 2 seconds
- [ ] Search results < 1 second

### 10.3 Security Testing
- [ ] Authentication flows secure
- [ ] API endpoints protected
- [ ] File uploads restricted
- [ ] Data privacy maintained

## Troubleshooting

### Common Issues

#### Web Deployment Issues
- **Build failures**: Check Node.js version compatibility
- **Environment variables**: Verify all required vars are set
- **API routes failing**: Check Supabase connection

#### Mobile Build Issues
- **EAS build failures**: Check dependencies and Node version
- **Certificate issues**: Verify Apple/Google credentials
- **Environment variables**: Check Expo environment setup

#### Database Issues
- **Connection failures**: Verify Supabase URL and keys
- **RLS policy issues**: Check user permissions
- **Vector search problems**: Verify pgvector extension

### Support Resources

- **Supabase**: [Documentation](https://supabase.com/docs)
- **Vercel**: [Documentation](https://vercel.com/docs)
- **Expo**: [Documentation](https://docs.expo.dev)
- **UploadThing**: [Documentation](https://docs.uploadthing.com)
- **Anthropic Claude**: [Documentation](https://docs.anthropic.com)

## Success Criteria

Your deployment is successful when:
- [ ] Web app is accessible at your domain
- [ ] Mobile apps are available in app stores
- [ ] All features work in production
- [ ] Performance meets targets
- [ ] Security is properly configured
- [ ] Monitoring is active

---

**Next Steps**: After successful deployment, proceed with remaining development phases (PROMPTS 8-13) for additional features like real-time sync, media processing, and performance optimizations.