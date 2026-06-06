import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

function generateCouponCode(userId) {
  const suffix = userId.slice(-6).toUpperCase();
  return `BDAY-${suffix}`;
}

function birthdayEmailHtml(firstName, couponCode) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Happy Birthday from Milto Coffee!</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1E4535,#2d6a50);padding:40px 40px 32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">🎂</div>
              <h1 style="color:#C9A84C;font-size:28px;font-weight:700;margin:0 0 8px;">Happy Birthday, ${firstName}!</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Your special day deserves a special treat ☕</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#2d3748;font-size:15px;line-height:1.7;margin:0 0 24px;">
                We're so happy to celebrate your birthday with you! As a valued member of the Milto Coffee family,
                we'd love to treat you to a <strong>FREE drink</strong> of your choice today.
              </p>

              <!-- Coupon Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8ee;border:2px dashed #C9A84C;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Your Birthday Coupon</p>
                    <p style="color:#1E4535;font-size:28px;font-weight:800;font-family:'Courier New',monospace;letter-spacing:3px;margin:0 0 8px;">${couponCode}</p>
                    <p style="color:#C9A84C;font-size:13px;font-weight:600;margin:0;">🎁 1 FREE Drink — Valid Today Only</p>
                  </td>
                </tr>
              </table>

              <p style="color:#2d3748;font-size:14px;line-height:1.6;margin:0 0 28px;">
                Simply show this email or mention your coupon code <strong>${couponCode}</strong> to your barista at any Milto Coffee branch.
                This offer is valid for <strong>today only</strong> and applies to any drink on our menu.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://miltocoffe.com/menu" style="display:inline-block;background:#1E4535;color:#C9A84C;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">
                      Browse Our Menu →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f5ed;padding:24px 40px;text-align:center;border-top:1px solid #e8e0d0;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">Milto Coffee — Ethiopia's Finest Coffee Experience</p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">Questions? Contact us at support@miltocoffee.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both: admin user calling manually, OR scheduled automation (no user auth)
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    webpush.setVapidDetails('mailto:support@miltocoffee.com', vapidPublicKey, vapidPrivateKey);

    // Find all users with today's birthday
    const allUsers = await base44.asServiceRole.entities.User.list();
    const birthdayUsers = allUsers.filter(
      u => u.birthday_month === todayMonth && u.birthday_day === todayDay
    );

    if (birthdayUsers.length === 0) {
      return Response.json({ status: 'success', count: 0, sent: 0, emails_sent: 0 });
    }

    const userIds = birthdayUsers.map(u => u.id);
    const allSubs = await base44.asServiceRole.entities.PushSubscription.list();
    const birthdaySubs = allSubs.filter(s => userIds.includes(s.created_by_id));

    // Send in-app notifications + emails for all birthday users
    await Promise.all(
      birthdayUsers.map(async (u) => {
        const firstName = (u.full_name || '').split(' ')[0] || 'Friend';
        const couponCode = generateCouponCode(u.id);

        // In-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_id: u.id,
          title: '🎂 Happy Birthday!',
          message: `It's your special day! Use code ${couponCode} for a FREE drink at any Milto Coffee branch today.`,
          type: 'general',
        }).catch(() => null);

        // Birthday email
        if (u.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: u.email,
            from_name: 'Milto Coffee',
            subject: `🎂 Happy Birthday ${firstName}! Your free drink is waiting ☕`,
            body: birthdayEmailHtml(firstName, couponCode),
          }).catch(() => null);
        }
      })
    );

    // Push notifications
    const pushPayload = JSON.stringify({
      title: '🎂 Happy Birthday from Milto Coffee!',
      message: "It's your special day! Enjoy a FREE drink on us today. Check your email for your coupon code.",
      url: '/rewards',
    });

    let sent = 0;
    let failed = 0;
    let emailsSent = birthdayUsers.filter(u => !!u.email).length;

    if (birthdaySubs.length > 0) {
      await Promise.all(
        birthdaySubs.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
              pushPayload
            );
            sent++;
          } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await base44.asServiceRole.entities.PushSubscription.delete(sub.id);
            }
            failed++;
          }
        })
      );
    }

    return Response.json({
      status: 'success',
      count: birthdayUsers.length,
      sent,
      failed,
      emails_sent: emailsSent,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});