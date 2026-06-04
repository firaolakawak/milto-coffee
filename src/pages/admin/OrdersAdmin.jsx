import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, ChefHat, Coffee, Check, X, Search, Truck, ChevronDown, ChevronUp, Phone, MapPin, FileText, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

// Delivery flow:  received → preparing → out_for_delivery → completed
// Pickup flow:    received → preparing → ready → completed
const statusConfig = {
  received:         { label: 'Received',        icon: Clock,    color: 'bg-blue-100 text-blue-700',    nextPickup: 'preparing',        nextDelivery: 'preparing' },
  preparing:        { label: 'Preparing',        icon: ChefHat,  color: 'bg-amber-100 text-amber-700',  nextPickup: 'ready',            nextDelivery: 'out_for_delivery' },
  ready:            { label: 'Ready',            icon: Coffee,   color: 'bg-green-100 text-green-700',  nextPickup: 'completed',        nextDelivery: null },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck,    color: 'bg-purple-100 text-purple-700',nextPickup: null,               nextDelivery: 'completed' },
  completed:        { label: 'Completed',        icon: Check,    color: 'bg-slate-100 text-slate-600',  nextPickup: null,               nextDelivery: null },
  cancelled:        { label: 'Cancelled',        icon: X,        color: 'bg-red-100 text-red-600',      nextPickup: null,               nextDelivery: null },
};

function CustomizationBadges({ customizations, size }) {
  if (!customizations && !size) return null;
  const tags = [];
  if (size) tags.push(size);
  if (customizations?.milk && customizations.milk !== 'None') tags.push(`${customizations.milk} milk`);
  if (customizations?.sugar) tags.push(`Sugar: ${customizations.sugar}`);
  if (customizations?.roast) tags.push(`Roast: ${customizations.roast}`);
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map((tag, i) => (
        <span key={i} className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-medium">{tag}</span>
      ))}
    </div>
  );
}

function OrderDetailRow({ label, value, icon: Icon, className = '' }) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-2 text-sm ${className}`}>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, isPending }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status] || statusConfig.received;
  const StatusIcon = status.icon;
  const isDelivery = order.delivery_type === 'delivery';
  const nextStatus = order.delivery_type === 'delivery'
    ? statusConfig[order.status]?.nextDelivery
    : statusConfig[order.status]?.nextPickup;

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      {/* Main Row */}
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="font-bold text-sm">#{order.order_number}</span>
              <Badge className={`${status.color} border-0 gap-1 text-xs`}>
                <StatusIcon className="h-3 w-3" /> {status.label}
              </Badge>
              <Badge className={`border-0 text-xs ${isDelivery ? 'bg-purple-50 text-purple-700' : 'bg-muted text-muted-foreground'}`}>
                {isDelivery ? '🛵 Delivery' : '🏪 Pickup'}
              </Badge>
            </div>

            {/* Customer & Branch */}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{order.customer_name || 'Guest'}</span>
              {order.customer_phone && <span> · {order.customer_phone}</span>}
              {' · '}{order.branch_name}
              {' · '}{format(new Date(order.created_date), 'MMM d, h:mm a')}
            </p>

            {isDelivery && order.delivery_address && (
              <p className="text-xs text-purple-600 mt-0.5">📍 {order.delivery_address}</p>
            )}

            {/* Items Summary */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {order.items?.map((item, i) => (
                <div key={i} className="bg-muted rounded-lg px-2 py-1">
                  <span className="text-xs font-medium">{item.quantity}× {item.product_name}</span>
                  <CustomizationBadges customizations={item.customizations} size={item.size} />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-secondary whitespace-nowrap">{order.total} ETB</span>
            {nextStatus && (
              <Button
                size="sm"
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 whitespace-nowrap"
                disabled={isPending}
                onClick={() => onUpdateStatus(order.id, nextStatus)}
              >
                → {statusConfig[nextStatus]?.label}
              </Button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => onUpdateStatus(order.id, 'cancelled')}>
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setExpanded(v => !v)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Detail Panel */}
      {expanded && (
        <div className="border-t border-border bg-muted/40 px-4 py-4 space-y-4">
          {/* Customer Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Customer Details</p>
            <div className="space-y-1">
              <OrderDetailRow label="Name" value={order.customer_name} />
              <OrderDetailRow label="Phone" value={order.customer_phone} icon={Phone} />
              {isDelivery && <OrderDetailRow label="Address" value={order.delivery_address} icon={MapPin} />}
              <OrderDetailRow label="Payment" value={order.payment_method?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} icon={CreditCard} />
              {order.promo_code && <OrderDetailRow label="Promo" value={order.promo_code} />}
              {order.notes && <OrderDetailRow label="Notes" value={order.notes} icon={FileText} />}
            </div>
          </div>

          {/* Order Items with Full Customization */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Order Items</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="bg-background rounded-xl p-3 flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.quantity}× {item.product_name}</p>
                    {/* Size */}
                    {item.size && (
                      <p className="text-xs text-muted-foreground mt-0.5">Size: <span className="font-medium text-foreground">{item.size}</span></p>
                    )}
                    {/* All Customizations */}
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(item.customizations).map(([key, val]) => val && val !== 'None' ? (
                          <span key={key} className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium capitalize">
                            {key}: {val}
                          </span>
                        ) : null)}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-secondary">{item.total_price} ETB</p>
                    <p className="text-xs text-muted-foreground">{item.unit_price} ETB each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-background rounded-xl p-3 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{order.subtotal} ETB</span></div>
            {order.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{order.discount} ETB</span></div>}
            {isDelivery && order.delivery_fee > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery Fee</span><span>{order.delivery_fee} ETB</span></div>}
            <div className="flex justify-between font-bold pt-1 border-t border-border"><span>Total</span><span className="text-secondary">{order.total} ETB</span></div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function OrdersAdmin() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const unsub = base44.entities.Order.subscribe(() => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    });
    return unsub;
  }, [qc]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search && !o.order_number?.toLowerCase().includes(search.toLowerCase()) && !o.customer_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Orders</h1>
        <p className="text-sm text-muted-foreground">Manage and track all orders in real-time · Click an order to expand details</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search order # or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-full" />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-transparent p-0 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="all" className="rounded-full text-xs px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All ({orders.length})</TabsTrigger>
            {Object.entries(statusConfig).map(([key, val]) => {
              const count = orders.filter(o => o.status === key).length;
              return (
                <TabsTrigger key={key} value={key} className="rounded-full text-xs px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {val.label}{count > 0 ? ` (${count})` : ''}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
            isPending={updateStatus.isPending}
          />
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No orders found</p>}
      </div>
    </div>
  );
}