# 🏋️‍♀️ Essentials Studio - AI-Powered Fitness Platform

Essentials Studio is a sophisticated fitness platform that combines AI-powered workout planning with a premium, warm aesthetic inspired by high-end fitness studios. The platform provides personalized workout plans, class booking, progress tracking, and an intuitive user experience designed to motivate and empower users on their fitness journey.

## 🎯 What This App Does

**Essentials Studio** is a comprehensive fitness platform that:

- **🤖 AI-Powered Personalization**: Generates personalized 4-week workout plans using OpenAI GPT-4, considering your fitness level, goals, health conditions, and preferences
- **🧘‍♀️ Pilates-Focused**: Specializes in Pilates classes with supporting workouts to create a balanced fitness routine
- **📱 Cross-Platform**: Works seamlessly on web browsers and mobile devices (iOS/Android) using the same codebase
- **📊 Progress Tracking**: Monitors your workout consistency, achievements, and progress toward fitness goals
- **🎨 Premium Experience**: Features a sophisticated design system with warm, premium aesthetics that differentiate from typical fitness apps
- **🤖 Smart Recommendations**: AI analyzes your progress and provides personalized recommendations for continued improvement

## 🏗️ Project Architecture (Refactored Monorepo)

This is a **modern monorepo** with clean separation of concerns:

```
essentials/
├── apps/
│   ├── web/          # Next.js frontend application
│   ├── api/          # Express + tRPC backend server
│   └── mobile/       # Capacitor mobile app (iOS/Android)
├── packages/         # 🆕 Shared business logic packages
│   ├── services/     # 🆕 Core business logic (AI, context, progress)
│   ├── database/     # Database schema and queries
│   ├── trpc/         # tRPC configuration and procedures
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
└── config/           # Shared configuration
```

### 🔧 **Key Architecture Benefits:**
- ✅ **Zero code duplication** - Business logic shared across apps
- ✅ **Type-safe APIs** - End-to-end TypeScript safety
- ✅ **Clean separation** - Frontend/backend completely separated for Capacitor
- ✅ **Scalable structure** - Easy to add new platforms or services

## 🛠️ Tech Stack

### **Frontend (apps/web/)**
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS 4** + Radix UI components
- **tRPC client** for type-safe API calls
- **TanStack Query** for state management

### **Backend (apps/api/)**
- **Express** server with **tRPC**
- **PostgreSQL** with **Drizzle ORM**
- **Supabase Auth** integration
- **OpenAI GPT-4** for AI features
- **Resend** for email notifications

### **Mobile (apps/mobile/)**
- **Capacitor** for native iOS/Android
- **Same codebase** as web app
- **Native plugins** for device features

