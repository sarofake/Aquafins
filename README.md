# Aqua Fins — aquatic store template

A production-ready Next.js 15 storefront + admin panel for aquarium / aquatics
shops. Deploy it once per customer: each deployment gets its own Supabase
project, its own Cloudinary account and its own branding, all configured through
environment variables and the admin panel — no code edits required to rebrand.

- **Framework:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Database:** Supabase (Postgres + REST) — tables are created automatically
- **Images:** Cloudinary (admin uploads)
- **Hosting:** Vercel or Netlify

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
variables into the hosting dashboard (Vercel → *Settings → Environment
Variables*, Netlify → *Site configuration → Environment variables*).

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

**Vercel**

```bash
vercel --prod
```

`vercel.json` already sets the framework and build commands.

**Netlify**

```bash
netlify deploy --prod
```

`netlify.toml` configures `npm run build`, the Next.js runtime plugin and the
secret-scan exclusions (see *Notes* below).

Both platforms run the database migration automatically before the build
finishes — see the next section.

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

- **Netlify secret scanning:** `netlify.toml` omits three harmless keys
  (`AQUAFINS_ADMIN_ID`, `SUPABASE_DB_NAME`, `SUPABASE_DB_PORT`). Real secrets
  stay scanned. If Netlify still blocks a deploy, add the same list under
  *Site configuration → Build & deploy → Environment*.
- **Data caching:** public API responses are cached in-memory, at the CDN and in
  the browser. Branding edits reach visitors within about a minute.
- **Admin routes** are protected by middleware; `/api/health` is public.
