# Floe Application - GitHub Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the Floe project on GitHub, including repository creation, branch protection, CI/CD, and collaboration workflows.

## Step 1: Initial Repository Setup

### 1.1 Create GitHub Repository

#### Option A: Using GitHub CLI
```bash
# Install GitHub CLI if not already installed
# Windows: winget install --id GitHub.cli
# macOS: brew install gh
# Linux: Follow instructions at https://cli.github.com/

# Authenticate with GitHub
gh auth login

# Create repository (from project root directory)
cd /mnt/c/Users/Dell/desktop/getfloe
gh repo create floe --public --description "Privacy-focused personal knowledge management system with AI-powered auto-organization"

# Push code to GitHub
git remote add origin https://github.com/yourusername/floe.git
git branch -M main
git push -u origin main
```

#### Option B: Using GitHub Web Interface
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Repository details:
   - **Repository name**: `floe`
   - **Description**: "Privacy-focused personal knowledge management system with AI-powered auto-organization"
   - **Visibility**: Public (or Private if preferred)
   - **Initialize repository**: Uncheck all options (we have existing code)
4. Click "Create repository"
5. Follow the instructions to push existing code

### 1.2 Initialize Git Repository (if not already done)

```bash
cd /mnt/c/Users/Dell/desktop/getfloe

# Initialize git if not already done
git init

# Create .gitignore if not exists
echo "node_modules/
.env*
!.env.example
.DS_Store
.vercel
dist/
build/
*.log
.expo/
.eas/
ios/
android/" > .gitignore

# Stage all files
git add .

# Initial commit
git commit -m "Initial commit: Complete Floe application setup

- ✅ Turborepo monorepo with Next.js web and Expo mobile apps
- ✅ Ultra-minimalist design system (black/white only)
- ✅ Supabase database with vector search and RLS
- ✅ Complete authentication system (OAuth + biometric)
- ✅ Content capture and processing system
- ✅ Advanced search with full-text and vector similarity
- ✅ Smart spaces with AI-powered auto-organization
- ✅ Cross-platform UI components
- ✅ Claude AI integration ready
- ✅ UploadThing file storage integration

Progress: 7/13 prompts completed (54%)
Ready for deployment to Vercel and Expo EAS"

# Push to GitHub
git push -u origin main
```

## Step 2: Repository Configuration

### 2.1 Repository Settings

In GitHub repository settings, configure:

#### General Settings
- **Repository name**: floe
- **Description**: Privacy-focused personal knowledge management system
- **Topics**: `knowledge-management`, `ai`, `nextjs`, `expo`, `supabase`, `minimalist`, `typescript`
- **Include in the home page**: ✓

#### Features
- **Wikis**: ✓ (for documentation)
- **Issues**: ✓ (for bug tracking)
- **Sponsorships**: ✓ (if accepting sponsors)
- **Projects**: ✓ (for project management)
- **Discussions**: ✓ (for community)

### 2.2 Branch Protection Rules

#### Protect main branch:
1. Go to Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Configure protection rules:
   - **Require a pull request before merging**: ✓
   - **Require approvals**: 1 (or more for team)
   - **Dismiss stale reviews**: ✓
   - **Require review from code owners**: ✓
   - **Require status checks**: ✓
     - **Require branches to be up to date**: ✓
     - Status checks: `build`, `test`, `lint`
   - **Require linear history**: ✓
   - **Include administrators**: ✓

### 2.3 Create Branch Structure

```bash
# Create development branch
git checkout -b develop
git push -u origin develop

# Create feature branch template
git checkout -b feature/template
git push -u origin feature/template
git checkout main

# Create release branch
git checkout -b release/v1.0.0
git push -u origin release/v1.0.0
git checkout main
```

## Step 3: Documentation Setup

### 3.1 Create README.md

```bash
# This will be automatically created with the content below
```

### 3.2 README.md Content

```markdown
# Floe - AI-Powered Knowledge Management

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/floe)
[![EAS Build](https://img.shields.io/badge/Built%20with-Expo%20EAS-4630EB.svg)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A privacy-focused personal knowledge management system with AI-powered auto-organization. Built with modern web technologies and an ultra-minimalist design philosophy.

## ✨ Features

- **🧠 AI-Powered Organization**: Automatic content categorization and smart spaces
- **🔍 Advanced Search**: Full-text and vector similarity search
- **📱 Cross-Platform**: Web app (Next.js) and mobile app (Expo)
- **🎨 Ultra-Minimalist**: Black and white design, typography-first interface
- **🔒 Privacy-First**: Local processing, secure authentication, data ownership
- **⚡ Real-Time Sync**: Instant synchronization across all devices
- **📚 Smart Collections**: Auto-organizing content based on AI rules
- **🎯 Quick Capture**: Instant note-taking, link saving, file uploads

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic Claude API key
- UploadThing account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/floe.git
cd floe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

4. Configure Supabase:
```bash
# Apply database schema from config/supabase/
```

5. Start development servers:
```bash
# Web app
npm run dev --filter=web