### **Shared Packages (packages/)**
- **services/** - Core business logic (AI, context management, progress tracking)
- **database/** - Database schema and queries
- **trpc/** - API procedures and routing
- **types/** - TypeScript type definitions

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL database** (local or cloud)
- **Supabase account** (for authentication)
- **OpenAI API key** (for AI workout generation)
- **Resend API key** (for email notifications)

### 1. Clone and Install

```bash
git clone <repository-url>
cd essentials

# Install all dependencies across the monorepo
npm run install:all
```

This installs dependencies for:
- Root workspace
- All packages (types, database, services, trpc)
- All apps (web, mobile, api)

### 2. Environment Variables

Create a `.env` file in the **root directory**:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/essentials"

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# OpenAI for AI Features
OPENAI_API_KEY="your-openai-api-key"

# Email Notifications
RESEND_API_KEY="your-resend-api-key"

# Development
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Navigate to the app with database access
cd apps/api

# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open database studio
npm run db:studio
```

### 4. Build Shared Packages

**Important:** Build shared packages before starting development:

```bash
# Return to root and build all shared packages
cd ../..
npm run build:packages
```

This builds in the correct dependency order:
1. `types` - TypeScript definitions
2. `database` - Database schema and queries  
3. `services` - Core business logic
4. `trpc` - API procedures

### 5. Start Development

```bash
# Start both web and API development servers
npm run dev
```

This starts:
- **Web app**: http://localhost:3000
- **API server**: http://localhost:3001 (with /trpc endpoint)

## 🔧 Development Workflow

### 🚀 **Daily Development (Recommended)**

**This is your typical development flow:**

```bash
# Terminal 1: Start development servers
npm run dev

# Terminal 2: Run mobile app (loads from dev server)
cd apps/mobile
npx cap run ios
```

### 📝 **Making Changes:**

#### **Frontend Changes** (`apps/web/src/`):
- Edit React components, pages, styles
- Changes appear instantly in both web and mobile
- Hot reload works automatically

#### **Backend Changes** (`apps/api/src/`):
- Edit API routes, database queries, services
- Server restarts automatically
- Both web and mobile get updated API

#### **Shared Logic Changes** (`packages/services/src/`):
- Edit AI services, business logic, utilities
- Run `npm run build:services` to rebuild
- Restart `npm run dev` to see changes

### 📱 **Mobile Development:**

#### **Live Development (Recommended):**
```bash
# Mobile loads from live dev server (localhost:3000)
cd apps/mobile
npx cap run ios
```

#### **Production Testing:**
```bash
# Build web app and sync to mobile
npm run build:mobile

# Run mobile with static build
cd apps/mobile
npx cap run ios
```

## 📋 Available Scripts

### **Development:**
```bash
npm run dev              # Start web + API servers
npm run dev:web          # Start only web app
npm run dev:api          # Start only API server
```

### **Building:**
```bash
npm run build:packages   # Build all shared packages (required first)
npm run build:web        # Build web app
npm run build:api        # Build API server
npm run build:mobile     # Build web + sync to mobile
npm run build:ios        # Build for iOS
npm run build:android    # Build for Android
```

### **Deployment:**
```bash
npm run deploy:api       # Deploy API to Vercel
npm run deploy:web       # Deploy web to Vercel
npm run deploy:all       # Deploy both API and web
```

### **Mobile:**
```bash
npm run open:ios         # Open iOS project in Xcode
npm run open:android     # Open Android project in Android Studio
npm run run:ios          # Run on iOS simulator
npm run run:android      # Run on Android emulator
```

### **Database (from apps/api/):**
```bash
cd apps/api
npm run db:generate      # Generate migrations
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio
```

### **Package Management:**
```bash
npm run install:all      # Install all dependencies across monorepo
```

## 🏗️ **Build Dependencies**

**Important:** Packages must be built in this order:

```
1. types     → TypeScript definitions
2. database  → Schema + queries  
3. services  → Business logic (depends on types, database)
4. trpc      → API procedures (depends on services)
5. apps      → Web/API apps (depend on all packages)
```

The `npm run build:packages` script handles this automatically.

## 🤖 AI Features

The platform uses **OpenAI GPT-4** to:

- **Generate personalized workout plans** based on user preferences, fitness level, and health conditions
- **Create motivational chat responses** using user context and workout history
- **Analyze workout progress** and provide insights
- **Generate push notifications** with personalized encouragement
- **Recommend workout modifications** based on user feedback

All AI logic is centralized in `packages/services/src/` for consistency across platforms.

## 🎨 Design System

The app features a sophisticated design system with:

- **Warm, premium color palette** (browns, blues, amber)
- **Professional typography** (Space Grotesk, JetBrains Mono)
- **Smooth animations** and micro-interactions
- **Mobile-first responsive design**
- **Accessible components** built with Radix UI
- **Capacitor-optimized** layouts and navigation

## 🚀 Deployment

### **Separate Frontend/Backend (Capacitor Compatible):**

The architecture supports **separate deployments**:

#### **Backend API** (Vercel):
```bash
cd apps/api
vercel --prod
```

#### **Frontend Web** (Vercel):
```bash
cd apps/web
vercel --prod
```

#### **Mobile Apps**:
- **iOS**: Build and deploy to App Store
- **Android**: Build and deploy to Google Play Store

Both mobile apps consume the deployed web frontend and API.

## 🚧 Current Status

- ✅ **Refactored monorepo** architecture with shared services
- ✅ **Core functionality** implemented and working
- ✅ **AI workout generation** using GPT-4
- ✅ **User onboarding** and profile management
- ✅ **Progress tracking** and analytics
- ✅ **Mobile app** running on iOS/Android
- ✅ **Separate deployments** configured for Vercel
- 🔄 **Real-time notifications** in development
- 🔄 **Advanced analytics** planned

## 🛠️ Troubleshooting

### **Build Issues:**
```bash
# Clean all build artifacts
find . -name "dist" -type d -exec rm -rf {} +
find . -name ".next" -type d -exec rm -rf {} +

# Reinstall dependencies
npm run install:all

# Rebuild packages
npm run build:packages
```

### **Mobile Issues:**
```bash
# Sync Capacitor
cd apps/mobile
npx cap sync

# Check mobile configuration
npx cap doctor
```

### **Database Issues:**
```bash
cd apps/api
npm run db:push     # Push schema changes
npm run db:studio   # Visual database browser
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Build packages: `npm run build:packages`
4. Make your changes in the appropriate app or package
5. Test on both web and mobile: `npm run dev`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Submit a pull request

## 📄 License

This project is private and proprietary.

---

### 📚 **Next Steps:**

1. **Start Development**: `npm run install:all && npm run build:packages && npm run dev`
2. **Run Mobile**: `cd apps/mobile && npx cap run ios`
3. **Make Changes**: Edit files in `apps/web/src/` and see them instantly
4. **Deploy**: Use `npm run deploy:all` when ready

**Need help?** Check the individual app READMEs or the deployment guide in the artifacts above! 🚀