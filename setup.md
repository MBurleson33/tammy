# Setting Up a New Client Site

This repo is the template for Partner.Co distributor sites (originally built for
Tammy Maltby Melchisedeck / tammymelchisedeck.com). To spin up a new client's
site, duplicate this repo and follow the steps below — everything client-specific
lives in `config.js` and the Supabase `content_blocks` table, so the HTML/JS
files themselves should not need to change.

## Steps

1. **Duplicate this GitHub repo** for the new client (e.g. `MBurleson33/<client-name>`).

2. **Fill in `config.js`** at the repo root with the client's info — brand name,
   email, Venmo, PayPal, colors, fonts, images, social links. This is the file
   the setup form at setup.treetopbusiness.com generates from the client's
   onboarding submission; drop the generated file in here (or fill it in by hand).

3. **Create a new Supabase project** for the client. Copy its project URL and
   anon key into `config.js` under `supabase: { url, anonKey }`.

4. **Run `seed_content_blocks.sql`** (in this repo root) in the new project's
   Supabase SQL editor. This seeds the `content_blocks` table with generic
   starter copy for the homepage hero, About section, welcome letter, CTA
   strip, "Why It Works" benefits, and hormone symptom cards. The client edits
   all of this later through `admin.html` — no code changes needed.

   Also create the `testimonials`, `products`, `orders`, `subscribers`,
   `messages`, and `settings` tables (see Supabase schema notes / existing
   project as reference) and set the admin password in the `settings` table.

5. **Connect the repo to Vercel** and add the required env vars: `ADMIN_PASSWORD`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `NOTIFY_TO`, `NOTIFY_FROM`,
   `RESEND_API_KEY`.

6. **Add the client's custom domain** in Vercel once they have one ready.

7. **Upload the client's photos** to `/images/` in the repo — hero photo, about
   photo, product images — matching the filenames referenced in `config.js`.

## After launch

The client manages everything day-to-day through `admin.html`:
- **Testimonials** — add/edit/reorder/hide
- **Products** — prices, descriptions, images
- **Site Text** — hero copy, About section, welcome letter, CTA, product
  benefits, hormone symptom cards (all the `content_blocks` rows seeded in
  step 4)
- **Orders** — track status, email customers

## Known gaps / things to double check per client

- `seed_content_blocks.sql` was reconstructed from Tammy's live Supabase data
  (the original file was lost — not in the repo). If you add new content
  block keys going forward, update this file too so it stays in sync.
- Payment buttons in `order.html` only appear if `config.brand.paypal` and/or
  `.venmo` are filled in — no silent fallback to another client's accounts.
- `about.html`'s bio, credentials, and quote are Supabase `content_blocks`
  driven (see step 4) — until those rows are edited, the site shows visible
  placeholder text, not silently blank content.
