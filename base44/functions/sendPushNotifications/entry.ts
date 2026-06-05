import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { title, message, url, icon } = await req.json();

    if (!title || !message) {
      return Response.json({ error: 'title and message are required' }, { status: 400 });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    webpush.setVapidDetails(
      'mailto:support@miltocoffee.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    const subscriptions = await base44.asServiceRole.entities.PushSubscription.list();

    const pushPayload = JSON.stringify({ title, message, url: url || '/', icon });
    const results = { success: 0, failed: 0, total: subscriptions.length };

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
            pushPayload
          );
          results.success++;
        } catch (err) {
          // Clean up expired/invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await base44.asServiceRole.entities.PushSubscription.delete(sub.id);
          }
          results.failed++;
        }
      })
    );

    return Response.json({ status: 'success', results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});