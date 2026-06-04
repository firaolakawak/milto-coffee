import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  received:        'bg-blue-100 text-blue-700',
  preparing:       'bg-amber-100 text-amber-700',
  ready:           'bg-green-100 text-green-700',
  out_for_delivery:'bg-cyan-100 text-cyan-700',
  completed:       'bg-slate-100 text-slate-600',
  cancelled:       'bg-red-100 text-red-600',
};

const ACTIVE = ['received', 'preparing', 'ready', 'out_for_delivery'];

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  const isActive = ACTIVE.includes(order.status);

  return (
    <div className="border-b last:border-0">
      <button className="w-full text-left py-3 flex items-center justify-between gap-2" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-4 w-4 text-secondary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">#{order.order_number || order.id?.slice(-6)}</p>
            <p className="text-xs text-muted-foreground truncate">{order.branch_name} · {order.items?.length || 0} item(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`${STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'} border-0 text-xs`}>
            {order.status?.replace(/_/g, ' ')}
          </Badge>
          <span className="text-sm font-bold">{(order.total || 0).toLocaleString()} ETB</span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="pb-3 pl-11 space-y-1.5">
          <p className="text-xs text-muted-foreground mb-2">
            {order.created_date ? format(new Date(order.created_date), 'MMM d, yyyy · h:mm a') : '—'} · {order.delivery_type}
          </p>
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs text-foreground">
              <span>{item.quantity}× {item.product_name}</span>
              <span className="text-muted-foreground">{(item.total_price || 0).toLocaleString()} ETB</span>
            </div>
          ))}
          {isActive && (
            <Link to={`/orders/track/${order.id}`} className="inline-block mt-2 text-xs text-secondary font-semibold underline-offset-2 hover:underline">
              Track Order →
            </Link>
          )}
          {order.loyalty_points_earned > 0 && (
            <p className="text-xs text-green-600 mt-1">+{order.loyalty_points_earned} pts earned</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderHistoryList({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center text-muted-foreground text-sm py-10">
          <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          No orders yet. Start your coffee journey!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        {orders.map(order => <OrderRow key={order.id} order={order} />)}
      </CardContent>
    </Card>
  );
}