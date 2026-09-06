# ResumeIQ — AI Resume Analyzer & Interview Prep Platform

A full-stack AI SaaS app: upload a CV, get AI-generated feedback and a score,
generate role-specific interview questions, chat with an AI career coach, and
subscribe via Stripe for unlimited usage.

## Features

- **AI Resume Analysis** — Upload PDF/TXT, get score (0-100), strengths, weaknesses, suggestions, extracted skills
- **Resume History** — View all previous analyses with scores, export to PDF
- **Interview Question Generator** — Role-specific behavioral & technical questions with tips
- **Interview History** — Browse past question sets, export to PDF
- **Career Coach Chat** — Persistent chat history with AI career coach
- **Dark Mode** — System preference detection, manual toggle, persisted in localStorage
- **OAuth Authentication** — Google and GitHub login support (optional)
- **Rate Limiting** — In-memory rate limiting on AI endpoints (10 req/min for AI, 5 req/min for auth)
- **Input Validation** — Zod schemas for all API endpoints
- **Toast Notifications** — Success/error/warning/info notifications
- **Error Boundaries** — Graceful error handling with development details
- **PDF Export** — Export resume analyses and interview questions as PDF
- **Health Checks** — `/api/health` endpoint for Docker/load balancer probes
- **Docker Support** — Multi-stage build, standalone output, health checks

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend:** Next.js API routes (Node.js)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (credentials + Google/GitHub OAuth)
- **AI:** OpenAI API (gpt-4o-mini for resume analysis, interview questions, chat)
- **Payments:** Stripe Checkout + webhooks (subscriptions)
- **Testing:** Jest + React Testing Library
- **Infra:** Docker + docker-compose, deployable to AWS ECS Fargate + RDS

## Project Structure

```
app/
  api/
    auth/[...nextauth]/route.ts   # NextAuth handler
    auth/register/route.ts        # Sign-up endpoint
    chat/route.ts                 # AI chat endpoint (GET history, POST message)
    health/route.ts               # Health check endpoint
    interview/generate/route.ts   # AI interview questions (GET history, POST generate)
    resume/analyze/route.ts       # Upload + AI resume analysis (GET history, POST analyze)
    stripe/checkout/route.ts      # Creates Stripe Checkout session
    stripe/webhook/route.ts       # Handles Stripe subscription events
  dashboard/
    chat/                         # Career coach chat page
    interview/                    # Interview generator + history
    resume/                       # Resume analyzer + history
  login/, register/, pricing/     # Public pages
components/
  ErrorBoundary.tsx              # Error boundary with dev details
  Navbar.tsx                     # Navigation with theme toggle
  ThemeProvider.tsx              # Dark mode context
  ThemeToggle.tsx                # Dark/light toggle button
  Toast.tsx                      # Toast notification system
  Skeleton.tsx                   # Loading skeleton components
lib/
  auth.ts                        # NextAuth configuration
  middleware/rate-limiter.ts     # In-memory rate limiter
  openai.ts                      # OpenAI client (lazy init)
  prisma.ts                      # Prisma client
  stripe.ts                      # Stripe client
  validation.ts                  # Zod schemas for all APIs
prisma/schema.prisma             # DB models
Dockerfile, docker-compose.yml
```

## 1. Local Setup

### Prerequisites

- Node.js 20+
- Docker (for Postgres) or a local Postgres instance
- An OpenAI API key
- A Stripe account (test mode is fine)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in real values
cp .env.example .env

# 3. Start Postgres (or point DATABASE_URL at your own instance)
docker compose up -d db

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start the dev server
npm run dev
```

Visit http://localhost:3000.

### Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `NEXTAUTH_URL` | App base URL (`http://localhost:3000` locally) |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `OPENAI_API_KEY` | From platform.openai.com |
| `STRIPE_SECRET_KEY` | From Stripe dashboard (test mode) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or Stripe dashboard webhook config |
| `STRIPE_PRO_PRICE_ID` | Price ID for your "Pro" recurring plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID (optional) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret (optional) |

### Testing Stripe Webhooks Locally

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## 2. Running with Docker (Full Stack)

```bash
cp .env.example .env   # fill in real values, set DATABASE_URL host to "db"
docker compose up --build
```

This starts Postgres and the Next.js app together. Run migrations once against the containerized DB:

```bash
docker compose exec app npx prisma migrate deploy
```

Health check endpoint: `http://localhost:3000/api/health`

## 3. Deploying to AWS

A simple, common path (ECS Fargate + RDS):

1. **Database:** Create an RDS PostgreSQL instance. Use its connection string as `DATABASE_URL`.
2. **Container registry:** Build and push the image:
   ```bash
   docker build -t ai-resume-platform .
   aws ecr create-repository --repository-name ai-resume-platform
   docker tag ai-resume-platform:latest <account>.dkr.ecr.<region>.amazonaws.com/ai-resume-platform:latest
   aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker push <account>.dkr.ecr.<region>.amazonaws.com/ai-resume-platform:latest
   ```
3. **Compute:** Create an ECS Fargate service (or App Runner, for less config) using that image, with the env vars from the table above set as task secrets (use AWS Secrets Manager for `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `NEXTAUTH_SECRET`).
4. **Networking:** Put the service behind an Application Load Balancer; point a domain at it via Route 53 + ACM for HTTPS.
5. **Migrations:** Run `npx prisma migrate deploy` as a one-off ECS task (or CI/CD step) against the RDS instance before each deploy.
6. **Stripe webhook:** Point your Stripe webhook endpoint at `https://yourdomain.com/api/stripe/webhook`.

For a faster first deploy without touching ECS directly, **AWS App Runner** or **AWS Amplify Hosting** can build straight from this repo/Dockerfile with far less setup, at the cost of some flexibility.

## 4. Subscription Logic

- New users get a `FREE` subscription row (3 resume analyses).
- `/api/resume/analyze` checks the plan and blocks a 4th analysis on `FREE`.
- `/api/stripe/checkout` creates a Stripe Checkout session for the `Pro` plan.
- `/api/stripe/webhook` listens for `checkout.session.completed` (upgrade) and `customer.subscription.deleted` (downgrade) to keep `Subscription.plan` in sync.

## 5. Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run test         # Run Jest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations
npm run prisma:studio   # Open Prisma Studio
```

## 6. Extending This

- Swap `gpt-4o-mini` for a different OpenAI model in `lib/openai.ts` depending on cost/quality needs.
- Replace in-memory rate limiter with Redis/Upstash for multi-instance deployments.
- Add a `PREMIUM` tier with higher limits, following the same pattern as `PRO`.
- Add email verification and password reset flows.
- Add admin dashboard for user management.