# Mobile app
npm run dev --filter=mobile
```

## 📱 Apps

### Web Application
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom minimalist theme
- **Authentication**: Supabase Auth with OAuth support
- **Deployment**: Vercel

### Mobile Application
- **Framework**: Expo 52 with Expo Router
- **Platform**: iOS and Android
- **Authentication**: Biometric authentication support
- **Distribution**: Expo EAS

## 🏗️ Architecture

```
floe/
├── apps/
│   ├── web/           # Next.js web application
│   └── mobile/        # Expo mobile application
├── packages/
│   ├── shared/        # Business logic and utilities
│   ├── ui/           # Cross-platform UI components
│   └── supabase/     # Database client and types
└── config/           # Configuration files
```

## 🛠️ Tech Stack

- **Frontend**: Next.js, Expo, React Native
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **AI**: Anthropic Claude API
- **Search**: PostgreSQL Full-Text + pgvector
- **Storage**: UploadThing, Supabase Storage
- **Deployment**: Vercel, Expo EAS
- **Monorepo**: Turborepo
- **Language**: TypeScript

## 📊 Progress

- ✅ **PROMPT 1**: Project Structure & Configuration
- ✅ **PROMPT 2**: Supabase Database Schema & Security
- ✅ **PROMPT 3**: Authentication & User Management
- ✅ **PROMPT 4**: Core UI Components & Design System
- ✅ **PROMPT 5**: Content Capture & Processing
- ✅ **PROMPT 6**: Search & Discovery System
- ✅ **PROMPT 7**: Smart Spaces & Auto-Organization
- 🔄 **PROMPT 8**: Real-time Sync & Offline Support
- ⏳ **PROMPT 9**: Media Processing & OCR
- ⏳ **PROMPT 10**: Complete AI Integration
- ⏳ **PROMPT 11**: Performance Optimizations
- ⏳ **PROMPT 12**: UI Polish & Animations
- ⏳ **PROMPT 13**: Testing & Production Deployment

**Status**: 7/13 prompts completed (54%)

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy

#### Web App
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/floe)

#### Mobile App
```bash
# Install EAS CLI
npm install -g eas-cli

# Build and deploy
cd apps/mobile
eas build --platform all
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test specific package
npm run test --filter=shared
```

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [GitHub Setup Guide](./GITHUB_SETUP.md)
- [Technical Requirements Document](./Resources/TRD+Instructions.md)
- [Progress Tracking](./PROGRESS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code)
- Powered by [Supabase](https://supabase.com)
- Deployed on [Vercel](https://vercel.com)
- Mobile builds by [Expo EAS](https://expo.dev)

---

**Made with ❤️ and Claude Code**
```

### 3.3 Create Additional Documentation Files

#### LICENSE file
```bash
# Create MIT License
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

#### CONTRIBUTING.md
```bash
cat > CONTRIBUTING.md << 'EOF'
# Contributing to Floe

Thank you for your interest in contributing to Floe! This document provides guidelines for contributing to the project.

## Development Workflow

1. **Fork the repository** and clone your fork
2. **Create a feature branch** from `develop`:
   ```bash
   git checkout -b feature/your-feature-name develop
   ```
3. **Make your changes** following the coding standards
4. **Test your changes** thoroughly
5. **Commit your changes** with clear commit messages
6. **Push to your fork** and submit a pull request

## Code Style

- **TypeScript**: All code must be properly typed
- **Formatting**: Use Prettier (configured in the project)
- **Linting**: Follow ESLint rules (configured in the project)
- **Components**: Follow the ultra-minimalist design principles
- **Architecture**: Maintain clean separation between packages

## Pull Request Guidelines

- **Target Branch**: Submit PRs to `develop` branch
- **Title**: Clear, descriptive title
- **Description**: Explain what and why, include screenshots for UI changes
- **Testing**: Include tests for new functionality
- **Documentation**: Update documentation as needed

## Reporting Issues

When reporting issues, please include:
- **Environment**: OS, Node.js version, browser/device
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable

## Development Setup

See README.md for detailed setup instructions.

## Questions?

Feel free to open a discussion or issue if you have questions!
EOF
```

## Step 4: GitHub Actions CI/CD

### 4.1 Create Workflows Directory

```bash
mkdir -p .github/workflows
```

### 4.2 Main CI/CD Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

      - name: Build packages
        run: npm run build

  deploy-web:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  build-mobile:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
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
        run: |
          cd apps/mobile
          eas build --platform all --non-interactive --profile production
```

