// api/notify.js
// Sends email notifications via Resend when orders or messages come in
// Vercel env vars needed:
//   RESEND_API_KEY   — your Resend API key
//   NOTIFY_TO        — email to notify (e.g. tammymelchisedeck@gmail.com)
//   NOTIFY_FROM      — verified Resend sender (e.g. hello@brokenandburied.com)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  if (!type || !data) {
    return res.status(400).json({ error: 'Missing type or data' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFY_TO     = process.env.NOTIFY_TO     || 'Burleson.Matthew@gmail.com';
  const NOTIFY_FROM   = process.env.NOTIFY_FROM   || 'hello@brokenandburied.com';

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  }

  let subject, html;

  if (type === 'order') {
    const items = (data.items || []).map(i =>
      `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #f0ebe3">${i.name}${i.qty > 1 ? ' ×' + i.qty : ''}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f0ebe3;text-align:right">$${i.total}</td>
      </tr>`
    ).join('');

    subject = `New Order — ${data.full_name} ($${data.order_total})`;
    html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2C2520">
        <div style="background:#2C2520;padding:24px 32px">
          <h1 style="color:#D4B896;font-size:1.4rem;font-weight:300;margin:0">New Order Received</h1>
        </div>
        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:6px 12px;color:#8C7E72;width:140px">Name</td><td style="padding:6px 12px"><strong>${data.full_name}</strong></td></tr>
            <tr><td style="padding:6px 12px;color:#8C7E72">Email</td><td style="padding:6px 12px"><a href="mailto:${data.email}" style="color:#B89A6A">${data.email}</a></td></tr>
            <tr><td style="padding:6px 12px;color:#8C7E72">Phone</td><td style="padding:6px 12px">${data.phone || '—'}</td></tr>
            <tr><td style="padding:6px 12px;color:#8C7E72">Address</td><td style="padding:6px 12px">${data.address ? `${data.address}, ${data.city}, ${data.state} ${data.zip}` : '—'}</td></tr>
            <tr><td style="padding:6px 12px;color:#8C7E72">Payment</td><td style="padding:6px 12px">${data.payment_method || '—'}</td></tr>
          </table>

          <h3 style="font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:#8C7E72;margin-bottom:8px">Order Items</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            ${items}
            <tr>
              <td style="padding:10px 12px;font-weight:bold">Total</td>
              <td style="padding:10px 12px;text-align:right;font-weight:bold;color:#B89A6A">$${data.order_total}</td>
            </tr>
          </table>

          ${data.notes ? `<p style="color:#8C7E72;font-size:0.9rem"><strong>Notes:</strong> ${data.notes}</p>` : ''}

          <div style="background:#FAF7F2;border-left:3px solid #B89A6A;padding:16px 20px;margin-top:24px;font-size:0.85rem;color:#5C4F44">
            Remember to check PayPal or Venmo to confirm payment from <strong>${data.full_name}</strong>.
          </div>
        </div>
      </div>`;
  }

  else if (type === 'message') {
    subject = `New Message — ${data.name}`;
    html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2C2520">
        <div style="background:#2C2520;padding:24px 32px">
          <h1 style="color:#D4B896;font-size:1.4rem;font-weight:300;margin:0">New Message</h1>
        </div>
        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:6px 12px;color:#8C7E72;width:100px">From</td><td style="padding:6px 12px"><strong>${data.name}</strong></td></tr>
            <tr><td style="padding:6px 12px;color:#8C7E72">Email</td><td style="padding:6px 12px"><a href="mailto:${data.email}" style="color:#B89A6A">${data.email}</a></td></tr>
          </table>
          <div style="background:#FAF7F2;padding:20px 24px;border-radius:2px;font-size:0.95rem;line-height:1.7;color:#2C2520">
            ${data.message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top:24px">
            <a href="mailto:${data.email}?subject=Re: Your message to Tammy" style="background:#B89A6A;color:#fff;text-decoration:none;padding:10px 20px;border-radius:2px;font-family:sans-serif;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase">Reply to ${data.name}</a>
          </p>
        </div>
      </div>`;
  }

  else if (type === 'subscriber') {
    subject = `New Newsletter Subscriber — ${data.email}`;
    html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2C2520">
        <div style="background:#2C2520;padding:24px 32px">
          <h1 style="color:#D4B896;font-size:1.4rem;font-weight:300;margin:0">New Subscriber</h1>
        </div>
        <div style="padding:32px">
          <p><strong>${data.email}</strong> just subscribed to your newsletter.</p>
          <p style="color:#8C7E72;font-size:0.85rem">Source: ${data.source || 'footer'}</p>
        </div>
      </div>`;
  }

  else {
    return res.status(400).json({ error: 'Unknown notification type' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to:   NOTIFY_TO,
        subject,
        html
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Notify error:', err);
    return res.status(500).json({ error: err.message });
  }
};
