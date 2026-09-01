<div align="center">

<img src="public/logo.svg" alt="Kafu" width="88" />

# كفوو · Kafu

**A self-hosted peer recognition app for any team.**

Give your colleagues a "كفو" (Saudi for *nicely done*), pick a badge,
and watch the leaderboard. Arabic-first, fully RTL,
and running with a single `docker compose up`.

<img src="https://img.shields.io/badge/license-MIT-14b8a6?style=flat-square" alt="MIT license" />
<img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
<img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" />
<img src="https://img.shields.io/badge/PostgreSQL-17-4169e1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 17" />
<img src="https://img.shields.io/badge/tests-45%20passing-16a34a?style=flat-square" alt="45 tests passing" />

<br />
<br />

<img src="docs/screenshots/inbox.png" width="900" alt="The Kafu inbox: colored recognition cards with badges, a monthly credit counter, and the sidebar" />

</div>

---

## Features

- **Send a kafu** — recognize a teammate with a badge (⚡ شقردي, 🔥 هب ريح, 🤝 فزعة, 💪 متعاون, 🎨 فنّان) and a note
- **Inbox** — every kafu you received, as colored cards, paginated
- **Leaderboard** — a 3D podium for the top 10 most-recognized people
- **5 kafus a month** — a monthly credit budget that resets, with a days-remaining counter
- **Admin panel** — delete kafus, deactivate/reactivate people, grant bonus credits
- **Arabic RTL UI** — designed in Arabic throughout, with the Baloo Bhaijaan 2 typeface

> The interface is entirely in Arabic. Nothing in the codebase is tied to a
> particular company — names, emails, departments and badges are all seed data
> you can replace.

## Screens

<div align="center">

<img src="docs/screenshots/leaderboard.png" width="880" alt="Leaderboard: a 3D podium for the top three, then ranked rows below" />

<sub><b>المتصدرون</b> — a 3D podium for the top three, ranked rows for the rest,<br />filterable by this month or all time.</sub>

<br />
<br />

<table>
<tr>
<td width="50%" align="center" valign="top">
<img src="docs/screenshots/send.png" alt="Send a kafu: pick a colleague, choose a badge, add a note" /><br />
<sub><b>أرسل كفو</b> — pick a colleague, choose one of<br />five badges, add an optional note.</sub>
</td>
<td width="50%" align="center" valign="top">
<img src="docs/screenshots/login.png" alt="Login screen" /><br />
<sub><b>تسجيل الدخول</b> — email and password, with<br />rate limiting on failed attempts.</sub>
</td>
</tr>
</table>

</div>

## Quick start

```bash
git clone https://github.com/<your-user>/kafu.git
cd kafu
cp .env.example .env          # then edit AUTH_SECRET
docker compose up --build -d
```

Seed the database with demo users:

```bash
docker compose exec app npx tsx scripts/seed.ts
```

The app is at **http://localhost:3011**.

To stop: `docker compose down` (add `-v` to also drop the database volume).

## Demo users

Created by `scripts/seed.ts`. Password for every account: `password123`.

| Name | Email | Department | Admin |
|------|-------|------------|-------|
| سارة الراشد | sarah@example.com | الهندسة | Yes |
| عمر خالد | omar@example.com | التصميم | Yes |
| فاطمة حسن | fatima@example.com | المنتجات | No |
| أحمد ناصر | ahmed@example.com | الهندسة | No |
| نورة السالم | noura@example.com | العمليات | No |
| خالد منصور | khalid@example.com | التصميم | No |
| ليلى إبراهيم | layla@example.com | المنتجات | No |
| يوسف التميمي | yousef@example.com | الهندسة | No |
| منى عبدالعزيز | mona@example.com | العمليات | No |
| طارق الحربي | tariq@example.com | الهندسة | No |

Edit the `employees` array in `scripts/seed.ts` to use your own team, or skip
seeding entirely and let people register at `/register`.

## Making it yours

| What | Where |
|------|-------|
| App name and page title | `app/layout.tsx`, `components/sidebar.tsx` |
| Logo and favicon | `public/logo.svg`, `public/logo-white.svg`, `public/favicon.svg` |
| Brand color (teal by default) | `--color-primary-*` in `app/globals.css` |
| Badge names, emoji and colors | `VALID_BADGES` in `lib/validations.ts`, then the badge maps in `app/(dashboard)/send/page.tsx`, `app/(dashboard)/inbox/page.tsx`, `app/(dashboard)/admin/page.tsx` and `components/ui/recognition-card.tsx` |
| Departments in the signup form | `departments` in `app/register/register-form.tsx` |
| Monthly credit allowance | `MONTHLY_CREDITS` in `app/api/me/credits/route.ts` |
| Demo/seed users | `scripts/seed.ts` |

