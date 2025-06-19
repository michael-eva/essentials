# Essentials Studio Design System

This design system recreates the sophisticated, warm aesthetic of Essentials Studio for your application.

## Color Palette

### Primary Brand Colors
- **Warm Brown** (`brand-warm-brown`): #705444 - Primary brand color, use for main text and UI elements
- **Deep Blue** (`brand-deep-blue`): #3c5daa - Professional accent color for secondary actions
- **Amber** (`brand-amber`): #FFAB0C - Call-to-action color for important buttons and highlights
- **Sand** (`brand-sand`): #C9B59D - Light accent color for subtle backgrounds

### Usage Examples

```tsx
// Direct brand colors
<div className="bg-brand-warm-brown text-white">
<h1 className="text-brand-amber">
<Button className="bg-brand-deep-blue text-white">

// System colors (adapt to light/dark theme)
<div className="bg-primary text-primary-foreground">
<div className="bg-accent text-accent-foreground">
```

## Typography

### Font Stack
- **Primary**: Space Grotesk (similar to Maison Neue Extended)
- **Monospace**: JetBrains Mono (similar to Anonymous Pro)

### Heading Classes
```tsx
<h1 className="text-5xl font-bold tracking-tight text-brand-warm-brown lg:text-7xl">
<h2 className="text-3xl font-semibold text-brand-warm-brown tracking-tight">
<h3 className="text-2xl font-semibold text-brand-warm-brown tracking-tight">
```

### Utility Classes
Use the pre-defined typography classes from `essentialsTypography`:
```tsx
import { essentialsTypography } from "@/components/essentials";

<h1 className={essentialsTypography.hero}>Hero Text</h1>
<p className={essentialsTypography.body}>Body text</p>
<code className={essentialsTypography.code}>Code snippet</code>
```

## Components

### EssentialsButton
```tsx
import { EssentialsButton } from "@/components/essentials";

<EssentialsButton variant="primary">Primary Action</EssentialsButton>
<EssentialsButton variant="accent">Accent Action</EssentialsButton>
<EssentialsButton variant="secondary">Secondary Action</EssentialsButton>
<EssentialsButton variant="outline">Outline Button</EssentialsButton>
<EssentialsButton variant="ghost">Ghost Button</EssentialsButton>
```

### EssentialsCard
```tsx
import { EssentialsCard } from "@/components/essentials";

<EssentialsCard variant="default">
  Standard card with warm shadows
</EssentialsCard>

<EssentialsCard variant="featured">
  Featured card with gradient background
</EssentialsCard>

<EssentialsCard variant="warm">
  Warm-toned card with brand colors
</EssentialsCard>
```

## Animations

### Available Animations
- `animate-gentle-fade-in`: Smooth fade-in with slight upward movement
- `animate-warm-glow`: Warm amber glow effect for special elements
- `transition-all duration-300 hover:scale-105`: Subtle hover scale effect

### Usage
```tsx
<div className="animate-gentle-fade-in">
<Button className="animate-warm-glow">Special CTA</Button>
<div className="transition-all duration-300 hover:scale-105">
```

## Shadows

### Warm Shadow System
- `shadow-warm`: Standard warm-toned shadow
- `shadow-warm-lg`: Larger warm shadow for featured elements
- `shadow-warm hover:shadow-warm-lg transition-shadow`: Interactive shadow

```tsx
<div className="bg-card p-6 rounded-xl shadow-warm hover:shadow-warm-lg transition-shadow">
  Interactive card with warm shadows
</div>
```

## Layout Patterns

### Hero Section
```tsx
<section className="relative bg-gradient-to-br from-brand-neutral-light via-background to-brand-neutral overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-brand-warm-brown/5 to-brand-deep-blue/5"></div>
  <div className="container relative py-20 lg:py-32">
    <h1 className="text-5xl font-bold tracking-tight text-brand-warm-brown lg:text-7xl">
      Your Hero Text
      <span className="text-brand-amber block">With Accent</span>
    </h1>
  </div>
</section>
```

### Content Cards
```tsx
<div className="bg-card p-6 rounded-xl border border-border shadow-warm hover:shadow-warm-lg transition-shadow">
  <h3 className="text-lg font-semibold text-brand-warm-brown mb-3">Card Title</h3>
  <p className="text-brand-warm-brown/70 mb-4">Card content with proper opacity</p>
  <EssentialsButton variant="primary">Action Button</EssentialsButton>
</div>
```

### Feature Highlights
```tsx
<div className="bg-gradient-to-br from-brand-amber/10 to-brand-deep-blue/10 p-6 rounded-xl border border-brand-sand">
  <h3 className="text-lg font-semibold text-brand-warm-brown mb-3">Featured Item</h3>
  <p className="text-brand-warm-brown/70 mb-4">Special content with gradient background</p>
  <EssentialsButton variant="accent">Special Action</EssentialsButton>
</div>
```

## Best Practices

### Color Usage
1. **Primary Actions**: Use `brand-amber` for main CTAs and important highlights
2. **Text Hierarchy**: Use `brand-warm-brown` with opacity variations (80%, 70%, 60%)
3. **Backgrounds**: Prefer subtle gradients with `brand-neutral-light` and `brand-neutral`
4. **Accents**: Use `brand-deep-blue` sparingly for professional touches

### Typography Hierarchy
1. **Hero**: 5xl-7xl, bold, `brand-warm-brown` with `brand-amber` accents
2. **Sections**: 3xl, semibold, `brand-warm-brown`
3. **Cards**: lg-xl, semibold, `brand-warm-brown`
4. **Body**: base, normal, `brand-warm-brown/80`
5. **Captions**: sm, normal, `brand-warm-brown/60`

### Spacing & Layout
- Use consistent spacing with Tailwind's spacing scale
- Prefer rounded corners (rounded-lg, rounded-xl)
- Add generous padding to cards and sections
- Use the container class for consistent max-widths

### Interactive Elements
- Always include hover states with smooth transitions
- Use warm shadows that intensify on hover
- Apply subtle scale transforms for engagement
- Maintain accessibility with proper contrast ratios

## Dark Mode Support

The system automatically adapts to dark mode:
- Background shifts to warm dark tones
- `brand-amber` becomes the primary color
- `brand-deep-blue` serves as the accent
- All opacity-based colors maintain proper contrast

```tsx
// These automatically adapt to dark mode
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-primary text-primary-foreground">
```

## Quick Start

1. **Import components**:
```tsx
import { EssentialsButton, EssentialsCard, essentialsTypography } from "@/components/essentials";
```

2. **Use brand colors**:
```tsx
<div className="bg-brand-warm-brown text-white">
<h1 className="text-brand-amber">
<p className="text-brand-warm-brown/80">
```

3. **Apply animations**:
```tsx
<div className="animate-gentle-fade-in">
<Button className="animate-warm-glow">
```

4. **Create layouts**:
```tsx
<EssentialsCard variant="featured">
  <h3 className={essentialsTypography.subtitle}>Title</h3>
  <p className={essentialsTypography.body}>Content</p>
  <EssentialsButton variant="accent">Action</EssentialsButton>
</EssentialsCard>
```

This design system gives you all the tools to create interfaces that match Essentials Studio's sophisticated, warm, and professional aesthetic while maintaining excellent usability and accessibility.
