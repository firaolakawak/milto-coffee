import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Clock, ChefHat, Check, Coffee } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  received: { label: 'Received', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Preparing', icon: ChefHat, color: 'bg-amber-100 text-amber-700' },
  ready: { label: 'Ready for Pickup', icon: Coffee, color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', icon: Check, color: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelled', icon: Package, color: 'bg-red-100 text-red-600' },
};

export default function Orders() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => base44.entities.Order.filter({ created_by_id: user?.id }, '-created_date', 50),
    enabled: !!user,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-primary mb-6">My Orders</h1>
      {isLoading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = statusConfig[order.status] || statusConfig.received;
            const StatusIcon = status.icon;
            return (
              <Card key={order.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm">#{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.branch_name} · {format(new Date(order.created_date), 'MMM d, h:mm a')}</p>
                    </div>
                    <Badge className={`${status.color} border-0 gap-1`}>
                      <StatusIcon className="h-3 w-3" /> {status.label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.quantity}x {item.product_name} <span className="text-xs">({item.size})</span></span>
                        <span className="font-medium">{item.total_price} ETB</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground capitalize">{order.payment_method?.replace('_', ' ')}</span>
                    <span className="font-bold text-secondary">{order.total} ETB</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}