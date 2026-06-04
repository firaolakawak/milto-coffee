import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    if (event.type !== 'update') return Response.json({ processed: false });

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const tierConfig = {
      bronze: { name: 'Bronze', milestone: 500 },
      silver: { name: 'Silver', milestone: 1500 },
      gold: { name: 'Gold', milestone: 3000 },
      platinum: { name: 'Platinum', milestone: Infinity },
    };

    const milestones = [100, 250, 500, 1000, 1500, 2000, 3000];
    const notifications = [];

    // Check for tier upgrade
    if (data.tier !== old_data.tier) {
      const newTierName = tierConfig[data.tier]?.name || data.tier;
      notifications.push({
        user_id: user.id,
        title: '🎉 Tier Upgrade!',
        message: `Congratulations! You've reached ${newTierName} tier!`,
        type: 'general',
        reference_id: event.entity_id,
      });
    }

    // Check for milestone points
    const oldPoints = old_data.total_points_earned || 0;
    const newPoints = data.total_points_earned || 0;
    
    for (const milestone of milestones) {
      if (oldPoints < milestone && newPoints >= milestone) {
        notifications.push({
          user_id: user.id,
          title: '⭐ Milestone Reached!',
          message: `You've earned ${milestone} total points! Keep collecting for more rewards.`,
          type: 'general',
          reference_id: event.entity_id,
        });
        break; // Only notify for the first milestone crossed
      }
    }

    // Create notifications
    for (const notif of notifications) {
      await base44.asServiceRole.entities.Notification.create(notif);
    }

    return Response.json({ 
      processed: true, 
      notificationsCreated: notifications.length,
      tierChanged: data.tier !== old_data.tier,
      milestoneCrossed: notifications.some(n => n.title.includes('Milestone'))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});