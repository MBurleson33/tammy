// api/admin-auth.js
// Verifies admin password against Supabase settings table
// Falls back to ADMIN_PASSWORD env var if Supabase unavailable
// Vercel env vars needed:
//   SUPABASE_URL      — e.g. https://nzqdmsbxwghkqowajmvs.supabase.co
//   SUPABASE_SERVICE_KEY — service role key (not anon key) for settings access
//   ADMIN_PASSWORD    — fallback password if Supabase is down

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, newPassword } = req.body || {};
  if (!password) return res.status(400).json({ ok: false, error: 'Password required' });

  const SUPABASE_URL         = process.env.SUPABASE_URL || 'https://nzqdmsbxwghkqowajmvs.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const FALLBACK_PASSWORD    = process.env.ADMIN_PASSWORD || 'tmm2026';

  // Try Supabase first
  if (SUPABASE_SERVICE_KEY) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.admin_password&select=value`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });

      if (resp.ok) {
        const data = await resp.json();
        const storedPassword = data[0]?.value;

        if (!storedPassword) {
          return res.status(500).json({ ok: false, error: 'Password not set in database' });
        }

        // Verify current password
        if (password !== storedPassword) {
          return res.status(401).json({ ok: false, error: 'Incorrect password' });
        }

        // If newPassword provided, update it in Supabase
        if (newPassword) {
          const updateResp = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.admin_password`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ value: newPassword })
          });

          if (!updateResp.ok) {
            return res.status(500).json({ ok: false, error: 'Failed to update password' });
          }

          return res.status(200).json({ ok: true, updated: true });
        }

        return res.status(200).json({ ok: true });
      }
    } catch (err) {
      console.warn('Supabase unavailable, falling back to env var:', err.message);
    }
  }

  // Fallback to env var
  if (password === FALLBACK_PASSWORD) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, error: 'Incorrect password' });
};
