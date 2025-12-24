# EquiXtate Design System

> Ultra-modern, enterprise-grade design system for real estate tokenization platform

## Overview

EquiXtate's design system emphasizes **clarity**, **trust**, and **sophistication** through:
- Minimal, subdued color palette with purposeful accents
- Consistent spacing and typography scales
- Glassmorphism for depth without visual noise
- Purposeful motion that guides attention

---

## Design Tokens

All design tokens are centralized in `src/styles/design-tokens.ts` and `src/index.css`.

### Spacing Scale

```typescript
export const DS = {
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  }
}
```

### Border Radius

```typescript
radius: {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
}
```

### Shadows

```typescript
shadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
}
```

### Transitions

```typescript
transition: {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
}
```

---

## Color System

### Semantic Tokens (CSS Variables)

Defined in `src/index.css`:

```css
--background: 222.2 84% 4.9%;       /* Deep space black */
--foreground: 210 40% 98%;          /* Near-white text */

--primary: 217.2 91.2% 59.8%;       /* Subdued blue accent */
--primary-foreground: 222.2 47.4% 11.2%;

--muted: 217.2 32.6% 17.5%;         /* Muted backgrounds */
--muted-foreground: 215 20.2% 65.1%; /* Muted text */

--border: 217.2 32.6% 17.5%;        /* Subtle borders */
--ring: 224.3 76.3% 48%;            /* Focus rings */
```

### Legacy Palette (Space Theme)

Available via Tailwind but use sparingly:
- `space-black`: Deep background (#0A0118)
- `space-deep-purple`: Card backgrounds (rgba(30, 20, 60, 0.8))
- `space-neon-*`: Accent colors (use semantic tokens instead)

**Best practice:** Prefer semantic tokens (`bg-background`, `text-foreground`, `border-border`) for consistent theming.

---

## Typography

### Utility Classes

Defined in `src/index.css`:

```css
.ds-h1 { /* 2.5rem, 700, tight leading */ }
.ds-h2 { /* 2rem, 600 */ }
.ds-h3 { /* 1.5rem, 600 */ }
.ds-h4 { /* 1.25rem, 600 */ }
.ds-h5 { /* 1.125rem, 600 */ }

.ds-body { /* 1rem, 400, relaxed */ }
.ds-body-sm { /* 0.875rem, 400 */ }
.ds-label { /* 0.75rem, 500, uppercase, tracking-wide */ }
```

### Font Families

- **Inter**: Body text, UI elements (via `@fontsource-variable/inter`)
- **Orbitron**: Legacy headings (being phased out; use `font-semibold` instead)

---

## Layout Primitives

### PageContainer

Centers content and applies consistent max-width:

```tsx
import PageContainer from '@/components/layout/PageContainer';

<PageContainer>
  {/* Content auto-centers at xl:max-w-7xl with responsive padding */}
</PageContainer>
```

**Props:**
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` (default: `'xl'`)

### Section

Vertical rhythm wrapper with consistent spacing and optional dividers:

```tsx
import Section from '@/components/layout/Section';

<Section spacing="normal" dividerTop>
  {/* Content with py-16 and top border */}
</Section>
```

**Props:**
- `spacing?: 'tight' | 'normal' | 'loose'` → py-8 / py-16 / py-24
- `dividerTop?: boolean` → adds subtle top border
- `dividerBottom?: boolean`

### ContentGrid

Responsive grid for feature cards or content blocks:

```tsx
import ContentGrid from '@/components/layout/ContentGrid';

<ContentGrid columns="3">
  {/* Auto-responsive: 1 col mobile, 2 tablet, 3 desktop */}
</ContentGrid>
```

**Props:**
- `columns?: '2' | '3' | '4'`
- `gap?: 'sm' | 'md' | 'lg'`

### StickyAside

Sticky sidebar for detail pages:

```tsx
import StickyAside from '@/components/layout/StickyAside';

<StickyAside topOffset={80}>
  {/* Sticks to viewport with configurable top offset */}
</StickyAside>
```

---

## Styling Patterns

### Glassmorphism

Use the `.glassmorphism` utility for cards and panels:

```css
.glassmorphism {
  background: rgba(17, 25, 40, 0.75);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.125);
}
```

**Example:**
```tsx
<div className="glassmorphism p-6 rounded-lg">
  {/* Card content */}
</div>
```

### Cards

Use shadcn `Card` components with glassmorphism:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card className="glassmorphism">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Buttons

Always use shadcn `Button` with variants:

```tsx
import { Button } from '@/components/ui/button';

<Button>Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

**Avoid:** Raw `<button>` elements or inline `className` styling.

---

## Motion System

Shared motion presets live in `src/styles/motion-presets.ts`.

### Available Presets

```typescript
import { fadeSlideUp, cardHover, scaleIn } from '@/styles/motion-presets';

// Fade + slide up for content reveals
<motion.div variants={fadeSlideUp} initial="hidden" animate="visible">

// Card hover lift
<motion.div whileHover={cardHover}>

// Modal/dialog scale-in
<motion.div variants={scaleIn} initial="hidden" animate="visible" exit="exit">
```

### Preset Reference

