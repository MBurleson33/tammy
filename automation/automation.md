# Automated Client Setup

`setup-client.js` automates steps 1–6 of the manual workflow in `SETUP.md`.
Run it once per new client and you'll have a live site, Supabase project,
and Vercel deployment — you'll still need to add photos and (later) the
client's domain.

## One-time setup

### 1. Mark this repo as a GitHub template
On GitHub: this repo → **Settings** → General → check **Template repository**.
Required for the "generate from template" API call to work.

Also make sure `api/admin-orders.js` is committed to this repo before
running the script on any new client — it's what lets `admin.html` manage
orders securely (see the RLS note under step 6). Since the script just
duplicates whatever's in the template repo, any new client automatically
gets this file too, as long as it's here first.

### 2. Get a GitHub personal access token
Use a **classic** token, not fine-grained — fine-grained tokens can't create
new repositories under a personal (non-organization) account at all, since
the "Administration" permission that grants repo creation only exists when
the token's resource owner is an organization. (Ask me if you want the
longer explanation — it's a real GitHub limitation, not a config mistake.)

GitHub → your profile icon → Settings → Developer settings → Personal
access tokens → **Tokens (classic)** → Generate new token (classic).
Name it, set an expiration, and check the top-level **`repo`** scope
(this auto-selects everything under it). That's the only scope needed.

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

### 6. `schema.sql` — already done
This is included in this folder now, reconstructed from Tammy's live tables
(`testimonials`, `products`, `orders`, `subscribers`, `messages`, `settings`,
`content_blocks`). It also has a fix baked in: the original `orders` table
had RLS policies that let anyone with the public anon key read/edit/delete
customer orders — `schema.sql` now creates `orders` as insert-only for the
anon key, with reads/updates/deletes only possible through the service key
(via `/api/admin-orders`, in the main repo). New clients set up with this
script get the corrected version from the start — no separate fix needed
the way Tammy's live project required.

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
