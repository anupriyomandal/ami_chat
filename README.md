# OpenChat

A minimal, production-ready ChatGPT clone powered by OpenRouter. Features email/password authentication, persistent conversation history, per-user API key overrides, and an admin dashboard — all backed by a single SQLite file.

## Features

- **Authentication**: Email + password with argon2id hashing, self-hosted sessions (no third-party auth)
- **Chat**: Streaming AI responses via OpenRouter with model selector, markdown rendering, and conversation history
- **API Keys**: Server default key with per-user encrypted key overrides (AES-256-GCM)
- **Admin Dashboard**: User management, usage analytics with charts, model allowlist
- **Design**: Neo-brutalist aesthetic (thick borders, no rounded corners, flat colors)
- **Deployment**: One-click Railway deploy with persistent SQLite volume

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

1. **Clone and install**:
   ```bash
   git clone <repo-url>
   cd openchat
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env.local
   ```

3. **Generate encryption secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Paste the output into `ENCRYPTION_SECRET` in `.env.local`.

4. **Add your OpenRouter API key**:
   - Get one from https://openrouter.ai/keys
   - Set `OPENROUTER_API_KEY=sk-or-...` in `.env.local`

5. **Initialize the database**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start the dev server**:
   ```bash
   npm run dev
   ```

7. **Create your account**:
   - Visit http://localhost:3000/signup
   - **The first user to sign up is automatically made admin**

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_PATH` | Path to SQLite file | `./openchat.db` (dev), `/data/openchat.db` (prod) |
| `OPENROUTER_API_KEY` | Default OpenRouter API key | `sk-or-...` |
| `ENCRYPTION_SECRET` | 32-byte base64 key for encrypting user API keys | Generate with `node -e "..."` |
| `NEXT_PUBLIC_APP_URL` | App URL for OpenRouter headers | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` or `production` |

## Railway Deployment

1. **Create a Railway project** and connect your GitHub repo

2. **Add a persistent volume**:
   - Go to your service → Volumes → Add Volume
   - Mount path: `/data`
   - Size: 1GB is plenty

3. **Set environment variables** in Railway:
   - `DATABASE_PATH=/data/openchat.db`
   - `OPENROUTER_API_KEY=sk-or-...`
   - `ENCRYPTION_SECRET=` (generate with command above)
   - `NEXT_PUBLIC_APP_URL=https://your-project.railway.app`

4. **Deploy** — Railway auto-detects the Dockerfile

5. **Run migrations** in Railway's terminal:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Sign up** — your first account becomes admin automatically

## Backup Instructions

- **Railway Volume Snapshots**: Railway automatically snapshots volumes. You can also manually snapshot from the dashboard.
- **Manual backup**: SSH into your Railway service and copy the DB:
  ```bash
  cp /data/openchat.db /data/openchat-backup-$(date +%Y%m%d).db
  ```
- **S3/R2 cron backup**: Set up a cron job to copy the DB to cloud storage:
  ```bash
  aws s3 cp /data/openchat.db s3://your-bucket/openchat-$(date +%Y%m%d).db
  ```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply migrations to database |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run db:seed` | Seed default models |
| `npm run db:cleanup` | Delete expired sessions |

## Architecture

### Database
Single SQLite file with Drizzle ORM. WAL mode enabled for concurrent reads. Foreign keys enforced.

### Auth
Lucia Auth v3 with argon2id password hashing. First signup becomes admin automatically. Session cookie is HTTP-only, Secure in prod, SameSite=Lax.

### Streaming
SSE-based streaming from OpenRouter directly to the client. Usage logged after stream completes. Auto-title generation after first exchange.

### Security
- Passwords hashed with argon2id
- User API keys encrypted with AES-256-GCM
- Login rate limiting (5 failures per IP per 15 min)
- Chat rate limiting (30 req/min per user)
- All queries filtered by authenticated user ID
- Admin verification server-side only

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: SQLite via better-sqlite3
- **ORM**: Drizzle ORM
- **Auth**: Lucia Auth v3 + argon2id
- **Styling**: Tailwind CSS v4 (neo-brutalist)
- **LLM**: OpenRouter API
- **Charts**: recharts
- **Markdown**: react-markdown + remark-gfm + rehype-highlight
- **Toasts**: sonner
