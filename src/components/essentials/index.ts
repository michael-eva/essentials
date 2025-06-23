export { EssentialsButton } from "./EssentialsButton";
export { EssentialsCard } from "./EssentialsCard";

// Color utility functions - Updated to match brand guidelines
export const essentialsColors = {
  brown: "hsl(var(--brand-brown))",
  lightYellow: "hsl(var(--brand-light-yellow))",
  cobalt: "hsl(var(--brand-cobalt))",
  brightOrange: "hsl(var(--brand-bright-orange))",
  nude: "hsl(var(--brand-nude))",
  sage: "hsl(var(--brand-sage))",
  black: "hsl(var(--brand-black))",
  white: "hsl(var(--brand-white))",
};

// Typography classes for consistent styling - Updated to match brand guidelines
export const essentialsTypography = {
  hero: "text-5xl font-semibold tracking-normal text-brand-brown lg:text-7xl",
  title: "text-3xl font-semibold text-brand-brown tracking-normal",
  subtitle: "text-xl font-semibold text-brand-brown tracking-normal",
  body: "text-brand-brown/80 leading-relaxed font-light",
  caption: "text-sm text-brand-brown/60 font-light",
  code: "font-mono text-brand-cobalt bg-brand-light-yellow px-2 py-1 rounded",
  tagline: "brand-tagline",
  services: "brand-services",
  cta: "brand-cta",
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
