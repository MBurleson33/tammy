// api/admin-orders.js
// ─────────────────────────────────────────────────────
// Server-side endpoint for reading/updating/deleting orders.
// Uses SUPABASE_SERVICE_KEY (never sent to the browser) instead
// of the anon key, so order data is no longer reachable by
// anyone who can view the page source and grab the anon key
// out of config.js.
//
// Every request must include the admin password in the
// x-admin-password header — admin.html sends this on every
// call (see updated loadOrders/updateOrderStatus/deleteOrder).
// This mirrors how api/admin-auth.js already checks the
// password, just re-verified per request rather than trusting
// a client-side sessionStorage flag alone.
// ─────────────────────────────────────────────────────

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured — missing Supabase env vars' });
  }

  const providedPassword = req.headers['x-admin-password'];
  if (!providedPassword) {
    return res.status(401).json({ error: 'Missing admin password' });
  }

  const sbHeaders = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };

  // Verify the password against the settings table on every request.
  // Using the service key here means this check works regardless of
  // RLS on the settings table.
  try {
    const settingsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/settings?key=eq.admin_password&select=value`,
      { headers: sbHeaders }
    );
    const settingsData = await settingsRes.json();
    const storedPassword = settingsData && settingsData[0] && settingsData[0].value;
    if (!storedPassword || providedPassword !== storedPassword) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Could not verify admin password' });
  }

  const ordersUrl = `${SUPABASE_URL}/rest/v1/orders`;

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${ordersUrl}?order=created_at.desc`, { headers: sbHeaders });
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing order id' });
      const r = await fetch(`${ordersUrl}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...sbHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify(updates),
      });
      if (!r.ok) return res.status(500).json({ error: 'Update failed' });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing order id' });
      const r = await fetch(`${ordersUrl}?id=eq.${id}`, {
        method: 'DELETE',
        headers: sbHeaders,
      });
      if (!r.ok) return res.status(500).json({ error: 'Delete failed' });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
