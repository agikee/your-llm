# Your LLM

AI-powered personal context generation platform. Discover your unique traits and generate context that makes AI interactions more personalized.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see .env.local.example)
cp .env.local.example .env.local

# Set up database
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Required in `.env.local`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL connection (for Prisma) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | Google Gemini API key for LLM calls |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js 14 App                      │
├─────────────────────────────────────────────────────────┤
│  Pages                                                  │
│  ├── /              → Landing page                      │
│  ├── /discover      → Guided discovery conversation     │
│  ├── /compare       → Before/after AI comparison        │
│  └── /dashboard     → User's saved contexts             │
├─────────────────────────────────────────────────────────┤
│  API Routes                                             │
│  ├── /api/auth/*    → Supabase authentication           │
│  ├── /api/discovery → Discovery conversation (LLM)      │
│  ├── /api/compare   → Context comparison (LLM)          │
│  └── /api/context/* → CRUD for user contexts            │
├─────────────────────────────────────────────────────────┤
│  Services                                               │
│  ├── Gemini API     → LLM for discovery & generation    │
│  ├── Supabase Auth  → User authentication               │
│  └── PostgreSQL     → Persistent storage (Prisma)       │
└─────────────────────────────────────────────────────────┘
```

### Key Directories

| Path | Purpose |
|------|---------|
| `app/` | Next.js app router pages and API routes |
| `components/` | React components (UI, discovery, layout) |
| `lib/` | Utilities, validations, AI clients |
| `prisma/` | Database schema and migrations |

### Data Flow

1. **Discovery** → User answers guided questions → LLM extracts structured data → Saved to database
2. **Context Generation** → Discovery data → LLM generates personality/expertise/goals contexts
3. **Compare** → User question + context → Two LLM calls (with/without context) → Side-by-side comparison

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run Vitest tests |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Supabase Auth
- **LLM**: Google Gemini API
- **Testing**: Vitest
- **Analytics**: Vercel Analytics

## Documentation

- [TASKS.md](./TASKS.md) - Implementation progress tracker
- [product-brief.md](./product-brief.md) - Original product vision

## Deployment

Deployed on Vercel. Push to `main` branch triggers automatic deployment.

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```
