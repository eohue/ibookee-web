# IBOOKEE Website Renewal

## Overview

IBOOKEE (아이부키) is a social housing platform website for a Korean company that designs and operates community-focused affordable housing. The platform serves as a "Living Platform Archive" targeting three audiences: tenants (B2C), government agencies (B2G), and investors (B2B). The website showcases housing projects, community activities, business solutions, and company insights with a warm, human-centric design approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **UI Components**: Shadcn/UI component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for warm color palette and typography

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Development**: Hot module replacement via Vite middleware in development mode
- **Production**: Static file serving with SPA fallback

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Current Storage**: In-memory storage implementation (`MemStorage`) as a fallback when database is not configured
- **Migrations**: Drizzle Kit for schema migrations stored in `/migrations`

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components (layout, home sections, shadcn/ui)
    pages/        # Route-level page components
    hooks/        # Custom React hooks
    lib/          # Utility functions and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer
  vite.ts         # Vite dev server integration
shared/           # Shared code between client and server
  schema.ts       # Drizzle database schema and Zod validation
```

### Data Models
- **Projects**: Housing project portfolios with categories (youth, single, social-mix, local-anchor)
- **Inquiries**: Contact form submissions with types (move-in, business, recruit)
- **Articles**: Insight content with categories (column, media, library)
- **Community Posts**: Social feed content from community activities
- **Events**: Community event listings
- **Users**: Basic user authentication support

### Design System
- Magazine-style editorial layout inspired by Airbnb and Medium
- Warm color palette with HSL-based CSS variables supporting light/dark themes
- Korean-first typography with Noto Sans KR and Inter for Latin characters
- Mobile-first responsive design with Tailwind breakpoints

## External Dependencies

### Core Services
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migration and schema management via `db:push` command

### Third-Party Libraries
- **Radix UI**: Accessible component primitives for all interactive UI elements
- **Embla Carousel**: Image carousel functionality
- **React Hook Form + Zod**: Form handling with schema validation
- **date-fns**: Date formatting utilities

### Planned Integrations
- **Instagram API**: Social media feed aggregation for community section (referenced in design documents but not yet implemented)
- **Email Service**: Contact form notifications (backend prepared but not connected)