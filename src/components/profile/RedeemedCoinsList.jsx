import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { format } from 'date-fns';

export default function RedeemedCoinsList({ orders }) {
  const redeemed = (orders || [])
    .filter(o => o.loyalty_points_redeemed > 0)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const totalRedeemed = redeemed.reduce((s, o) => s + (o.loyalty_points_redeemed || 0), 0);

  if (redeemed.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center text-muted-foreground text-sm py-10">
          <Coins className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          You haven't redeemed any points yet. Earn points and redeem them on future orders!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between py-2 mb-2 border-b">
          <span className="text-xs text-muted-foreground">Total Redeemed</span>
          <span className="font-bold text-sm text-amber-600">{totalRedeemed.toLocaleString()} pts</span>
        </div>
        {redeemed.map(order => (
          <div key={order.id} className="flex items-center gap-3 py-2.5 border-b last:border-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Coins className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Points Redeemed</p>
              <p className="text-xs text-muted-foreground">
                #{order.order_number || order.id?.slice(-6)} · {order.created_date ? format(new Date(order.created_date), 'MMM d, yyyy') : '—'}
              </p>
            </div>
            <span className="text-sm font-bold text-amber-600 shrink-0">−{(order.loyalty_points_redeemed || 0).toLocaleString()} pts</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}