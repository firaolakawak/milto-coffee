import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coffee, ChefHat, Clock, CheckCircle2, Truck, XCircle, MapPin, Package } from 'lucide-react';
import { format } from 'date-fns';

const STEPS = [
  { status: 'received',          icon: Clock,          label: 'Order Received',     desc: 'We got your order and it\'s in the queue.' },
  { status: 'preparing',         icon: ChefHat,        label: 'Preparing',          desc: 'Our baristas are crafting your order.' },
  { status: 'ready',             icon: Coffee,         label: 'Ready for Pickup',   desc: 'Your order is ready! Come grab it.' },
  { status: 'out_for_delivery',  icon: Truck,          label: 'Out for Delivery',   desc: 'Your order is on its way to you.' },
  { status: 'completed',         icon: CheckCircle2,   label: 'Completed',          desc: 'Enjoy your coffee!' },
];

const PICKUP_STEPS = STEPS.filter(s => s.status !== 'out_for_delivery');
const DELIVERY_STEPS = STEPS.filter(s => s.status !== 'ready');

const statusOrder = ['received', 'preparing', 'ready', 'out_for_delivery', 'completed'];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    const orders = await base44.entities.Order.filter({ id: orderId });
    if (orders.length > 0) setOrder(orders[0]);
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
    // Subscribe to real-time updates
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.id === orderId && event.type !== 'delete') {
        setOrder(event.data);
      }
    });
    return unsub;
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">Order not found.</p>
        <Link to="/orders"><Button className="mt-4" variant="outline">Back to Orders</Button></Link>
      </div>
    );
  }

  const isDelivery = order.delivery_type === 'delivery';
  const isCancelled = order.status === 'cancelled';
  const steps = isDelivery ? DELIVERY_STEPS : PICKUP_STEPS;
  const currentIdx = isCancelled ? -1 : steps.findIndex(s => s.status === order.status);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="font-display text-xl font-bold text-primary">Track Order</h1>
          <p className="text-xs text-muted-foreground">#{order.order_number}</p>
        </div>
      </div>

      {/* Status Hero */}
      <Card className="border-0 shadow-md bg-primary text-primary-foreground mb-6 overflow-hidden">
        <CardContent className="p-6 text-center">
          {isCancelled ? (
            <>
              <XCircle className="h-14 w-14 mx-auto mb-3 opacity-80" />
              <p className="font-display text-xl font-bold">Order Cancelled</p>
              <p className="text-sm opacity-70 mt-1">This order has been cancelled.</p>
            </>
          ) : (
            <>
              {(() => {
                const cur = steps[currentIdx];
                if (!cur) return null;
                const Icon = cur.icon;
                return (
                  <>
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-8 w-8 text-secondary" />
                    </div>
                    <p className="font-display text-xl font-bold">{cur.label}</p>
                    <p className="text-sm opacity-70 mt-1">{cur.desc}</p>
                  </>
                );
              })()}
            </>
          )}
          <div className="mt-4 flex items-center justify-center gap-3 text-sm opacity-80">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{order.branch_name}</span>
            <span>·</span>
            <span>{isDelivery ? '🛵 Delivery' : '🏪 Pickup'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Progress Stepper */}
      {!isCancelled && (
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="space-y-0">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isDone = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const isPending = idx > currentIdx;
                return (
                  <div key={step.status} className="flex gap-4">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                        ${isDone ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-0.5 h-8 my-1 ${isDone ? 'bg-green-300' : 'bg-border'}`} />
                      )}
                    </div>
                    {/* Text */}
                    <div className="pb-4">
                      <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isPending ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Address */}
      {isDelivery && order.delivery_address && (
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-4 flex items-start gap-3">
            <MapPin className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Delivery Address</p>
              <p className="text-sm font-medium">{order.delivery_address}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-3">Order Summary</p>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.quantity}x {item.product_name} {item.size ? `(${item.size})` : ''}</span>
                <span className="font-medium">{item.total_price} ETB</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{order.subtotal} ETB</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{order.delivery_fee} ETB</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{order.discount} ETB</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span className="text-secondary">{order.total} ETB</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Placed {order.created_date ? format(new Date(order.created_date), 'MMM d, yyyy · h:mm a') : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}