# Cricket App Design System Guide

## Overview
This document outlines the fundamental design changes implemented across all screens to create a consistent, modern mobile-first cricket application experience.

## Core Design Principles

### 1. Color Palette
- **Primary Blue**: `#1e3a8a` (Deep navy blue for headers, primary elements)
- **Secondary Blue**: `#1e40af` (Slightly lighter blue for segmented tabs)
- **Accent Blue**: `#3b82f6` (Light blue for active states and highlights)
- **White**: `#ffffff` (Backgrounds, text on dark backgrounds)
- **Gray Scale**: `#6b7280` (Secondary text, inactive elements)
- **Red**: `#ef4444` (Live match indicators, error states)
- **Gold**: `#fbbf24` (Special highlights, player of the match)

### 2. Typography
- **Font Family**: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif
- **Headers**: Bold (700-800 weight), uppercase for team names
- **Body Text**: Regular (400-500 weight), clean and readable
- **Sizes**: Responsive scaling from mobile to desktop

### 3. Layout Structure
- **Mobile-First**: All designs prioritize mobile experience
- **Sticky Headers**: Deep blue headers that stay at top during scroll
- **Bottom Navigation**: 5-tab navigation for mobile (hidden on desktop)
- **Card-Based**: Content organized in rounded cards with subtle shadows
- **Single Column**: Mobile-optimized single column layouts

## Screen-Specific Changes

### 1. Landing Page (Dashboard.tsx)
**Fundamental Changes:**
- **Split Layout**: 60% deep blue gradient top section, 40% white bottom section
- **Gold Cricket Helmet**: Custom-built icon with crown and helmet using CSS
- **"Crick Heroes" Branding**: Large white text with proper hierarchy
- **Cricket Players Illustration**: Stylized silhouettes of batsman and fielder
- **Stadium Background**: Subtle stadium seating pattern using gradients
- **GET STARTED Button**: Prominent blue button with hover effects

**Key Components:**
- Deep blue gradient background with stadium pattern
- Gold cricket helmet icon with crown
- White text branding with shadows
- Cricket players silhouettes
- Clean white bottom section with CTA

### 2. Matches List Page (MatchesList.tsx)
**Fundamental Changes:**
- **Deep Blue Header**: Solid header with back arrow, title, and filter icon
- **Segmented Tabs**: Three-tab system (Live Matches, Upcoming, Past Matches)
- **Card-Based Layout**: Single column card layout for mobile
- **Status-Specific Cards**: Different designs for Live, Upcoming, and Past matches
- **Team Logos**: Colored avatars with team initials
- **Bottom Navigation**: 5-tab mobile navigation

**Key Components:**
- Sticky deep blue header
- Segmented tab navigation
- Match status cards with team info
- Live match indicators (red tags)
- Past match result summaries
- Mobile bottom navigation

### 3. Match Details Page (MatchDetails.tsx)
**Fundamental Changes:**
- **Match Header**: Deep blue header with team scores and VS circle
- **Winner Banner**: Blue pill-shaped banner showing match result
- **Segmented Tabs**: Scorecard, Commentary, Info tabs
- **Scorecard Tables**: Clean tables for batting and bowling stats
- **Match Info Cards**: Icon-based information display
- **Fall of Wickets**: Simple list format

**Key Components:**
- Team scores with VS circle
- Winner announcement banner
- Segmented tab navigation
- Scorecard tables with proper headers
- Match information with icons
- Mobile bottom navigation

## Component Patterns

### 1. Headers
```tsx
// Deep blue sticky header pattern
<Box sx={{
  backgroundColor: '#1e3a8a',
  color: '#ffffff',
  py: 2,
  px: 2,
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
}}>
```

### 2. Segmented Tabs
```tsx
// Three-button segmented tab pattern
<Box sx={{ 
  display: 'flex', 
  backgroundColor: '#1e40af',
  borderRadius: 2,
  p: 0.5,
  mb: 2
}}>
  <Button variant={active ? 'contained' : 'text'}>
    Tab Label
  </Button>
</Box>
```

### 3. Cards
```tsx
// Standard card pattern
<Card sx={{ 
  mb: 2, 
  borderRadius: 2, 
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' 
}}>
  <CardContent sx={{ p: 2 }}>
    {/* Content */}
  </CardContent>
</Card>
```

### 4. Bottom Navigation
```tsx
// Mobile bottom navigation pattern
<Paper sx={{
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: { xs: 'block', md: 'none' },
  zIndex: 1000,
  borderTop: '1px solid #e0e0e0',
  borderRadius: '16px 16px 0 0',
  backgroundColor: '#ffffff',
}}>
```

## Implementation Guidelines

### 1. Mobile-First Approach
- Design for mobile screens first (320px+)
- Use responsive breakpoints: `xs`, `sm`, `md`, `lg`
- Hide desktop elements on mobile, mobile elements on desktop
- Touch-friendly button sizes (minimum 44px)

### 2. Color Usage
- Use primary blue for headers and primary actions
- Use secondary blue for tab backgrounds
- Use accent blue for active states
- Use gray for secondary text and inactive elements
- Use red only for live/urgent indicators

### 3. Typography Hierarchy
- H1-H6: Use for headings with proper weight and size
- Body1/Body2: Use for regular text content
- Caption: Use for small labels and metadata
- Maintain consistent line heights and spacing

### 4. Spacing and Layout
- Use consistent padding: `p: 2` for cards, `px: 2, py: 2` for sections
- Use consistent margins: `mb: 2` between cards
- Use consistent gaps: `gap: 1` for small spacing, `gap: 2` for larger spacing
- Maintain 16px minimum touch targets

### 5. Interactive States
- Hover effects: `transform: 'translateY(-2px)'` and shadow changes
- Active states: Use accent blue background
- Focus states: Maintain accessibility standards
- Loading states: Use CircularProgress with proper positioning

## Future Screen Updates

When updating additional screens, follow these patterns:

1. **Header**: Use deep blue sticky header with back navigation
2. **Content**: Use card-based layout with proper spacing
3. **Navigation**: Use segmented tabs for filtering/views
4. **Mobile**: Include bottom navigation for mobile users
5. **Colors**: Stick to the defined color palette
6. **Typography**: Use consistent font weights and sizes
7. **Spacing**: Maintain consistent padding and margins

## Accessibility Considerations

- Maintain proper color contrast ratios
- Use semantic HTML elements
- Provide proper focus indicators
- Ensure touch targets are at least 44px
- Use proper heading hierarchy
- Provide alt text for images and icons

This design system ensures consistency across all screens while maintaining a modern, mobile-first cricket application experience.