## Configuration

Every setting has a working default for local development. Copy `.env.example`
to `.env` and override what you need.

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://kafu:kafu@db:5432/kafu` |
| `AUTH_SECRET` | Session encryption key — **must** be set in production | `dev-only-secret-change-me` |
| `AUTH_TRUST_HOST` | Trust the incoming host header | `true` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials | `kafu` |
| `APP_PORT` | Host port for the app | `3011` |
| `DB_PORT` | Host port for Postgres | `5445` |
| `ALLOWED_DEV_ORIGINS` | Extra dev-server origins, comma-separated | *(none)* |

Generate a real secret with `openssl rand -base64 32`.

## Local development (without Docker)

You still need a PostgreSQL instance — `docker compose up db -d` is the easiest.

```bash
npm install
export DATABASE_URL=postgresql://kafu:kafu@localhost:5445/kafu
npm run seed          # optional demo data
npm run dev           # http://localhost:3002
```

Other scripts: `npm run build`, `npm run lint`, `npm test`, `npm run test:watch`.

## Admin panel

Visible in the sidebar to any user with `is_admin = true`. Promote someone with:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'you@example.com';
```

It covers:

- **Kafus** — list every kafu as "from {name} ({dept}) to {name} ({dept})", search by name server-side, delete with a confirmation dialog, 30 per page
- **People** — list everyone with their current balance, search by name/email/department, filter by status, deactivate/reactivate, grant 1–5 bonus credits that expire after 30 days

Security notes: every admin route is guarded by `getAdminSessionOrThrow`, admins
cannot deactivate themselves, all queries are parameterized, and destructive
actions require confirmation.

## Architecture

```
app/
  (dashboard)/
    inbox/              # received kafus, paginated
    send/               # send a kafu, with badge picker
    leaderboard/        # top 10 podium
    admin/              # admin panel
    profile/[id]/       # a person's profile
  api/
    recognitions/       # kafu CRUD
    users/              # people list
    leaderboard/        # leaderboard data
    me/credits/         # current balance, incl. bonus credits
    me/recognitions/    # your kafus, paginated
    admin/...           # admin endpoints (recognitions, users, bonus-credits)
    health/             # liveness + DB check
  login/  register/     # auth pages
components/
  ui/                   # avatar, confirm-modal, empty-state, leaderboard-row, recognition-card
  layout/app-header.tsx # header with credit balance and days remaining
  sidebar.tsx           # navigation (admin link shown to admins)
lib/
  auth.ts               # NextAuth credentials provider
  auth.config.ts        # session config and public routes
  authorization.ts      # getSessionOrThrow / getAdminSessionOrThrow
  db.ts                 # PostgreSQL pool
  validations.ts        # Zod schemas
  rate-limit.ts         # login throttling (5 attempts / 15 min)
scripts/
  init.sql              # schema, run automatically by the Postgres container
  seed.ts               # demo data
tests/                  # Vitest unit and component tests
```

### Database

**users** — `id`, `name`, `email` (unique), `password_hash`, `department`, `avatar_url`, `is_active`, `is_admin`, timestamps

**recognitions** — `id`, `sender_id`, `receiver_id`, `credits` (1–5), `badge`, `message`, `created_at`; a check constraint blocks self-recognition

**bonus_credits** — `id`, `user_id`, `credits`, `granted_by`, `expires_at`, `created_at`

### Badges

| Badge | Emoji | Color |
|-------|-------|-------|
| شقردي | ⚡ | Amber |
| هب ريح | 🔥 | Red |
| فزعة | 🤝 | Sky |
| متعاون | 💪 | Green |
| فنّان | 🎨 | Purple |

### Leaderboard ranking

1. Total credits received, descending
2. Number of distinct recognitions, as a tiebreak
3. Earliest first kafu, as a final tiebreak

## Tech stack

Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · PostgreSQL 17 · NextAuth 5 (beta) · Zod 4 · Vitest 4

## Tests

```bash
npm test
```

Covering validation schemas, login rate limiting, authorization helpers, the
Tailwind class merger, and the Avatar / EmptyState / ConfirmModal components.

## License

[MIT](LICENSE).
