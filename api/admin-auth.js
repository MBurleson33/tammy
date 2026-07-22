// api/admin-auth.js
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

  console.log('DEBUG: SUPABASE_SERVICE_KEY present:', !!SUPABASE_SERVICE_KEY);
  console.log('DEBUG: newPassword present:', !!newPassword);

  if (SUPABASE_SERVICE_KEY) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.admin_password&select=value`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });

      console.log('DEBUG: Supabase read status:', resp.status);
      const data = await resp.json();
      console.log('DEBUG: Supabase data:', JSON.stringify(data));

      if (resp.ok && data.length > 0) {
        const storedPassword = data[0].value;

        if (password !== storedPassword) {
          return res.status(401).json({ ok: false, error: 'Incorrect password', debug: 'supabase_mismatch' });
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

          console.log('DEBUG: Update status:', updateResp.status);
          const updateText = await updateResp.text();
          console.log('DEBUG: Update response:', updateText);

          if (!updateResp.ok) {
            return res.status(500).json({ ok: false, error: 'Failed to update', debug: updateText });
          }
          return res.status(200).json({ ok: true, updated: true });
        }

        return res.status(200).json({ ok: true });
      } else {
        console.log('DEBUG: Falling back — Supabase returned empty or error');
      }
    } catch (err) {
      console.error('DEBUG: Supabase error:', err.message);
    }
  }

  // Fallback
  if (password === FALLBACK_PASSWORD) {
    return res.status(200).json({ ok: true, source: 'fallback' });
  }

  return res.status(401).json({ ok: false, error: 'Incorrect password' });
};
