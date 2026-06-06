import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function PointsHistoryList({ orders }) {
  const pointsOrders = (orders || [])
    .filter(o => (o.loyalty_points_earned > 0 || o.loyalty_points_redeemed > 0) && o.status !== 'cancelled')
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  if (pointsOrders.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center text-muted-foreground text-sm py-10">
          <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          No points history yet.
        </CardContent>
      </Card>
    );
  }

  const totalEarned = pointsOrders.reduce((s, o) => s + (o.loyalty_points_earned || 0), 0);
  const totalRedeemed = pointsOrders.reduce((s, o) => s + (o.loyalty_points_redeemed || 0), 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-700">+{totalEarned}</p>
            <p className="text-xs text-green-600">Points Earned</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-orange-700">-{totalRedeemed}</p>
            <p className="text-xs text-orange-600">Points Redeemed</p>
          </div>
        </div>
        <div className="space-y-0">
          {pointsOrders.map(order => (
            <div key={order.id} className="flex items-center gap-3 py-2.5 border-b last:border-0">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {order.loyalty_points_redeemed > 0
                  ? <TrendingDown className="h-4 w-4 text-orange-500" />
                  : <TrendingUp className="h-4 w-4 text-green-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Order #{order.order_number || order.id?.slice(-6)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.created_date ? format(new Date(order.created_date), 'MMM d, yyyy') : '—'}
                </p>
              </div>
              <div className="text-right shrink-0">
                {order.loyalty_points_earned > 0 && (
                  <p className="text-sm font-bold text-green-600">+{order.loyalty_points_earned} pts</p>
                )}
                {order.loyalty_points_redeemed > 0 && (
                  <p className="text-sm font-bold text-orange-500">-{order.loyalty_points_redeemed} pts</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}