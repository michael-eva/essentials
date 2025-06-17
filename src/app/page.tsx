import { Navbar } from "./_components/navbar";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section - Essentials Studio Inspired */}
        <section className="relative bg-gradient-to-br from-brand-neutral-light via-background to-brand-neutral overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-warm-brown/5 to-brand-deep-blue/5"></div>
          <div className="container relative py-20 lg:py-32">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <div className="space-y-4 animate-gentle-fade-in">
                <h1 className="text-5xl font-bold tracking-tight text-brand-warm-brown lg:text-7xl">
                  Move, Energise,
                  <span className="text-brand-amber block">Empower</span>
                </h1>
                <p className="text-xl text-brand-warm-brown/80 max-w-2xl mx-auto leading-relaxed">
                  Experience the sophisticated energy of Essentials Studio with our
                  warm, premium aesthetic that balances professionalism with approachability.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <Button className="btn-primary text-lg px-8 py-4 shadow-warm-lg">
                  Get Started
                </Button>
                <Button variant="outline" className="text-lg px-8 py-4 border-brand-warm-brown text-brand-warm-brown hover:bg-brand-warm-brown hover:text-white">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Colors Showcase */}
        <section className="container py-16">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-semibold text-brand-warm-brown">
                Essentials Studio Color Palette
              </h2>
              <p className="text-brand-warm-brown/70 max-w-2xl mx-auto">
                Our sophisticated color system creates a warm, premium feel that differentiates
                from typical fitness branding while maintaining professionalism.
              </p>
            </div>

            {/* Primary Brand Colors */}
            <div className="space-y-8">
              <h3 className="text-xl font-medium text-brand-warm-brown">Primary Brand Colors</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group space-y-3">
                  <div className="h-24 rounded-xl bg-brand-warm-brown shadow-warm transition-transform hover:scale-105"></div>
                  <div className="space-y-1">
                    <p className="font-medium text-brand-warm-brown">Warm Brown</p>
                    <p className="text-sm text-brand-warm-brown/60">#705444 - Primary</p>
                    <code className="text-xs font-mono bg-brand-neutral px-2 py-1 rounded">brand-warm-brown</code>
                  </div>
                </div>

                <div className="group space-y-3">
                  <div className="h-24 rounded-xl bg-brand-deep-blue shadow-warm transition-transform hover:scale-105"></div>
                  <div className="space-y-1">
                    <p className="font-medium text-brand-warm-brown">Deep Blue</p>
                    <p className="text-sm text-brand-warm-brown/60">#3c5daa - Accent</p>
                    <code className="text-xs font-mono bg-brand-neutral px-2 py-1 rounded">brand-deep-blue</code>
                  </div>
                </div>

                <div className="group space-y-3">
                  <div className="h-24 rounded-xl bg-brand-amber shadow-warm transition-transform hover:scale-105 animate-warm-glow"></div>
                  <div className="space-y-1">
                    <p className="font-medium text-brand-warm-brown">Amber</p>
                    <p className="text-sm text-brand-warm-brown/60">#FFAB0C - CTA</p>
                    <code className="text-xs font-mono bg-brand-neutral px-2 py-1 rounded">brand-amber</code>
                  </div>
                </div>

                <div className="group space-y-3">
                  <div className="h-24 rounded-xl bg-brand-sand shadow-warm transition-transform hover:scale-105"></div>
                  <div className="space-y-1">
                    <p className="font-medium text-brand-warm-brown">Sand</p>
                    <p className="text-sm text-brand-warm-brown/60">#C9B59D - Light</p>
                    <code className="text-xs font-mono bg-brand-neutral px-2 py-1 rounded">brand-sand</code>
                  </div>
                </div>
              </div>
            </div>

            {/* System Colors */}
            <div className="space-y-8">
              <h3 className="text-xl font-medium text-brand-warm-brown">System Colors</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {[
                  { name: "Primary", class: "bg-primary", var: "primary" },
                  { name: "Secondary", class: "bg-secondary", var: "secondary" },
                  { name: "Accent", class: "bg-accent", var: "accent" },
                  { name: "Muted", class: "bg-muted", var: "muted" },
                  { name: "Card", class: "bg-card border border-border", var: "card" },
                  { name: "Background", class: "bg-background border border-border", var: "background" },
                ].map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div className={`h-16 rounded-lg ${color.class} shadow-sm`}></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-brand-warm-brown">{color.name}</p>
                      <code className="text-xs font-mono bg-brand-neutral px-1.5 py-0.5 rounded">{color.var}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Button Variants */}
            <div className="space-y-8">
              <h3 className="text-xl font-medium text-brand-warm-brown">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button className="btn-primary">Primary Action</Button>
                <Button className="btn-accent">Accent Action</Button>
                <Button className="btn-secondary">Secondary Action</Button>
                <Button variant="outline" className="border-brand-warm-brown text-brand-warm-brown hover:bg-brand-warm-brown">
                  Outline
                </Button>
                <Button variant="ghost" className="text-brand-warm-brown hover:bg-brand-warm-brown/10">
                  Ghost
                </Button>
              </div>
            </div>

            {/* Typography Showcase */}
            <div className="space-y-8">
              <h3 className="text-xl font-medium text-brand-warm-brown">Typography</h3>
              <div className="space-y-6 bg-card p-8 rounded-xl border border-border shadow-warm">
                <h1 className="text-brand-warm-brown">Heading 1 - Main Hero Text</h1>
                <h2 className="text-brand-warm-brown">Heading 2 - Section Titles</h2>
                <h3 className="text-brand-warm-brown">Heading 3 - Subsection Headers</h3>
                <h4 className="text-brand-warm-brown">Heading 4 - Component Titles</h4>
                <h5 className="text-brand-warm-brown">Heading 5 - Small Headers</h5>
                <h6 className="text-brand-warm-brown">Heading 6 - Micro Headers</h6>
                <p className="text-brand-warm-brown/80 leading-relaxed">
                  This is body text using the Space Grotesk font family. It maintains excellent
                  readability while providing a modern, sophisticated feel that aligns with the
                  Essentials Studio aesthetic. The warm brown color creates a premium, approachable tone.
                </p>
                <p className="text-sm text-brand-warm-brown/60">
                  Small text for captions and secondary information.
                </p>
                <code className="font-mono text-brand-deep-blue bg-brand-neutral px-2 py-1 rounded">
                  Code snippets use JetBrains Mono
                </code>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="space-y-8">
              <h3 className="text-xl font-medium text-brand-warm-brown">Interactive Elements</h3>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Card Example */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-warm hover:shadow-warm-lg transition-shadow">
                  <h4 className="text-lg font-semibold text-brand-warm-brown mb-3">Studio Card</h4>
                  <p className="text-brand-warm-brown/70 mb-4">
                    This card demonstrates the warm, sophisticated aesthetic with proper shadows and hover effects.
                  </p>
                  <Button className="btn-primary w-full">Join Class</Button>
                </div>

                {/* Feature Card */}
                <div className="bg-gradient-to-br from-brand-amber/10 to-brand-deep-blue/10 p-6 rounded-xl border border-brand-sand">
                  <h4 className="text-lg font-semibold text-brand-warm-brown mb-3">Featured Class</h4>
                  <p className="text-brand-warm-brown/70 mb-4">
                    Premium classes with gradient backgrounds and brand color integration.
                  </p>
                  <Button className="btn-accent w-full">Book Now</Button>
                </div>
              </div>
            </div>

            {/* Usage Examples */}
            <div className="space-y-8">
              <h3 className="text-xl font-medium text-brand-warm-brown">How to Use These Colors</h3>
              <div className="bg-card p-8 rounded-xl border border-border shadow-warm">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-brand-warm-brown">CSS Custom Properties</h4>
                    <div className="bg-brand-neutral p-4 rounded-lg">
                      <code className="text-sm font-mono text-brand-deep-blue block whitespace-pre-line">{`/* Use HSL values for dynamic theming */
--brand-warm-brown: 29 33% 33%;
--brand-amber: 38 100% 52%;

/* Apply in CSS */
background-color: hsl(var(--brand-warm-brown));
color: hsl(var(--brand-amber));`}</code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-brand-warm-brown">Tailwind Classes</h4>
                    <div className="bg-brand-neutral p-4 rounded-lg">
                      <code className="text-sm font-mono text-brand-deep-blue block whitespace-pre-line">{`{/* Direct brand color classes */}
<div className="bg-brand-warm-brown text-white">
<Button className="btn-primary">
<div className="text-brand-amber">

{/* System colors that adapt to theme */}
<div className="bg-primary text-primary-foreground">
<div className="bg-accent text-accent-foreground">`}</code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-brand-warm-brown">Best Practices</h4>
                    <ul className="space-y-2 text-brand-warm-brown/80">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-amber mt-2 flex-shrink-0"></span>
                        Use <code className="font-mono text-brand-deep-blue bg-brand-neutral px-1 rounded">brand-warm-brown</code> as your primary color for text and main UI elements
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-amber mt-2 flex-shrink-0"></span>
                        Use <code className="font-mono text-brand-deep-blue bg-brand-neutral px-1 rounded">brand-amber</code> for call-to-action buttons and important highlights
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-amber mt-2 flex-shrink-0"></span>
                        Use <code className="font-mono text-brand-deep-blue bg-brand-neutral px-1 rounded">brand-deep-blue</code> as a professional accent for secondary actions
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-amber mt-2 flex-shrink-0"></span>
                        Use <code className="font-mono text-brand-deep-blue bg-brand-neutral px-1 rounded">brand-sand</code> for subtle backgrounds and light accents
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
