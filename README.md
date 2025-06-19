# Essentials Studio - AI-Powered Fitness App

Essentials Studio is a sophisticated fitness application that combines AI-powered workout planning with a premium, warm aesthetic inspired by high-end fitness studios. The app provides personalised workout plans, class booking, progress tracking, and an intuitive user experience designed to motivate and empower users on their fitness journey.

## 🏋️‍♀️ Features

- **AI-Powered Workout Planning**: Generate personalised 4-week workout plans based on user preferences, fitness level, and goals
- **Class Booking & Management**: Book and track Pilates classes and other fitness activities
- **Progress Tracking**: Monitor workout consistency, achievements, and progress toward fitness goals
- **User Onboarding**: Comprehensive onboarding flow to gather user preferences and health information
- **Mobile-First Design**: Responsive design optimised for mobile devices with Capacitor support
- **Real-time Notifications**: AI-generated motivational messages and workout reminders
- **Activity History**: Track completed workouts with detailed metrics and feedback

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Backend**: tRPC, Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI GPT-4 for workout plan generation
- **Mobile**: Capacitor for iOS/Android deployment
- **Email**: Resend for notifications
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database
- Supabase account
- OpenAI API key
- Resend API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd essentials
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/essentials"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"

   # Email (Resend)
   RESEND_API_KEY="your-resend-api-key"

   # Webhook (for future integrations)
   WEBHOOK_API_KEY="your-webhook-api-key"

   # User Role (optional)
   NEXT_PUBLIC_USER_ROLE="USER"
   ```

4. **Set up the database**

   ```bash
   # Generate database migrations
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Open Drizzle Studio to view/edit data
   npm run db:studio
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

### Database Setup

The app uses PostgreSQL with Drizzle ORM. The main tables include:

- `user`: User profiles and authentication
- `onboarding`: User onboarding data (fitness goals, preferences, health info)
- `workout_plan`: Generated workout plans
- `workout`: Individual workouts and classes
- `weekly_schedule`: Links workouts to specific weeks in plans
- `workout_tracking`: Completed workout records

### Mobile Development

To run the app on mobile devices:

```bash
# Build the app
npm run build

# Add mobile platforms
npx cap add ios
npx cap add android

# Sync web code to mobile
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── onboarding/        # User onboarding flow
│   └── _components/       # App-specific components
├── components/            # Reusable UI components
│   └── ui/               # Radix UI components
├── drizzle/              # Database schema and migrations
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── server/               # tRPC server setup
├── services/             # Business logic services
│   ├── personal-trainer.ts    # AI workout generation
│   ├── context-manager.ts     # User context building
│   ├── ai-chat.ts            # AI chat functionality
│   └── progress-tracker.ts    # Progress analysis
├── styles/               # Global styles
└── trpc/                 # tRPC client setup
```

## 🤖 AI Integration

The app uses OpenAI's GPT-4 to generate personalized workout plans. The AI considers:

- User fitness level and goals
- Health considerations and injuries
- Recent workout history and consistency
- Available Pilates classes and workout types
- User preferences for session length and frequency

### AI Services

- **Personal Trainer** (`src/services/personal-trainer.ts`): Generates workout plans
- **Context Manager** (`src/services/context-manager.ts`): Builds user context for AI
- **AI Chat** (`src/services/ai-chat.ts`): Handles user-AI conversations
- **Progress Tracker** (`src/services/progress-tracker.ts`): Analyzes user progress

## 🎨 Design System

The app features a sophisticated design system inspired by Essentials Studio:

- **Brand Colors**: Warm brown, deep blue, amber, and sand
- **Typography**: Space Grotesk for headings, JetBrains Mono for code
- **Components**: Custom Essentials components with warm shadows and animations
- **Responsive**: Mobile-first design with smooth transitions

See `DESIGN_SYSTEM.md` for detailed design guidelines.

## 📱 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Preview production build

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run typecheck        # TypeScript type checking
npm run format:check     # Check Prettier formatting
npm run format:write     # Format code with Prettier
```

## 🔧 Development Notes

### AI Workout Plan Generation

- Plans are generated as 4-week programs
- Each plan includes multiple workouts per week
- Workouts can be Pilates classes or other activities
- The AI considers user context and available classes

### Data Flow

1. User completes onboarding → Profile data stored
2. User requests workout plan → AI generates plan
3. Plan saved to database → Workouts and schedules created
4. User can book classes → Integration with booking system
5. User logs completed workouts → Progress tracked
6. AI analyzes progress → Provides recommendations

### Authentication

The app uses Supabase for authentication with protected routes. Users must complete onboarding before accessing the main dashboard.

## 🚧 TODO

- [ ] Implement route protection middleware
- [ ] Add comprehensive error handling
- [ ] Implement real-time notifications
- [ ] Add workout plan sharing features
- [ ] Enhance mobile app functionality
- [ ] Add analytics and reporting
- [ ] Implement social features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

For more information about the design system, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).
