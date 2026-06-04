import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { data, old_data } = payload;
    const order = data;

    // Only act when status changes to 'completed'
    if (order?.status !== 'completed' || old_data?.status === 'completed') {
      return Response.json({ skipped: true });
    }

    const userId = order.created_by_id;
    if (!userId) return Response.json({ skipped: true, reason: 'no user id' });

    const pointsEarned = order.loyalty_points_earned || Math.floor((order.total || 0) / 10);
    if (pointsEarned <= 0) return Response.json({ skipped: true, reason: 'no points to award' });

    // Find or create loyalty account
    const accounts = await base44.asServiceRole.entities.LoyaltyAccount.filter({ created_by_id: userId });
    
    if (accounts.length > 0) {
      const account = accounts[0];
      const newPoints = (account.points || 0) + pointsEarned;
      const newTotal = (account.total_points_earned || 0) + pointsEarned;
      const newOrderCount = (account.total_orders || 0) + 1;

      // Determine tier
      const tier =
        newTotal >= 5000 ? 'platinum' :
        newTotal >= 2000 ? 'gold' :
        newTotal >= 500  ? 'silver' :
        'bronze';

      await base44.asServiceRole.entities.LoyaltyAccount.update(account.id, {
        points: newPoints,
        total_points_earned: newTotal,
        total_orders: newOrderCount,
        tier,
      });
    } else {
      // Create a new loyalty account for this user
      await base44.asServiceRole.entities.LoyaltyAccount.create({
        user_name: order.customer_name || 'Customer',
        points: pointsEarned,
        total_points_earned: pointsEarned,
        total_orders: 1,
        tier: 'bronze',
      });
    }

    // Notify the user
    await base44.asServiceRole.entities.Notification.create({
      user_id: userId,
      title: '🌟 Points Earned!',
      message: `You earned ${pointsEarned} loyalty points for completing order #${order.order_number || order.id?.slice(-6)}. Keep brewing!`,
      type: 'general',
      reference_id: order.id,
      is_read: false,
    });

    return Response.json({ success: true, pointsAwarded: pointsEarned });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});