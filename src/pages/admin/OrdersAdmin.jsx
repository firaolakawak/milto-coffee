import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, ChefHat, Coffee, Check, X, Search } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  received: { label: 'Received', icon: Clock, color: 'bg-blue-100 text-blue-700', next: 'preparing' },
  preparing: { label: 'Preparing', icon: ChefHat, color: 'bg-amber-100 text-amber-700', next: 'ready' },
  ready: { label: 'Ready', icon: Coffee, color: 'bg-green-100 text-green-700', next: 'completed' },
  completed: { label: 'Completed', icon: Check, color: 'bg-slate-100 text-slate-600', next: null },
  cancelled: { label: 'Cancelled', icon: X, color: 'bg-red-100 text-red-600', next: null },
};

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
        <p className="text-sm text-muted-foreground">Manage and track all orders in real-time</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search order # or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-full" />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-transparent p-0 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="all" className="rounded-full text-xs px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
            {Object.entries(statusConfig).map(([key, val]) => (
              <TabsTrigger key={key} value={key} className={`rounded-full text-xs px-3 data-[state=active]:${val.color}`}>{val.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {filtered.map(order => {
          const status = statusConfig[order.status] || statusConfig.received;
          const StatusIcon = status.icon;
          return (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm">#{order.order_number}</span>
                      <Badge className={`${status.color} border-0 gap-1 text-xs`}><StatusIcon className="h-3 w-3" /> {status.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.customer_name} · {order.branch_name} · {format(new Date(order.created_date), 'MMM d, h:mm a')}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.items?.map((item, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full">{item.quantity}x {item.product_name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-secondary">{order.total} ETB</span>
                    {status.next && (
                      <Button size="sm" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => updateStatus.mutate({ id: order.id, status: status.next })}>
                        → {statusConfig[status.next]?.label}
                      </Button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No orders found</p>}
      </div>
    </div>
  );
}