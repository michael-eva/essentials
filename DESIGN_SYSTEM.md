# Essentials Studio Design System

This design system implements the official brand guidelines for Essentials Studio, creating a sophisticated, warm aesthetic that embodies "Experience the Burn."

## Brand Identity

**Brand Name**: Essentials Studio  
**Tagline**: "Experience the Burn"  
**Services**: Reformer, Mat Pilates, Boxing

## Color Palette

### Primary Brand Colors

- **Brown** (`brand-brown`): #705444 - Primary brand color, use for main text and UI elements
- **Light Yellow** (`brand-light-yellow`): #fffce8 - Primary complementary, background color option
- **Cobalt** (`brand-cobalt`): #3c5daa - Attention/CTA color for important buttons and highlights
- **Bright Orange** (`brand-bright-orange`): #ffab0c - High-impact accent color

### Accent Colors

- **Nude** (`brand-nude`): #c9b59d - Soft accent color for subtle backgrounds
- **Sage** (`brand-sage`): #8ca88f - Flexible accent color

### Classic Colors

- **Black** (`brand-black`): #000000
- **White** (`brand-white`): #ffffff

### Usage Examples

```tsx
// Direct brand colors
<div className="bg-brand-brown text-brand-light-yellow">
<h1 className="text-brand-bright-orange">
<Button className="bg-brand-cobalt text-brand-white">

// System colors (adapt to light/dark theme)
<div className="bg-primary text-primary-foreground">
<div className="bg-accent text-accent-foreground">
```

## Typography

### Font Stack

- **Primary**: Space Grotesk (similar to Maison Neue Extended)
- **Monospace**: JetBrains Mono (similar to Anonymous Pro)

### Heading Styles

```tsx
// Main Headings - Maison Neue Extended style
<h1 className="text-5xl font-semibold tracking-normal text-brand-brown lg:text-7xl">
<h2 className="text-3xl font-semibold text-brand-brown tracking-normal">

// Sub Headings - PP Monument Extended style
<h3 className="text-2xl font-black tracking-normal uppercase text-brand-brown">
<h4 className="text-xl font-black tracking-normal uppercase text-brand-brown">
```

### Body Text

```tsx
// Body Copy - Maison Neue Extended style
<p className="text-brand-brown/80 leading-relaxed font-light">
<span className="text-brand-brown/60 font-light">

// Pull Quotes & Accents - Anonymous Pro style
<code className="font-mono text-brand-cobalt bg-brand-light-yellow px-2 py-1 rounded">
```

### Call-to-Action Buttons

```tsx
// Primary CTA
<button className="cta-primary bg-brand-brown text-brand-light-yellow">

// Secondary CTA
<button className="cta-secondary bg-brand-cobalt text-brand-white">
```

### Key Messaging

```tsx
// Brand tagline
<h1 className="brand-tagline">EXPERIENCE THE BURN</h1>

// Services
<p className="brand-services">REFORMER, MAT PILATES, BOXING</p>

// CTA text
<button className="brand-cta">JOIN NOW</button>
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

<EssentialsCard variant="gradient">
  Gradient card with brand colors
</EssentialsCard>
```

## Animations

### Available Animations

- `animate-gentle-fade-in`: Smooth fade-in with slight upward movement
- `animate-warm-glow`: Warm bright orange glow effect for special elements
- `transition-all duration-300 hover:scale-105`: Subtle hover scale effect

### Usage

```tsx
<div className="animate-gentle-fade-in">
<Button className="animate-warm-glow">Special CTA</Button>
<div className="transition-all duration-300 hover:scale-105">
```

## Shadows

### Warm Shadow System

- `shadow-warm`: Standard warm-toned shadow using brand brown
- `shadow-warm-lg`: Larger warm shadow for featured elements
- `shadow-warm hover:shadow-warm-lg transition-shadow`: Interactive shadow

```tsx
<div className="bg-card shadow-warm hover:shadow-warm-lg rounded-xl p-6 transition-shadow">
  Interactive card with warm shadows
</div>
```

## Layout Patterns

### Hero Section

```tsx
<section className="from-brand-light-yellow via-background to-brand-nude relative overflow-hidden bg-gradient-to-br">
  <div className="from-brand-brown/5 to-brand-cobalt/5 absolute inset-0 bg-gradient-to-r"></div>
  <div className="container relative py-20 lg:py-32">
    <h1 className="text-brand-brown text-5xl font-semibold tracking-normal lg:text-7xl">
      Experience the Burn
      <span className="text-brand-bright-orange block">
        With Essentials Studio
      </span>
    </h1>
  </div>
</section>
```

### Content Cards

```tsx
<div className="bg-card border-border shadow-warm hover:shadow-warm-lg rounded-xl border p-6 transition-shadow">
  <h3 className="text-brand-brown mb-3 text-lg font-semibold">Card Title</h3>
  <p className="text-brand-brown/70 mb-4 font-light">
    Card content with proper opacity
  </p>
  <EssentialsButton variant="primary">Action Button</EssentialsButton>
</div>
```

### Feature Highlights

```tsx
<div className="from-brand-bright-orange/10 to-brand-cobalt/10 border-brand-nude rounded-xl border bg-gradient-to-br p-6">
  <h3 className="text-brand-brown mb-3 text-lg font-semibold">Featured Item</h3>
  <p className="text-brand-brown/70 mb-4 font-light">
    Special content with gradient background
  </p>
  <EssentialsButton variant="accent">Special Action</EssentialsButton>
</div>
```

## Best Practices

### Color Usage

1. **Primary Actions**: Use `brand-cobalt` for main CTAs and important highlights
2. **Text Hierarchy**: Use `brand-brown` with opacity variations (80%, 70%, 60%)
3. **Backgrounds**: Prefer `brand-light-yellow` as primary background
4. **Accents**: Use `brand-bright-orange` sparingly for high-impact elements
5. **Subtle Elements**: Use `brand-nude` and `brand-sage` for borders and backgrounds

### Typography Hierarchy

1. **Hero**: 5xl-7xl, semibold, `brand-brown` with `brand-bright-orange` accents
2. **Sections**: 3xl, semibold, `brand-brown`
3. **Cards**: lg-xl, semibold, `brand-brown`
4. **Body**: base, light weight, `brand-brown/80`
5. **Captions**: sm, light weight, `brand-brown/60`

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

- Background shifts to brand brown tones
- `brand-bright-orange` becomes the primary color
- `brand-cobalt` serves as the accent
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
import {
  EssentialsButton,
  EssentialsCard,
  essentialsTypography,
} from "@/components/essentials";
```

2. **Use brand colors**:

```tsx
<div className="bg-brand-brown text-brand-light-yellow">
<h1 className="text-brand-bright-orange">
<p className="text-brand-brown/80">
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

5. **Use key messaging**:

```tsx
<h1 className={essentialsTypography.tagline}>EXPERIENCE THE BURN</h1>
<p className={essentialsTypography.services}>REFORMER, MAT PILATES, BOXING</p>
<button className={essentialsTypography.cta}>JOIN NOW</button>
```

This design system gives you all the tools to create interfaces that match Essentials Studio's sophisticated, warm, and professional aesthetic while maintaining excellent usability and accessibility.
