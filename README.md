# Aqua Fins — aquatic store template

A production-ready Next.js 15 storefront + admin panel for aquarium / aquatics
shops. Deploy it once per customer: each deployment gets its own Supabase
project, its own Cloudinary account and its own branding, all configured through
environment variables and the admin panel — no code edits required to rebrand.

- **Framework:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Database:** Supabase (Postgres + REST) — tables are created automatically
- **Images:** Cloudinary (admin uploads)
- **Hosting:** Vercel — one project per deployment

---

## 1. Create the backing services

1. **Supabase** → create a project. Copy from *Project Settings → API*:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
2. From *Project Settings → Database → Connection string → Session pooler*, copy
   the full URI → `SUPABASE_DB_SESSION_URL`. This is what lets the app create
   tables on first deploy. (Password reset for the DB user is under
   *Database → Settings*; if you reset it, update this value.)
3. **Cloudinary** → copy cloud name, API key and API secret (needed for admin
   image uploads; the site still renders without them).

## 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the values, or paste the same
variables into the Vercel dashboard (*Project → Settings → Environment
Variables*). Add them for **Production**, **Preview** and **Development**; the
build runs the database migration, so the Supabase values must be present at
build time.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public read access |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Admin writes (server only) |
| `SUPABASE_DB_SESSION_URL` | yes | Migration runner (server/build only) |
| `AQUAFINS_ADMIN_ID` | yes | Admin login identity |
| `AQUAFINS_ADMIN_PASSWORD` | yes | Admin login password |
| `AQUAFINS_ADMIN_PASSWORD_2` | no | Second accepted password |
| `AQUAFINS_SESSION_SECRET` | yes | Signs the admin session cookie |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | no | Image uploads |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no | Image uploads |
| `MIGRATIONS_STRICT` | no | Set `true` to fail the build when the DB is unreachable |

## 3. Deploy

Vercel is the supported host. Each customer deployment is its own Vercel
project, connected to its own fork/copy of this repository and its own Supabase
and Cloudinary accounts.

**Option A — dashboard**

1. *Add New → Project* and import the repository.
2. Framework preset: **Next.js** (detected automatically).
3. Paste the environment variables from section 2.
4. Deploy, then add the customer's custom domain under *Settings → Domains*.

**Option B — CLI**

```bash
vercel link      # once, links this folder to the Vercel project
vercel --prod
```

`vercel.json` pins the framework and the build command (`npm run build`). Keep
that build command: plain `next build` would skip the `prebuild` hook and the
database migration with it.

Every platform build runs the database migration before the build finishes —
see the next section. Pushing to the linked branch redeploys automatically.

## 4. Database setup is automatic

On deploy the `prebuild` step (`tools/db-migrate.mjs`) connects with
`SUPABASE_DB_SESSION_URL` and:

- **Empty database** → creates all tables, policies, indexes and default rows.
- **Existing complete schema** → executes **nothing**; migrations are only
  recorded as applied.
- **Partially migrated database** → adds only the missing tables/columns.

Nothing is dropped or overwritten, and edited rows are never reset. The runner
is idempotent, serialised with a Postgres advisory lock, and also retried at
runtime through `instrumentation.js` if the build had no database access.

Check the result any time at:

```
GET /api/health
```

It returns the deployment status, per-table checks and the current site name —
never credentials.

## 5. Rebrand the deployment

Sign in at `/admin` with `AQUAFINS_ADMIN_ID` / `AQUAFINS_ADMIN_PASSWORD`, then
open **Dashboard → Site Info**. Everything below is stored in the database and
applied site-wide, with no redeploy:

- **Brand:** site name, tagline, description, logo, favicon → header, footer,
  page `<title>`, meta description, favicon, social previews
- **Contact:** phones, WhatsApp, email, address → header hotline, footer,
  order buttons
- **Social links:** Facebook, YouTube, Instagram, Threads, TikTok, X
- **Announcement bar**, currency, minimum order, business hours
- **Connections panel:** live green/red checks for the database and Cloudinary

Logos and favicons uploaded to Cloudinary are served directly; local images in
`public/` keep working as the fallback.

### What still lives in code

Long-form copy is template content and is edited in the repository:

- `lib/content/*.js` — about, delivery, how-to-buy, privacy policy, terms
- `context/LanguageContext.js` — UI strings, English + Bangla
- `public/` — static images referenced by those pages

## 6. Notes

- **Redeploy after changing environment variables.** Vercel only injects new
  values into a fresh build; after adding a Supabase/Cloudinary variable, use
  *Deployments → ⋯ → Redeploy*.
- **Data caching:** public API responses are cached in-memory, at the CDN and in
  the browser. Branding edits reach visitors within about a minute.
- **Admin routes** are protected by middleware; `/api/health` is public.
