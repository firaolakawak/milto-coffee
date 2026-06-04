import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingBag, Store, Clock } from 'lucide-react';
import { format } from 'date-fns';
import StockAlerts from '@/components/admin/StockAlerts';
import SalesTrendsChart from '@/components/admin/SalesTrendsChart';
import LowStockTable from '@/components/admin/LowStockTable';

export default function Dashboard() {
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: () => base44.entities.Order.list('-created_date', 100) });
  const { data: branches = [] } = useQuery({ queryKey: ['admin-branches'], queryFn: () => base44.entities.Branch.list() });
  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => base44.entities.Product.list() });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrders = orders.filter(o => ['received', 'preparing', 'ready'].includes(o.status));
  const todayOrders = orders.filter(o => {
    const d = new Date(o.created_date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const stats = [
    { title: 'Total Revenue', value: `${totalRevenue.toLocaleString()} ETB`, icon: DollarSign, color: 'text-green-600 bg-green-100' },
    { title: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-100' },
    { title: 'Active Orders', value: activeOrders.length, icon: Clock, color: 'text-amber-600 bg-amber-100' },
    { title: 'Branches', value: branches.length, icon: Store, color: 'text-violet-600 bg-violet-100' },
  ];

  const statusColors = {
    received: 'bg-blue-100 text-blue-700',
    preparing: 'bg-amber-100 text-amber-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your Milto Coffee operations</p>
      </div>

      <StockAlerts />
      <LowStockTable />
      <SalesTrendsChart orders={orders} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.title}</span>
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 8).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">#{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_name} · {order.branch_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusColors[order.status]} border-0 text-xs`}>{order.status}</Badge>
                    <span className="text-sm font-semibold">{order.total} ETB</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Today's Orders</span>
                <span className="font-bold">{todayOrders.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Today's Revenue</span>
                <span className="font-bold">{todayOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Active Products</span>
                <span className="font-bold">{products.filter(p => p.is_available !== false).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Active Branches</span>
                <span className="font-bold">{branches.filter(b => b.is_active !== false).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}