- **fadeSlideUp / fadeSlideDown**: Content entrance with 20px slide
- **scaleIn**: Modal/dialog with scale + fade (includes exit)
- **cardHover**: Subtle y: -4px lift
- **subtleHover**: Minimal scale: 1.02
- **staggerContainer / staggerItem**: Sequential child animations
- **fade**: Simple opacity transition
- **slideFromLeft / slideFromRight**: Horizontal slides

### Usage Guidelines

1. **Always use presets** instead of inline variants for consistency
2. **viewport={{ once: true }}** on scroll-triggered animations to prevent re-triggers
3. **Stagger delays**: `transition={{ delay: index * 0.1 }}`
4. **Prefer whileHover over animate** for interactive states

---

## Component Patterns

### Property Card

Standard pattern with motion and hover state:

```tsx
import { motion } from 'framer-motion';
import { fadeSlideUp, cardHover } from '@/styles/motion-presets';

<motion.div
  className="space-card group"
  initial="hidden"
  animate="visible"
  variants={fadeSlideUp}
  whileHover={cardHover}
>
  {/* Card content */}
</motion.div>
```

### Two-Column Detail Layout

```tsx
<Section spacing="normal">
  <PageContainer>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 xl:col-span-8">
        {/* Main content */}
      </div>
      <div className="lg:col-span-5 xl:col-span-4">
        <StickyAside>
          {/* Sidebar panels */}
        </StickyAside>
      </div>
    </div>
  </PageContainer>
</Section>
```

### Data Display Cards

Use glassmorphism with consistent padding and structure:

```tsx
<div className="glassmorphism p-5">
  <h3 className="ds-label mb-2">Label</h3>
  <p className="text-2xl font-semibold">Value</p>
  <p className="ds-body-sm text-muted-foreground">Subtext</p>
</div>
```

---

## Accessibility Guidelines

### Focus States

All interactive elements use the default focus ring:

```css
--ring: 224.3 76.3% 48%;
```

shadcn components handle this automatically. For custom elements:

```tsx
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### Keyboard Navigation

- All buttons and links must be keyboard accessible
- Use semantic HTML (`<button>`, `<a>`, `<nav>`)
- Modal/dialog focus trapping is handled by Radix primitives

### Color Contrast

- **Body text**: `text-foreground` on `bg-background` → WCAG AA compliant
- **Muted text**: `text-muted-foreground` → use for non-critical info only
- **Links/buttons**: `text-primary` with adequate contrast

### Screen Readers

- Use `aria-label` for icon-only buttons
- Card images include `alt` text
- Navigation landmarks (`<nav>`, `<main>`, `<footer>`)

---

## File Organization

```
src/
├── styles/
│   ├── design-tokens.ts       # Centralized tokens
│   ├── motion-presets.ts      # Framer Motion variants
│   └── (deprecated)
├── components/
│   ├── layout/
│   │   ├── PageContainer.tsx
│   │   ├── Section.tsx
│   │   ├── ContentGrid.tsx
│   │   └── StickyAside.tsx
│   ├── ui/                    # shadcn components
│   └── [feature]/             # Feature-specific components
├── pages/                     # Route-level containers
└── index.css                  # Global styles + utilities
```

---

## Migration Notes

### Deprecations

**Avoid these legacy patterns:**

❌ `.neon-border-*` classes → Use `border border-border`  
❌ `.font-orbitron` → Use `font-semibold`  
❌ `.text-space-neon-*` → Use semantic tokens (`text-primary`, `text-muted-foreground`)  
❌ Inline motion variants → Import from `motion-presets.ts`  
❌ Manual container padding → Use `<PageContainer>`

### Modern Equivalents

| Legacy | Modern |
|--------|--------|
| `text-space-neon-blue` | `text-primary` |
| `bg-space-deep-purple/30` | `glassmorphism` |
| `font-orbitron text-2xl` | `text-2xl font-semibold` |
| `container mx-auto px-4` | `<PageContainer>` |
| Custom `motion` variants | `import { fadeSlideUp } from '@/styles/motion-presets'` |

---

## Best Practices

### Do ✅

- Use semantic color tokens (`bg-background`, `text-foreground`)
- Wrap pages with `Section` and `PageContainer`
- Import motion presets from `motion-presets.ts`
- Use shadcn `Button`, `Card`, `Badge` components
- Apply `.glassmorphism` for card backgrounds
- Use typography utilities (`.ds-h1`, `.ds-body`)

### Don't ❌

- Hard-code spacing values (use `gap-4`, `p-6`, etc.)
- Create raw `<button>` elements
- Inline animation variants
- Use legacy `space-neon-*` colors directly
- Skip `PageContainer` for page-level layouts
- Nest glassmorphism layers excessively

---

## Quick Reference

### Common Class Combinations

```tsx
// Standard card
<div className="glassmorphism p-6 rounded-lg">

// Stat card with border
<Card className="glassmorphism">

// Page section
<Section spacing="normal" dividerTop>
  <PageContainer>

// Interactive card
<motion.div 
  className="space-card group"
  variants={fadeSlideUp}
  whileHover={cardHover}
>

// Primary CTA
<Button size="lg">Get Started</Button>

// Muted secondary text
<p className="ds-body-sm text-muted-foreground">
```

---

## Support

For questions or contributions:
- Review `src/styles/design-tokens.ts` for available tokens
- Check `src/components/ui/` for shadcn component APIs
- Reference `src/components/layout/` for layout primitives
- See `src/styles/motion-presets.ts` for animation variants

**Last Updated:** November 2025
