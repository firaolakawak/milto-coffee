import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;

    // Only act on status changing to "ready"
    if (data?.status !== 'ready') {
      return Response.json({ skipped: true });
    }

    const order = data;
    const userId = order.created_by_id;

    if (userId) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        title: '☕ Your order is ready!',
        message: `Order #${order.order_number || order.id?.slice(-6)} is ready for pickup at ${order.branch_name || 'the store'}. Please collect it now.`,
        type: 'order_ready',
        reference_id: order.id,
        is_read: false,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});