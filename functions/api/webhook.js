export async function onRequestPost(context) {
  const { request } = context;
  const body = await request.text();

  let evt;
  try { evt = JSON.parse(body); } catch (e) {
    return new Response('Bad Request', { status: 400 });
  }

  if (evt.type === 'checkout.session.completed') {
    const session = evt.data.object;
    const email = session.customer_details && session.customer_details.email;
    const name = (session.customer_details && session.customer_details.name) || 'there';
    const amount = ((session.amount_total || 0) / 100).toFixed(2);
    const pkg = parseFloat(amount) <= 50 ? 'Starter' : parseFloat(amount) <= 150 ? 'Pro' : 'Studio';

    if (email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer re_jmJDtFdw_9DiAhHLEUT2sFskYJbrUC19A',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ForrestVisuals <onboarding@resend.dev>',
          to: [email],
          subject: 'Your ' + pkg + ' Color Grading Session is Confirmed',
          html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;">
  <h1 style="font-size:22px;margin-bottom:4px;">ForrestVisuals</h1>
  <p style="color:#888;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:Inter,sans-serif;margin-top:0;">Color Grading Studio</p>
  <hr style="border:none;border-top:1px solid #e8c48a;margin:24px 0;">
  <h2 style="font-size:20px;">You're booked, ${name}.</h2>
  <p style="font-size:15px;line-height:1.7;color:#444;">
    Your <strong>${pkg} Package</strong> ($${amount}) is confirmed.
    We'll be in touch within 24 hours to coordinate your footage handoff and discuss your creative vision.
  </p>
  <p style="font-size:15px;line-height:1.7;color:#444;">Please complete our intake form so we can start crafting your look:</p>
  <a href="https://form.typeform.com/to/PTUDUR7n"
     style="display:inline-block;background:#b47730;color:#fff;padding:14px 28px;text-decoration:none;font-family:Inter,sans-serif;font-size:14px;letter-spacing:0.05em;margin:16px 0;">
    Complete Intake Form →
  </a>
  <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0;">
  <p style="font-size:12px;color:#888;font-family:Inter,sans-serif;">
    ForrestVisuals Color Grading ·
    <a href="https://forrestgrade.pages.dev" style="color:#b47730;">forrestgrade.pages.dev</a>
  </p>
</div>`
        })
      });
    }
  }

  return new Response('OK', { status: 200 });
}

export async function onRequestGet() {
  return new Response('Webhook endpoint active', { status: 200 });
}
