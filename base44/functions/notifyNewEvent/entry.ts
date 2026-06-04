import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { data } = payload;
    const event = data;

    // Get all users to notify
    const users = await base44.asServiceRole.entities.User.list();

    for (const user of users) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: user.id,
        title: '🎉 New Event: ' + event.title,
        message: event.description || `A new event "${event.title}" has been added. Check it out!`,
        type: 'new_event',
        reference_id: event.id,
        is_read: false,
      });
    }

    return Response.json({ success: true, notified: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});