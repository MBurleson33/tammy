# Automated Client Setup

`setup-client.js` automates steps 1–6 of the manual workflow in `SETUP.md`.
Run it once per new client and you'll have a live site, Supabase project,
and Vercel deployment — you'll still need to add photos and (later) the
client's domain.

## One-time setup

### 1. Mark this repo as a GitHub template
On GitHub: this repo → **Settings** → General → check **Template repository**.
Required for the "generate from template" API call to work.

### 2. Get a GitHub personal access token
GitHub → Settings (your profile, not the repo) → Developer settings →
Personal access tokens → Fine-grained tokens → Generate new token.
Grant it **Contents: Read and write** and **Administration: Read and write**
access, scoped to your account (or the org that owns the template repo).

### 3. Get a Supabase access token + find your org slug
Supabase dashboard → Account (bottom left) → Access Tokens → Generate new token.
Find your org slug in the URL when you're on your org's dashboard page:
`supabase.com/dashboard/org/<this-part-is-your-slug>/general`

### 4. Get a Vercel API token
Vercel dashboard → Account Settings → Tokens → Create Token.
If your projects live under a Vercel **team** rather than your personal
account, also grab the team ID from Team Settings → General.

### 5. Fill in the constants at the top of `setup-client.js`
```js
const TEMPLATE_OWNER = 'MBurleson33';
const TEMPLATE_REPO = 'tammy';
const SUPABASE_ORG_SLUG = '...'; // from step 3
const VERCEL_TEAM_ID = '';       // from step 4, if applicable
```

### 6. Create `schema.sql`
This script can run SQL against the new Supabase project, but I don't have
your actual table definitions (`testimonials`, `products`, `orders`,
`subscribers`, `messages`, `settings`) — only `seed_content_blocks.sql`.
Export your current schema (Supabase SQL Editor → a `select` against
`information_schema`, or `pg_dump --schema-only` via the connection string
in Project Settings → Database) and save it as `schema.sql` next to
`setup-client.js`. Without it, the script skips table creation and you'll
need to create them by hand for each new client, same as today.

## Running it

```bash
GITHUB_TOKEN=ghp_xxx \
SUPABASE_ACCESS_TOKEN=sbp_xxx \
VERCEL_TOKEN=xxx \
node setup-client.js path/to/new-client-config.js
```

`new-client-config.js` is exactly the file the setup form
(setup.treetopbusiness.com) already generates for each client — no
reformatting needed, the script reads `SITE_CONFIG` straight out of it.

Takes a few minutes (mostly waiting for the Supabase project to provision).
When it finishes, it prints the repo URL, Supabase dashboard link, Vercel
project name, and the admin login password it generated.

## What it does, step by step

1. Duplicates this repo via GitHub's "generate from template" API
2. Creates a new Supabase project and waits for it to become healthy
3. Runs `schema.sql` (if present) to create tables
4. Runs `seed_content_blocks.sql` to seed starter content
5. Writes a `config.js` into the new repo with the client's info + the new
   Supabase URL/anon key
6. Creates a Vercel project linked to the new repo, sets all required env
   vars, and generates a random admin password (also stored in the new
   project's `settings` table)

## What it still doesn't do

- **Upload photos.** They don't exist until the client sends them.
- **Connect a custom domain.** The client needs to own one first, and DNS
  is outside any of these APIs' reach until they do. Do this in Vercel →
  your new project → Domains once they have one.
- **Set `RESEND_API_KEY`.** If you're using one shared Resend account
  across all clients, set `SHARED_RESEND_API_KEY` as an env var before
  running the script and it'll get picked up automatically. Otherwise it's
  left as a placeholder you'll fill in per client.

## Important: this holds real credentials

`GITHUB_TOKEN`, `SUPABASE_ACCESS_TOKEN`, and `VERCEL_TOKEN` can create and
modify real infrastructure on your accounts. Don't commit them anywhere,
don't put them in a public-facing form, and treat them like passwords.
Running this as a local script (rather than wiring it into the public
setup form) is deliberate — see the tradeoffs discussion from when this
was built.

## I haven't been able to test this end-to-end

I built this from the current Supabase Management API, Vercel API, and
GitHub API docs, but couldn't actually run it in my environment (no
network access to those services from here). Try it on a low-stakes test
client first, and expect to debug a few rough edges — API error messages
will print inline if a step fails partway through.
