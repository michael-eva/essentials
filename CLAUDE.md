# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbo
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run preview` - Build and start production server

### Code Quality
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Lint and auto-fix issues
- `npm run typecheck` - Run TypeScript type checking
- `npm run check` - Run lint and typecheck together
- `npm run format:check` - Check code formatting with Prettier
- `npm run format:write` - Format code with Prettier

### Database Operations
Development database (.env.local):
- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:migrate` - Apply migrations to development database
- `npm run db:push` - Push schema directly (bypass migrations)
- `npm run db:studio` - Open Drizzle Studio

Production database (.env.prod):
- `npm run db:migrate:prod` - Apply migrations to production (with confirmation prompt)
- `npm run db:push:prod` - Push schema to production (with confirmation prompt)
- `npm run db:studio:prod` - Open Drizzle Studio for production

### PWA
- `npm run pwa:icons` - Generate PWA icons

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Authentication**: Supabase Auth
- **API**: tRPC for type-safe API calls
- **AI**: OpenAI integration for workout planning and personal trainer chat
- **Styling**: Tailwind CSS with shadcn/ui components
- **PWA**: Progressive Web App with push notifications
- **State Management**: TanStack Query (React Query) via tRPC

### Database Architecture
The database schema is defined in `src/drizzle/src/db/schema.ts`. Key entities:

- **Users**: Basic user information and auth
- **Onboarding**: User preferences, fitness level, goals, health considerations
- **Workout Plans**: AI-generated or manual workout plans with weekly schedules
- **Workouts**: Individual workouts (classes or custom workouts)
- **Workout Tracking**: User activity logging and progress tracking
- **Pilates Videos**: Video content with Mux integration
- **AI Chat**: Personal trainer conversations and interactions
- **Notifications**: Push notification system with user preferences

### Key Relationships
- Each `workout_plan` has multiple `weekly_schedule` entries
- Each `weekly_schedule` entry links to a specific `workout` for a specific week
- Users can track completed workouts via `workout_tracking`
- AI interactions are stored in `personal_trainer_interactions` and `ai_chat`

### Environment Configuration
The project uses dual environment setup:
- `.env.local` for development
- `.env.prod` for production

Required environment variables are validated in `src/env.js` using @t3-oss/env-nextjs.

### File Structure
- `/src/app` - Next.js App Router pages and components
- `/src/components` - Reusable UI components (shadcn/ui based)
- `/src/server/api` - tRPC routers and server-side logic
- `/src/services` - Business logic services (AI, notifications, etc.)
- `/src/drizzle` - Database schema, migrations, and queries
- `/src/lib` - Utility libraries (Supabase client, utils)
- `/src/hooks` - Custom React hooks

### API Structure
tRPC routers are organized by domain:
- `workout` - Workout CRUD and tracking
- `workoutPlan` - AI workout plan generation
- `onboarding` - User onboarding flow
- `auth` - Authentication helpers
- `personalTrainer` - AI chat functionality
- `myPt` - Personal trainer customization
- `notifications` - Push notification management

### AI Integration
The app integrates OpenAI for:
- Personalized workout plan generation based on user onboarding data
- Personal trainer chat functionality with context awareness
- Progress tracking and motivation

### Database Workflow
1. Make schema changes in `src/drizzle/src/db/schema.ts`
2. Generate migrations: `npm run db:generate`
3. Apply to development: `npm run db:migrate`
4. Test thoroughly
5. Deploy to production: `npm run db:migrate:prod`

### Component Conventions
- Use shadcn/ui components as base building blocks
- Follow the existing component structure in `/src/app/_components`
- Implement proper TypeScript typing
- Use Tailwind CSS for styling
- Follow the established naming conventions (PascalCase for components)

### Testing and Quality
Always run before committing:
1. `npm run check` (lint + typecheck)
2. `npm run format:check`
3. Test database migrations in development before applying to production

### Testing Commands
- `npm test` - Run all Jest tests
- `npm run test:e2e` - Run E2E tests with Puppeteer  
- `npm run test:watch` - Run tests in watch mode

## Claude Scratchpad System

### Available Scratchpads
The `/claude-scratch/` directory provides organized workspaces for experimentation and analysis:

- **`experiments/`** - Prototype new features, test different approaches, API experimentation
- **`analysis/`** - Code analysis, performance investigations, refactoring plans  
- **`planning/`** - Feature planning, architecture design, implementation roadmaps
- **`debugging/`** - Debug sessions, issue reproduction, test cases
- **`temp/`** - Quick notes, temporary files, draft ideas

### When to Use Scratchpads
Use scratchpads for:
- **Complex analysis** requiring multiple files or iterations
- **Feature exploration** with different approaches to compare
- **Debugging sessions** that need systematic investigation
- **Architecture planning** for major features or refactors
- **Prototyping** before final implementation

### Scratchpad Guidelines
1. **Organized exploration** - Use appropriate subdirectories for different work types
2. **Descriptive naming** - Include dates and task context in filenames
3. **Document findings** - Add notes about what works/doesn't work  
4. **Reference codebase** - Link to specific files, issues, or PRs when relevant
5. **Clean iteration** - Keep multiple approaches to compare solutions

### Example Usage
- "Can you analyze the Dashboard performance in a scratchpad and propose optimizations?"
- "Experiment with different WebSocket implementations for real-time features"
- "Debug the flaky Puppeteer tests systematically in a scratchpad"
- "Plan the social features architecture across multiple files"

See `/claude-scratch/USAGE_EXAMPLES.md` for detailed examples and workflows.