// api/admin-auth.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, newPassword } = req.body || {};
  if (!password) return res.status(400).json({ ok: false, error: 'Password required' });

  const SUPABASE_URL         = 'https://nzqdmsbxwghkqowajmvs.supabase.co';
  const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cWRtc2J4d2doa3Fvd2FqbXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc2OTQyNCwiZXhwIjoyMDk2MzQ1NDI0fQ.Bc1DYkVSB9MsT_Qmh_U5c9dFcrKyV-hn2CN4unF4jFs';
  const FALLBACK_PASSWORD    = process.env.ADMIN_PASSWORD || 'tmm2026';

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.admin_password&select=value`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    const data = await resp.json();

    if (resp.ok && data.length > 0) {
      const storedPassword = data[0].value;

      if (password !== storedPassword) {
        return res.status(401).json({ ok: false, error: 'Incorrect password' });
      }

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

    // Fallback if Supabase returns empty
    if (password === FALLBACK_PASSWORD) {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: 'Incorrect password' });

  } catch (err) {
    // Fallback on error
    if (password === FALLBACK_PASSWORD) {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: 'Incorrect password' });
  }
};
