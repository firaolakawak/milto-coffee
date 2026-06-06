import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
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
      return Response.json({ status: 'success', count: 0, sent: 0 });
    }

    const userIds = birthdayUsers.map(u => u.id);
    const allSubs = await base44.asServiceRole.entities.PushSubscription.list();
    const birthdaySubs = allSubs.filter(s => userIds.includes(s.created_by_id));

    const pushPayload = JSON.stringify({
      title: '🎂 Happy Birthday from Milto Coffee!',
      message: "It's your special day! Enjoy a FREE drink on us today. Show this at any branch.",
      url: '/rewards',
    });

    let sent = 0;
    let failed = 0;

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

    return Response.json({ status: 'success', count: birthdayUsers.length, sent, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});