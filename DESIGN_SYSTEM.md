# GrappleMap Design System

A professional, accessible design system for GrappleMap - built with clean white backgrounds, blue accents, and strong black text for maximum readability.

## 🎨 Design Principles

### 1. Readability First
- **Strong black text** (#030712 for headlines, #111827 for body)
- High contrast ratios (WCAG AAA compliant)
- Clear visual hierarchy

### 2. Clean & Professional
- Pure white backgrounds (#FFFFFF)
- Subtle shadows for depth
- Minimal, purposeful use of color

### 3. Blue as Accent
- Primary brand blue: `#2563EB`
- Used sparingly for interactive elements
- Never dominant, always supportive

### 4. Consistent Interactions
- 150-200ms transitions
- Hover effects with subtle lift
- Focus states with blue rings

---

## 🎯 Color System

### Brand Colors (Blue Palette)
```css
brand-600: #2563EB  /* Primary - use for buttons, links, accents */
brand-700: #1D4ED8  /* Secondary - hover states */
brand-500: #3B82F6  /* Focus rings */
brand-50:  #EFF6FF  /* Subtle backgrounds */
```

### Neutral Colors (Blacks & Grays)
```css
neutral-950: #030712  /* Headlines, hero text */
neutral-900: #111827  /* Body text */
neutral-700: #374151  /* Labels, captions */
neutral-600: #4B5563  /* Helper text */
neutral-200: #E5E7EB  /* Borders */
neutral-100: #F3F4F6  /* Light backgrounds */
neutral-0:   #FFFFFF  /* Pure white */
```

### Usage Guidelines
- **Headlines**: `text-neutral-950` (pure black)
- **Body text**: `text-neutral-900` (almost black)
- **Labels**: `text-neutral-700` (dark gray)
- **Helper text**: `text-neutral-600` (medium gray)
- **Interactive elements**: `text-blue-600` (brand blue)

---

## 🧱 Components

### Button
Professional button component with multiple variants.

```tsx
import { Button } from '@ui/button';

// Primary (blue background, white text)
<Button variant="primary">Save Changes</Button>

// Secondary (gray background, black text)
<Button variant="secondary">Cancel</Button>

// Ghost (transparent, hover gray)
<Button variant="ghost">Learn More</Button>

// Outline (white with border)
<Button variant="outline">View Details</Button>

// With loading state
<Button variant="primary" loading>Saving...</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button> // default
<Button size="lg">Large</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

**Style Guide:**
- Use `primary` for main CTAs (max 1-2 per page)
- Use `secondary` for alternative actions
- Use `ghost` for tertiary actions
- Use `outline` for cancel/dismiss actions

---

### Card
Flexible card component with hover effects.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@ui/card';

<Card variant="elevated" hoverable>
  <CardHeader>
    <CardTitle>User Statistics</CardTitle>
    <CardDescription>Overview of your account activity</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

**Variants:**
- `default` - White background, subtle shadow, 2px border
- `elevated` - More prominent shadow
- `outlined` - Border only, no shadow
- `interactive` - Cursor pointer, hover effects

**Padding:**
- `none` - No padding (for custom layouts)
- `sm` - 16px padding
- `md` - 24px padding (default)
- `lg` - 32px padding

---

### Form Components

#### Input
```tsx
import { Input } from '@ui/input';

<Input
  label="Email Address"
  placeholder="you@example.com"
  helperText="We'll never share your email"
/>

// With error
<Input
  label="Email Address"
  error
  helperText="Please enter a valid email"
/>
```

#### Textarea
```tsx
import { Textarea } from '@ui/textarea';

<Textarea
  label="Description"
  placeholder="Enter details..."
  rows={5}
/>
```

#### Select
```tsx
import { Select } from '@ui/select';

<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
/>
```

---

### Badge
Small status indicators.

```tsx
import { Badge } from '@ui/badge';

<Badge variant="blue">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="default">Info</Badge>
```

---

### PageHeader
Consistent page headers with breadcrumbs.

```tsx
import { PageHeader } from '@ui/page-header';
import { Button } from '@ui/button';

<PageHeader
  title="Dashboard"
  description="Welcome back! Here's what's happening."
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Dashboard' }
  ]}
  actions={
    <>
      <Button variant="secondary">Export</Button>
      <Button variant="primary">Create New</Button>
    </>
  }
