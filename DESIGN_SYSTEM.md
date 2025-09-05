# Floe Design System Documentation

## Overview
This document outlines the design system for the Floe productivity application. All future development should adhere to these guidelines to maintain consistency.

## Brand Colors

### Primary Palette
- **Sunglow**: `#E57873` - Primary accent color for CTAs, active states, and important actions
- **Sand**: `#F9F4EE` - Light backgrounds, cards in light mode
- **Nightfall**: `#362E45` - Primary text, dark backgrounds, headers

### Extended Palette
- **Background Dark**: `#1A1625` - Main dark theme background
- **Surface Dark**: `#241F2E` - Card backgrounds in dark mode
- **Border Dark**: `#3A3547` - Subtle borders and dividers
- **Text Primary**: `#FFFFFF` - Primary text in dark mode
- **Text Secondary**: `#A09BA8` - Secondary/muted text
- **Success**: `#4CAF50` - Success states
- **Warning**: `#FF9800` - Warning states
- **Error**: `#F44336` - Error states

## Design Principles

### 1. Flat Design
- NO glassmorphism effects
- NO gradients except for subtle backgrounds
- Clean, solid colors with clear boundaries
- Subtle shadows for depth (0-4px)

### 2. Minimalist Approach
- Maximum white space
- Clear visual hierarchy
- Focus on content, not decoration
- No unnecessary visual elements

### 3. Professional Aesthetic
- **ABSOLUTELY NO EMOJIS** anywhere in the UI
- Clean, professional typography
- Serious productivity focus
- Business-appropriate language

## Typography

### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### Font Sizes
- **Display**: 48px (3rem)
- **H1**: 32px (2rem)
- **H2**: 24px (1.5rem)
- **H3**: 20px (1.25rem)
- **Body**: 16px (1rem)
- **Small**: 14px (0.875rem)
- **Tiny**: 12px (0.75rem)

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing System
Base unit: 4px

- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Component Guidelines

### Buttons
```css
/* Primary Button */
background: #E57873;
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
no borders;

/* Secondary Button */
background: transparent;
color: #E57873;
border: 2px solid #E57873;
padding: 10px 22px;

/* Ghost Button */
background: transparent;
color: #A09BA8;
padding: 12px 24px;
```

### Cards
```css
background: #241F2E; /* dark mode */
background: #FFFFFF; /* light mode */
border-radius: 12px;
padding: 24px;
border: 1px solid #3A3547; /* dark mode */
border: 1px solid #E5E5E5; /* light mode */
```

### Input Fields
```css
background: #1A1625; /* dark mode */
border: 1px solid #3A3547;
border-radius: 8px;
padding: 12px 16px;
color: #FFFFFF;
```

## Layout Structure

### Dashboard/Homescreen
1. **Top Bar**: Minimal navigation with user profile
2. **Main Grid**: Productivity widgets in card layout
3. **Quick Actions**: Floating action area for quick task/timer start
4. **Focus Area**: Current task and timer prominent display

### Task Manager
- **Sidebar**: 240px fixed width with navigation
- **Main Content**: Flexible width with task lists
- **Detail Panel**: 320px right sidebar (collapsible)

### Timer/Pomodoro
- **Centered Layout**: Timer takes center stage
- **Controls Below**: Start/pause/reset actions
- **Settings**: Slide-out panel from right
- **Stats**: Bottom or side panel for session history

### Calendar
- **Header**: View switcher (Day/Week/Month)
- **Main Grid**: Calendar display
- **Event List**: Right sidebar with day's events
- **Filters**: Top bar filters for event types

## Interactions

### Hover States
- Buttons: Darken by 10%
- Cards: Subtle shadow increase
- Links: Underline or color change

### Active States
- Left border accent (4px) in Sunglow
- Background color change
- Text color to primary

### Transitions
- All transitions: 200ms ease
- No bounce or elastic effects
- Subtle, professional animations only

## Mobile Responsiveness

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Adaptations
- Stack layouts vertically
- Collapsible sidebars
- Bottom navigation for core features
- Touch-friendly tap targets (44px minimum)

## Accessibility

### Color Contrast
- Minimum WCAG AA compliance
- Text on backgrounds: 4.5:1 ratio
- Large text: 3:1 ratio

### Focus Indicators
- Clear focus rings (2px solid #E57873)
- Keyboard navigation support
- Skip links where appropriate

## Icon Usage
- Use line icons only (no filled icons)
- Consistent 24px size for UI icons
- 20px for small/inline icons
- NO EMOJI ICONS

## Implementation Notes

### CSS Variables to Define
```css
:root {
  /* Colors */
  --color-sunglow: #E57873;
  --color-sand: #F9F4EE;
  --color-nightfall: #362E45;
  --color-bg-dark: #1A1625;
  --color-surface-dark: #241F2E;
  --color-border-dark: #3A3547;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A09BA8;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, sans-serif;
  --font-mono: 'SF Mono', Monaco, monospace;
  
  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

## Priority Implementation Order

1. **Phase 1**: Remove ALL emojis from the codebase
2. **Phase 2**: Update color variables and base CSS
3. **Phase 3**: Redesign homepage/dashboard with productivity focus
4. **Phase 4**: Update Task Manager to flat design
5. **Phase 5**: Redesign Timer with clean, focused interface
6. **Phase 6**: Update Calendar with minimal design
7. **Phase 7**: Fix all broken functionality
8. **Phase 8**: Testing and refinement

## Productivity-Focused Dashboard Concept

### Key Widgets (Priority Order)
1. **Current Focus Session** - Active timer or next scheduled session
2. **Today's Priority** - Single most important task
3. **Task Queue** - Next 3-5 tasks in order
4. **Daily Progress** - Simple metrics (tasks done, time focused)
5. **Quick Start** - One-click timer start with last settings
6. **Weekly Overview** - Minimal calendar view of week
7. **Streak Counter** - Simple motivation metric

### Layout Philosophy
- Most important elements above the fold
- Progressive disclosure (details on demand)
- One-click access to core features
- Minimal cognitive load
- Clear visual hierarchy

---

*Last Updated: December 2024*
*Version: 1.0*