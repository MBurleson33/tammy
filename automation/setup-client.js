#!/usr/bin/env node
/**
 * setup-client.js
 * ─────────────────────────────────────────────────────
 * Automates the Partner.Co client site setup workflow:
 *   1. Duplicate the template GitHub repo
 *   2. Create a new Supabase project
 *   3. Run schema.sql + seed_content_blocks.sql against it
 *   4. Fill in config.js with the client's info + new Supabase creds,
 *      commit it into the new repo
 *   5. Create the Vercel project, linked to the new repo, with env vars set
 *
 * NOT automated (can't be — see SETUP.md):
 *   - Uploading the client's real photos
 *   - Connecting a custom domain (needs the client to own one first)
 *
 * ─────────────────────────────────────────────────────
 * USAGE
 *
 *   GITHUB_TOKEN=ghp_xxx \
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx \
 *   VERCEL_TOKEN=xxx \
 *   node setup-client.js path/to/client-config.js
 *
 * client-config.js is the exact file the setup form
 * (setup.treetopbusiness.com) generates — this script reads
 * SITE_CONFIG straight out of it, no reformatting needed.
 *
 * Requires Node 18+ (uses built-in fetch). No npm install needed.
 * ─────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

// ─── EDIT THESE FOR YOUR SETUP ───────────────────────────
const TEMPLATE_OWNER = 'MBurleson33';
const TEMPLATE_REPO = 'tammy'; // must be marked "Template repository" in GitHub repo settings first
const SUPABASE_ORG_SLUG = 'YOUR_SUPABASE_ORG_SLUG'; // find at supabase.com/dashboard/org/_/general
const SUPABASE_REGION = 'us-east-1'; // or your preferred region
const VERCEL_TEAM_ID = ''; // leave blank if not using a Vercel team
// Path to schema.sql (table definitions) — you'll need to create this;
// see the note in SETUP.md. Script will skip table creation if missing.
const SCHEMA_SQL_PATH = path.join(__dirname, 'schema.sql');
// Points at the repo root, not this folder — seed_content_blocks.sql is the
// canonical copy referenced by SETUP.md and edited (rarely) at the template
// level. Keeping only one copy avoids it silently drifting out of sync.
const SEED_SQL_PATH = path.join(__dirname, '..', 'seed_content_blocks.sql');
// ──────────────────────────────────────────────────────────

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

function fail(msg) {
  console.error('\n✖ ' + msg);
  process.exit(1);
}

function log(msg) {
  console.log('\n→ ' + msg);
}

if (!GITHUB_TOKEN) fail('Missing GITHUB_TOKEN env var.');
if (!SUPABASE_ACCESS_TOKEN) fail('Missing SUPABASE_ACCESS_TOKEN env var.');
if (!VERCEL_TOKEN) fail('Missing VERCEL_TOKEN env var.');

const configPath = process.argv[2];
if (!configPath) fail('Usage: node setup-client.js path/to/client-config.js');
if (!fs.existsSync(configPath)) fail('File not found: ' + configPath);

// ── Load SITE_CONFIG out of the client's config.js without eval() risk to this process ──
function loadSiteConfig(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: filePath });
  if (!sandbox.SITE_CONFIG) fail('Could not find SITE_CONFIG in ' + filePath);
  return sandbox.SITE_CONFIG;
}

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function githubRequest(method, urlPath, body) {
  const res = await fetch('https://api.github.com' + urlPath, {
    method,
    headers: {
      'Authorization': 'Bearer ' + GITHUB_TOKEN,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) fail(`GitHub API error (${res.status}) on ${method} ${urlPath}: ${JSON.stringify(data)}`);
  return data;
}

async function supabaseRequest(method, urlPath, body) {
  const res = await fetch('https://api.supabase.com' + urlPath, {
    method,
    headers: {
      'Authorization': 'Bearer ' + SUPABASE_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) fail(`Supabase API error (${res.status}) on ${method} ${urlPath}: ${JSON.stringify(data)}`);
  return data;
}

async function vercelRequest(method, urlPath, body) {
  const qs = VERCEL_TEAM_ID ? (urlPath.includes('?') ? '&' : '?') + 'teamId=' + VERCEL_TEAM_ID : '';
  const res = await fetch('https://api.vercel.com' + urlPath + qs, {
    method,
    headers: {
      'Authorization': 'Bearer ' + VERCEL_TOKEN,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) fail(`Vercel API error (${res.status}) on ${method} ${urlPath}: ${JSON.stringify(data)}`);
  return data;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  const siteConfig = loadSiteConfig(configPath);
  const clientName = siteConfig.brand && siteConfig.brand.name;
  if (!clientName) fail('client-config.js is missing brand.name');
  const repoSlug = slugify(clientName);

  console.log(`\n=========================================`);
  console.log(`Setting up: ${clientName}  (repo: ${repoSlug})`);
  console.log(`=========================================`);

  // ── 1. Duplicate the GitHub repo from template ──
  log('Creating GitHub repo from template...');
  const repo = await githubRequest('POST', `/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/generate`, {
    owner: TEMPLATE_OWNER,
    name: repoSlug,
    description: `${clientName} — Partner.Co distributor site`,
    include_all_branches: false,
    private: true,
  });
  console.log(`  ✓ Repo created: ${repo.html_url}`);

  // ── 2. Create the Supabase project ──
  log('Creating Supabase project (this takes a minute or two)...');
  const dbPassword = crypto.randomBytes(18).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
  const project = await supabaseRequest('POST', '/v1/projects', {
    name: repoSlug,
    organization_slug: SUPABASE_ORG_SLUG,
    db_pass: dbPassword,
    region_selection: { type: 'specific', code: SUPABASE_REGION },
  });
  const projectRef = project.ref;
  console.log(`  ✓ Project created: ${projectRef} — waiting for it to become active...`);

  // Poll until healthy (Supabase projects take a minute or two to provision)
  let healthy = false;
  for (let i = 0; i < 40; i++) {
    await sleep(15000);
    const status = await supabaseRequest('GET', `/v1/projects/${projectRef}`);
    process.stdout.write('.');
    if (status.status === 'ACTIVE_HEALTHY') { healthy = true; break; }
  }
  if (!healthy) fail('Supabase project did not become healthy in time — check the dashboard manually.');
  console.log('\n  ✓ Supabase project is active');

  // ── 3. Get the anon key ──
  log('Fetching Supabase API keys...');
  const apiKeys = await supabaseRequest('GET', `/v1/projects/${projectRef}/api-keys`);
  const anonKeyEntry = Array.isArray(apiKeys) ? apiKeys.find((k) => k.name === 'anon') : null;
  const anonKey = anonKeyEntry ? anonKeyEntry.api_key : null;
  const serviceKeyEntry = Array.isArray(apiKeys) ? apiKeys.find((k) => k.name === 'service_role') : null;
  const serviceKey = serviceKeyEntry ? serviceKeyEntry.api_key : null;
  if (!anonKey || !serviceKey) fail('Could not retrieve anon/service_role keys — check the project dashboard manually.');
  const supabaseUrl = `https://${projectRef}.supabase.co`;
  console.log('  ✓ Keys retrieved');

  // ── 4. Run schema.sql (tables) if present ──
  if (fs.existsSync(SCHEMA_SQL_PATH)) {
    log('Running schema.sql (creating tables)...');
    const schemaSql = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    await supabaseRequest('POST', `/v1/projects/${projectRef}/database/query`, { query: schemaSql });
    console.log('  ✓ Tables created');
  } else {
    console.log(`\n  ⚠ schema.sql not found at ${SCHEMA_SQL_PATH} — skipping table creation.`);
    console.log('    You will need to create testimonials/products/orders/subscribers/messages/settings tables manually.');
  }

  // ── 5. Run seed_content_blocks.sql ──
  if (fs.existsSync(SEED_SQL_PATH)) {
    log('Seeding content_blocks...');
    const seedSql = fs.readFileSync(SEED_SQL_PATH, 'utf8');
    await supabaseRequest('POST', `/v1/projects/${projectRef}/database/query`, { query: seedSql });
    console.log('  ✓ content_blocks seeded');
  } else {
    console.log(`\n  ⚠ seed_content_blocks.sql not found at ${SEED_SQL_PATH} — skipping.`);
  }

  // ── 6. Write the filled-in config.js into the new repo ──
  log('Writing config.js into the new repo...');
  siteConfig.supabase = { url: supabaseUrl, anonKey: anonKey };
  const configJsContent = `var SITE_CONFIG = ${JSON.stringify(siteConfig, null, 2)};\n`;
  const encoded = Buffer.from(configJsContent, 'utf8').toString('base64');
  await githubRequest('PUT', `/repos/${TEMPLATE_OWNER}/${repoSlug}/contents/config.js`, {
    message: 'Set client config',
    content: encoded,
  });
  console.log('  ✓ config.js committed');

  // ── 7. Create the Vercel project, linked to the repo, with env vars ──
  log('Creating Vercel project...');
  const adminPassword = crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const vercelProject = await vercelRequest('POST', '/v11/projects', {
    name: repoSlug,
    gitRepository: { repo: `${TEMPLATE_OWNER}/${repoSlug}`, type: 'github' },
    environmentVariables: [
      { key: 'ADMIN_PASSWORD', value: adminPassword, target: ['production', 'preview', 'development'], type: 'encrypted' },
      { key: 'SUPABASE_URL', value: supabaseUrl, target: ['production', 'preview', 'development'], type: 'encrypted' },
      { key: 'SUPABASE_SERVICE_KEY', value: serviceKey, target: ['production', 'preview', 'development'], type: 'encrypted' },
      { key: 'NOTIFY_TO', value: siteConfig.brand.email || '', target: ['production', 'preview', 'development'], type: 'encrypted' },
      { key: 'NOTIFY_FROM', value: siteConfig.brand.email || '', target: ['production', 'preview', 'development'], type: 'encrypted' },
      { key: 'RESEND_API_KEY', value: process.env.SHARED_RESEND_API_KEY || 'SET_ME_MANUALLY', target: ['production', 'preview', 'development'], type: 'encrypted' },
    ],
  });
  console.log(`  ✓ Vercel project created: ${vercelProject.name}`);

  // ── Also set the admin password in Supabase settings table ──
  log('Setting admin password in Supabase settings table...');
  await supabaseRequest('POST', `/v1/projects/${projectRef}/database/query`, {
    query: `insert into settings (key, value) values ('admin_password', '${adminPassword.replace(/'/g, "''")}') on conflict (key) do update set value = excluded.value;`,
  });
  console.log('  ✓ Admin password set');

  console.log(`\n=========================================`);
  console.log(`DONE — ${clientName} is live`);
  console.log(`=========================================`);
  console.log(`Repo:          ${repo.html_url}`);
  console.log(`Supabase:      https://supabase.com/dashboard/project/${projectRef}`);
  console.log(`Vercel:        https://vercel.com/${vercelProject.accountId || ''}/${vercelProject.name}`);
  console.log(`Admin login:   (site URL)/admin.html — password: ${adminPassword}`);
  console.log(`\nStill needed from you:`);
  console.log(`  1. Upload the client's real photos to /images/ in the new repo`);
  console.log(`  2. Set RESEND_API_KEY in Vercel if it wasn't picked up automatically`);
  console.log(`  3. Connect the client's custom domain once they have one (Vercel → Domains)`);
  if (!fs.existsSync(SCHEMA_SQL_PATH)) {
    console.log(`  4. ⚠ Create the testimonials/products/orders/subscribers/messages tables manually — schema.sql wasn't found`);
  }
}

main().catch((err) => fail(err.stack || String(err)));
