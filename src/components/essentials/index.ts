export { EssentialsButton } from "./EssentialsButton";
export { EssentialsCard } from "./EssentialsCard";

// Color utility functions
export const essentialsColors = {
  warmBrown: "hsl(var(--brand-warm-brown))",
  deepBlue: "hsl(var(--brand-deep-blue))",
  amber: "hsl(var(--brand-amber))",
  sand: "hsl(var(--brand-sand))",
  warmBrownLight: "hsl(var(--brand-warm-brown-light))",
  warmBrownDark: "hsl(var(--brand-warm-brown-dark))",
  neutral: "hsl(var(--brand-neutral))",
  neutralLight: "hsl(var(--brand-neutral-light))",
};

// Typography classes for consistent styling
export const essentialsTypography = {
  hero: "text-5xl font-bold tracking-tight text-brand-warm-brown lg:text-7xl",
  title: "text-3xl font-semibold text-brand-warm-brown tracking-tight",
  subtitle: "text-xl font-medium text-brand-warm-brown",
  body: "text-brand-warm-brown/80 leading-relaxed",
  caption: "text-sm text-brand-warm-brown/60",
  code: "font-mono text-brand-deep-blue bg-brand-neutral px-2 py-1 rounded",
};

// Animation classes
export const essentialsAnimations = {
  fadeIn: "animate-gentle-fade-in",
  glow: "animate-warm-glow",
  hover: "transition-all duration-300 hover:scale-105",
};

// Shadow utilities
export const essentialsShadows = {
  warm: "shadow-warm",
  warmLg: "shadow-warm-lg",
  warmHover: "shadow-warm hover:shadow-warm-lg transition-shadow",
};
