import { Navbar } from "./_components/navbar";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container py-10">
          <div className="mx-auto max-w-3xl space-y-8 py-8">
            <h1 className="text-center text-4xl font-bold text-foreground">
              Welcome to Your App
            </h1>
            <p className="text-center text-muted-foreground">
              A modern application with a consistent theme across all components.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>

            {/* Color palette showcase */}
            <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-card-foreground">
                Theme Color Palette
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {/* Base colors */}
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-background border border-border"></div>
                  <p className="text-xs font-medium">Background</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-foreground"></div>
                  <p className="text-xs font-medium">Foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-card border border-border"></div>
                  <p className="text-xs font-medium">Card</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-card-foreground"></div>
                  <p className="text-xs font-medium">Card Foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-popover border border-border"></div>
                  <p className="text-xs font-medium">Popover</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-popover-foreground"></div>
                  <p className="text-xs font-medium">Popover Foreground</p>
                </div>

                {/* UI colors */}
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-primary"></div>
                  <p className="text-xs font-medium">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-primary-foreground"></div>
                  <p className="text-xs font-medium">Primary Foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-secondary"></div>
                  <p className="text-xs font-medium">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-secondary-foreground"></div>
                  <p className="text-xs font-medium">Secondary Foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-muted"></div>
                  <p className="text-xs font-medium">Muted</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-muted-foreground"></div>
                  <p className="text-xs font-medium">Muted Foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-accent"></div>
                  <p className="text-xs font-medium">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-accent-foreground"></div>
                  <p className="text-xs font-medium">Accent Foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-destructive"></div>
                  <p className="text-xs font-medium">Destructive</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-destructive-foreground"></div>
                  <p className="text-xs font-medium">Destructive Foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-border"></div>
                  <p className="text-xs font-medium">Border</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-input"></div>
                  <p className="text-xs font-medium">Input</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-ring"></div>
                  <p className="text-xs font-medium">Ring</p>
                </div>

                {/* Chart colors */}
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-[var(--chart-1)]"></div>
                  <p className="text-xs font-medium">Chart 1</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-[var(--chart-2)]"></div>
                  <p className="text-xs font-medium">Chart 2</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-[var(--chart-3)]"></div>
                  <p className="text-xs font-medium">Chart 3</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-[var(--chart-4)]"></div>
                  <p className="text-xs font-medium">Chart 4</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-md bg-[var(--chart-5)]"></div>
                  <p className="text-xs font-medium">Chart 5</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
