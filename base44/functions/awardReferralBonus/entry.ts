import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type !== 'create') return Response.json({ processed: false });

    // Only process if referred_by is set
    if (!data.referred_by) return Response.json({ processed: false });

    // Find the referrer's loyalty account by referral code
    const referrers = await base44.asServiceRole.entities.LoyaltyAccount.filter({
      referral_code: data.referred_by,
    });

    if (!referrers || referrers.length === 0) {
      return Response.json({ processed: false, error: 'Referrer not found' });
    }

    const referrer = referrers[0];
    const referralBonusPoints = 100;

    // Award bonus points to referrer
    await base44.asServiceRole.entities.LoyaltyAccount.update(referrer.id, {
      points: (referrer.points || 0) + referralBonusPoints,
      total_points_earned: (referrer.total_points_earned || 0) + referralBonusPoints,
    });

    // Create notification for referrer
    await base44.asServiceRole.entities.Notification.create({
      user_id: referrer.created_by_id,
      title: '🎁 Referral Bonus!',
      message: `You earned ${referralBonusPoints} bonus points for a successful referral!`,
      type: 'general',
      reference_id: event.entity_id,
    });

    return Response.json({
      processed: true,
      referrerRewarded: referrer.id,
      bonusPointsAwarded: referralBonusPoints,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});