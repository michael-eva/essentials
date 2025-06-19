# Essentials Studio - AI-Powered Fitness Platform

Essentials Studio is a sophisticated fitness platform that combines AI-powered workout planning with a premium, warm aesthetic inspired by high-end fitness studios. The platform provides personalized workout plans, class booking, progress tracking, and an intuitive user experience designed to motivate and empower users on their fitness journey.

## 🏋️‍♀️ What This App Does

**Essentials Studio** is a comprehensive fitness platform that:

- **🎯 AI-Powered Personalization**: Generates personalized 4-week workout plans using OpenAI GPT-4, considering your fitness level, goals, health conditions, and preferences
- **🧘‍♀️ Pilates-Focused**: Specializes in Pilates classes with supporting workouts to create a balanced fitness routine
- **📱 Cross-Platform**: Works seamlessly on web browsers and mobile devices (iOS/Android) using the same codebase
- **📊 Progress Tracking**: Monitors your workout consistency, achievements, and progress toward fitness goals
- **🎨 Premium Experience**: Features a sophisticated design system with warm, premium aesthetics that differentiate from typical fitness apps
- **🤖 Smart Recommendations**: AI analyzes your progress and provides personalized recommendations for continued improvement

## 🏗️ Project Structure

This is a **monorepo** containing three main applications:

```
essentials/
├── apps/
│   ├── web/          # Next.js web application
│   ├── api/          # tRPC API server
│   └── mobile/       # Capacitor mobile app (iOS/Android)
├── packages/         # Shared packages (if any)
└── config/          # Shared configuration
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Backend**: tRPC, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI GPT-4 for workout plan generation
- **Mobile**: Capacitor for iOS/Android deployment
- **Email**: Resend for notifications
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL database** (local or cloud)
- **Supabase account** (for authentication)
- **OpenAI API key** (for AI workout generation)
- **Resend API key** (for email notifications)

### Quick Start

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd essentials
   npm run install:all
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory:

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
   ```

3. **Set up the database**

   ```bash
   # Generate and run database migrations
   cd apps/web
   npm run db:generate
   npm run db:push
   ```

4. **Start development servers**

   ```bash
   # Start both web and API servers
   npm run dev
   ```

   This will start:

   - **Web app**: http://localhost:3000
   - **API server**: http://localhost:3001

## 📱 Mobile Development

### Running on iOS Simulator

```bash
# Build the web app and sync to mobile
npm run build:mobile

# Run on iOS simulator
npm run run:ios
```

### Running on Android

```bash
# Run on Android emulator
npm run run:android
```

### Development Mode (Live Reload)

For development with live reload on both web and mobile:

1. **Start the development servers**

   ```bash
   npm run dev
   ```

2. **Run mobile app** (it will load from the live dev server)
   ```bash
   cd apps/mobile
   npx cap run ios
   ```

The mobile app is configured to load content from your live Next.js development server, so changes you make to the web code will automatically appear in both the browser and mobile simulator.

## 🎯 Available Scripts

### Development

```bash
npm run dev              # Start web + API development servers
npm run dev:web          # Start only web development server
npm run dev:api          # Start only API development server
```

### Building

```bash
npm run build:web        # Build web app for production
npm run build:api        # Build API server
npm run build:mobile     # Build web app and sync to mobile
npm run build:ios        # Build for iOS
npm run build:android    # Build for Android
```

### Mobile

```bash
npm run open:ios         # Open iOS project in Xcode
npm run open:android     # Open Android project in Android Studio
npm run run:ios          # Run on iOS simulator
npm run run:android      # Run on Android emulator
```

### Database

```bash
cd apps/web
npm run db:generate      # Generate migrations
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio
```

## 🏗️ Architecture Overview

### Web Application (`apps/web/`)

- **Next.js 15** with App Router
- **Static export** configured for Capacitor compatibility
- **tRPC client** for type-safe API calls
- **Supabase Auth** integration
- **Responsive design** with Tailwind CSS

### API Server (`apps/api/`)

- **tRPC server** with type-safe endpoints
- **PostgreSQL** database with Drizzle ORM
- **OpenAI integration** for workout generation
- **Authentication middleware**

### Mobile App (`apps/mobile/`)

- **Capacitor** for native iOS/Android deployment
- **Same codebase** as web app
- **Native plugins** for device features
- **Live development** support

## 🤖 AI Features

The platform uses OpenAI GPT-4 to:

- **Generate personalized workout plans** based on user preferences and fitness level
- **Analyze workout history** to provide progress insights
- **Create motivational messages** and workout reminders
- **Recommend class modifications** based on user feedback

## 🎨 Design System

The app features a sophisticated design system with:

- **Warm, premium color palette** (browns, blues, amber)
- **Professional typography** (Space Grotesk, JetBrains Mono)
- **Smooth animations** and transitions
- **Mobile-first responsive design**
- **Accessible components** built with Radix UI

## 🔧 Development Workflow

### 🚀 Daily Development (Recommended)

**This is how you'll spend most of your development time:**

1. **Start development servers**

   ```bash
   npm run dev
   ```

   This starts both web and API servers:

   - **Web app**: http://localhost:3000
   - **API server**: http://localhost:3001

2. **In a new terminal, run mobile app**

   ```bash
   cd apps/mobile
   npx cap run ios
   ```

3. **Make code changes in `apps/web/src/`**
   - Edit components, pages, styles, etc.
   - Save the file
   - **Changes appear instantly in both:**
     - ✅ Web browser (hot reload)
     - ✅ Mobile simulator (live from dev server)

### 🎯 Key Benefits

- **Single codebase**: All changes in `apps/web/src/`
- **No manual syncing**: Mobile loads from live dev server
- **Instant feedback**: See changes on both platforms immediately
- **Hot reload**: Works on both web and mobile

### 📱 When You Need to Sync

You only need to sync when:

- Adding new Capacitor plugins (camera, notifications, etc.)
- Changing mobile-specific configuration
- Testing production builds

```bash
cd apps/mobile
npx cap sync
```

### 🏗️ Production Builds

For testing production builds or when you need native device features:

```bash
# Build and sync to mobile
npm run build:mobile

# Run mobile (loads from static build)
cd apps/mobile
npx cap run ios
```

### 💡 Pro Tips

- **Keep both terminals open** during development
- **Use browser dev tools** for quick debugging
- **Use mobile simulator** to test touch interactions
- **Same codebase** = consistent behavior across platforms

## 🚧 Current Status

- ✅ **Core functionality** implemented
- ✅ **AI workout generation** working
- ✅ **User onboarding** flow complete
- ✅ **Progress tracking** system active
- ✅ **Mobile app** running on iOS/Android
- 🔄 **Real-time notifications** in development
- 🔄 **Advanced analytics** planned

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both web and mobile
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

For detailed documentation on specific components, see:

- [Web App README](./apps/web/README.md)
- [Design System Guide](./apps/web/DESIGN_SYSTEM.md)