/>
```

---

## 📐 Layout Guidelines

### Spacing Scale
Use Tailwind's spacing scale consistently:
- `gap-2` (8px) - Tight spacing within components
- `gap-4` (16px) - Default spacing between elements
- `gap-6` (24px) - Section spacing
- `gap-8` (32px) - Large section spacing
- `gap-12` (48px) - Page section spacing

### Container Widths
```tsx
// Page container
<div className="mx-auto max-w-7xl px-6">

// Content container
<div className="mx-auto max-w-4xl">

// Form container
<div className="mx-auto max-w-2xl">
```

### Grid Layouts
```tsx
// Two columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// Three columns
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// Responsive cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 🎭 Shadows

### Usage
```css
shadow-sm     /* Subtle - for cards at rest */
shadow-md     /* Medium - for elevated cards */
shadow-lg     /* Large - for modals, dropdowns */
hover:shadow-md  /* On card hover */
```

### Custom Shadows
```css
shadow-soft     /* Custom: 0 2px 8px rgba(...) */
shadow-card     /* Custom: 0 4px 16px rgba(...) */
shadow-elevated /* Custom: 0 12px 40px rgba(...) */
```

---

## ✨ Interactive States

### Hover Effects
```tsx
// Cards
className="hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"

// Buttons
className="hover:bg-blue-700 transition-all duration-200"

// Links
className="hover:text-blue-600 transition-colors duration-150"
```

### Focus States
All interactive elements include visible focus states:
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
```

---

## ♿ Accessibility

### Contrast Ratios
- Headlines (neutral-950): 21:1 (AAA)
- Body text (neutral-900): 17:1 (AAA)
- Labels (neutral-700): 11:1 (AAA)
- Interactive blue (brand-600): 4.5:1 (AA)

### Focus Management
- All interactive elements have visible focus rings
- Tab navigation works correctly
- Screen reader labels on all inputs

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<button>` for actions, `<a>` for navigation
- Use `<label>` elements for form inputs

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-First Approach
Always design mobile-first, then enhance for larger screens:

```tsx
className="text-2xl md:text-4xl lg:text-6xl"
className="px-4 md:px-6 lg:px-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 🚀 Best Practices

### Do's ✅
- Use pure black (#030712) for headlines
- Use almost black (#111827) for body text
- Use blue (#2563EB) sparingly for accents
- Add subtle hover effects to interactive elements
- Use consistent spacing (4px increments)
- Include proper focus states
- Test with keyboard navigation

### Don'ts ❌
- Don't use light gray for important text
- Don't overuse blue - it's an accent only
- Don't use gradients for text backgrounds
- Don't create custom colors - use the system
- Don't forget hover/focus states
- Don't use inconsistent spacing
- Don't mix color palettes

---

## 📦 Component Import Pattern

```tsx
// Individual imports (recommended)
import { Button } from '@ui/button';
import { Card, CardHeader, CardTitle } from '@ui/card';
import { Input } from '@ui/input';

// Or from index
import { Button, Card, Input } from '@grapplemap/ui';
```

---

## 🎨 Example Page Layout

```tsx
import { PageHeader } from '@ui/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/card';
import { Button } from '@ui/button';
import { Input } from '@ui/input';

export default function ExamplePage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account preferences"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Settings' }
        ]}
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input label="Name" placeholder="John Doe" />
                <Input label="Email" type="email" placeholder="john@example.com" />
                <div className="flex gap-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" fullWidth>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
```

---

## 🔄 Migration Guide

### From Old to New

**Text Colors:**
```diff
- className="text-slate-300"
+ className="text-neutral-700"

- className="text-emerald-200"
+ className="text-blue-600"

- className="text-white"
+ className="text-neutral-950"
```

**Backgrounds:**
```diff
- className="bg-slate-950"
+ className="bg-white"

- className="bg-slate-900"
+ className="bg-neutral-50"
```

**Buttons:**
```diff
- className="bg-gradient-to-r from-emerald-400 to-sky-500"
+ <Button variant="primary">Action</Button>
```

**Cards:**
```diff
- className="rounded-3xl border border-white/10 bg-white/5"
+ <Card variant="elevated">
```

---

## 📚 Resources

- **Tailwind CSS Docs**: https://tailwindcss.com
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Design Tokens**: `/packages/ui/src/lib/design-tokens.ts`
- **Color Config**: `/packages/config/colors.js`

---

**Version**: 1.0.0
**Last Updated**: November 2024
**Maintained by**: GrappleMap Team
