-- ─────────────────────────────────────────────────────
-- schema.sql
-- Run automatically by setup-client.js against a new client's
-- Supabase project (or run manually in the SQL editor).
-- Reconstructed from Tammy's live tables — see note below.
--
-- Reconstructed from Tammy's live tables. Note: the original orders RLS
-- policies exposed customer data to the public anon key — that's been
-- fixed below (orders is insert-only for anon; reads/updates/deletes go
-- through the service-key-only /api/admin-orders endpoint instead).
-- ─────────────────────────────────────────────────────

create table testimonials (
  id uuid default gen_random_uuid() primary key,
  quote text not null,
  name text not null,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  photo_url text,
  result text
);

create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subtitle text,
  tag text,
  description text,
  price integer not null,
  image_path text,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  feature_image_path text
);

create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  full_name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  country text default 'US'::text,
  items jsonb not null,
  order_total integer not null,
  notes text,
  status text default 'new'::text,
  payment_method text
);

create table subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  email text not null,
  source text default 'footer'::text
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  message text not null,
  read boolean default false
);

create table settings (
  key text primary key,
  value text not null
);

-- ── content_blocks (referenced throughout the site — created here
--    since setup-client.js runs schema.sql before seed_content_blocks.sql) ──
create table content_blocks (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  label text,
  value text not null,
  updated_at timestamptz default now()
);
alter table content_blocks enable row level security;
create policy "public read content_blocks" on content_blocks for select using (true);
create policy "admin write content_blocks" on content_blocks for all using (true) with check (true);

-- ── Row Level Security — copied from Tammy's live project, see warning above ──

alter table testimonials enable row level security;
create policy "Public can read testimonials" on testimonials for select using (true);
create policy "Admin full access testimonials" on testimonials for all using (true) with check (true);

alter table products enable row level security;
create policy "Public can read products" on products for select using (true);
create policy "Admin full access products" on products for all using (true) with check (true);

alter table orders enable row level security;
create policy "Public can insert orders" on orders for insert with check (true);
-- No SELECT/UPDATE/DELETE policy for anon/public — orders are only readable,
-- updatable, and deletable via the service_role key, through the
-- /api/admin-orders serverless endpoint. This was fixed after finding
-- Tammy's original policies exposed order data (names, emails, addresses)
-- to anyone holding the public anon key. See fix-orders-rls.sql for the
-- migration that corrected this on already-deployed projects.

alter table subscribers enable row level security;
create policy "public insert subscribers" on subscribers for insert with check (true);
create policy "admin read subscribers" on subscribers for select using (false);

alter table messages enable row level security;
create policy "public insert messages" on messages for insert with check (true);
create policy "admin read messages" on messages for select using (false);

alter table settings enable row level security;
create policy "service role access" on settings for all using (true) with check (true);