### 4.3 Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "npm"
    directory: "/apps/web"
    schedule:
      interval: "weekly"

  - package-ecosystem: "npm"
    directory: "/apps/mobile"
    schedule:
      interval: "weekly"
```

## Step 5: Issue and PR Templates

### 5.1 Issue Templates

```bash
mkdir -p .github/ISSUE_TEMPLATE
```

#### Bug Report Template
```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: File a bug report
title: "[Bug]: "
labels: ["bug", "triage"]

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!

  - type: input
    id: contact
    attributes:
      label: Contact Details
      description: How can we get in touch with you if we need more info?
      placeholder: ex. email@example.com
    validations:
      required: false

  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
    validations:
      required: true

  - type: dropdown
    id: version
    attributes:
      label: Version
      description: What version of the app are you running?
      options:
        - 1.0.0 (Latest)
        - Development
    validations:
      required: true

  - type: dropdown
    id: platform
    attributes:
      label: Platform
      description: What platform are you using?
      options:
        - Web (Chrome)
        - Web (Firefox)
        - Web (Safari)
        - iOS
        - Android
    validations:
      required: true
```

#### Feature Request Template
```yaml
# .github/ISSUE_TEMPLATE/feature_request.yml
name: Feature Request
description: Suggest an idea for this project
title: "[Feature]: "
labels: ["enhancement"]

body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a new feature!

  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear description of what the problem is.
      placeholder: I'm always frustrated when...
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Describe the solution you'd like
      description: A clear description of what you want to happen.
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Describe alternatives you've considered
      description: A clear description of alternative solutions or features you've considered.
    validations:
      required: false
```

### 5.2 Pull Request Template

```markdown
# .github/pull_request_template.md
## Description

Brief description of changes made in this PR.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?

Please describe the tests that you ran to verify your changes.

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots

If applicable, add screenshots to help explain your changes.

## Additional Context

Add any other context about the pull request here.
```

## Step 6: Repository Secrets Configuration

### 6.1 Required Secrets

In GitHub repository Settings → Secrets and Variables → Actions, add:

#### Vercel Deployment
- `VERCEL_TOKEN`: Your Vercel access token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

#### Expo EAS
- `EXPO_TOKEN`: Your Expo access token
- `EXPO_PROJECT_ID`: Your EAS project ID

#### Environment Variables
- `SUPABASE_URL`: Production Supabase URL
- `SUPABASE_ANON_KEY`: Production Supabase anon key
- `ANTHROPIC_API_KEY`: Claude API key
- `UPLOADTHING_SECRET`: UploadThing secret key

## Step 7: Project Management

### 7.1 Enable GitHub Projects

1. Go to repository → Projects tab
2. Click "Create a project"
3. Choose "Board" template
4. Name: "Floe Development"
5. Add columns: "Backlog", "In Progress", "Review", "Done"

### 7.2 Create Initial Issues

Create issues for remaining prompts:
- PROMPT 8: Real-time Sync & Offline Support
- PROMPT 9: Media Processing & OCR
- PROMPT 10: Complete AI Integration
- PROMPT 11: Performance Optimizations
- PROMPT 12: UI Polish & Animations
- PROMPT 13: Testing & Production Deployment

## Step 8: Community Setup

### 8.1 Enable Discussions

1. Go to Settings → General
2. Enable "Discussions"
3. Create initial discussion categories:
   - 📢 Announcements
   - 💡 Ideas & Feature Requests
   - 🙏 Q&A
   - 💬 General Discussion
   - 🏆 Show and Tell

### 8.2 Create Code of Conduct

GitHub will prompt to add a standard Code of Conduct. Accept the Contributor Covenant.

### 8.3 Security Policy

Create `.github/SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately by:

1. **Email**: security@yourcompany.com
2. **GitHub Security Advisory**: Use the "Security" tab in this repository

Please do not report security vulnerabilities through public GitHub issues.

We will respond to security reports within 48 hours and provide regular updates on our progress.
```

## Success Checklist

- [ ] Repository created and code pushed
- [ ] Branch protection rules configured
- [ ] CI/CD pipeline working
- [ ] Documentation complete
- [ ] Issue/PR templates created
- [ ] Secrets configured
- [ ] Project board set up
- [ ] Community features enabled
- [ ] Security policy in place

## Next Steps

1. **Complete the setup** by running through this checklist
2. **Test the CI/CD pipeline** by creating a test PR
3. **Deploy to production** using the deployment guide
4. **Continue development** with remaining prompts (8-13)
5. **Engage the community** through discussions and issues

---

Your Floe project is now ready for collaborative development and production deployment! 🚀