// api/admin-auth.js
// Vercel serverless function — verifies admin password
// Set ADMIN_PASSWORD in Vercel environment variables

module.exports = function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var body = req.body;

  // Parse body if it's a string
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }

  var password = body && body.password;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, error: 'Incorrect password' });
  }
};
