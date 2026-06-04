import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { data } = payload;
    const order = data;
    const userId = order?.created_by_id;

    let notification = null;

    if (order?.status === 'ready') {
      notification = {
        title: '☕ Your order is ready!',
        message: `Order #${order.order_number || order.id?.slice(-6)} is ready for pickup at ${order.branch_name || 'the store'}. Please collect it now.`,
        type: 'order_ready',
      };
    } else if (order?.status === 'out_for_delivery') {
      notification = {
        title: '🛵 Your order is on the way!',
        message: `Order #${order.order_number || order.id?.slice(-6)} is out for delivery from ${order.branch_name || 'the store'}. Get ready!`,
        type: 'order_ready',
      };
    }

    if (notification && userId) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        reference_id: order.id,
        is_read: false,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});