import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, ShoppingBag, Store, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import StockAlerts from '@/components/admin/StockAlerts';
import SalesTrendsChart from '@/components/admin/SalesTrendsChart';
import LowStockTable from '@/components/admin/LowStockTable';
import BranchPerformanceChart from '@/components/admin/BranchPerformanceChart';
import DailyPerformanceChart from '@/components/admin/DailyPerformanceChart';
import TimePerformanceChart from '@/components/admin/TimePerformanceChart';
import PushNotificationBroadcast from '@/components/admin/PushNotificationBroadcast';

const PAGE_SIZE = 10;

// Generate last 12 months for the month picker
function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') });
  }
  return options;
}

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: () => base44.entities.Order.list('-created_date', 500) });
  const { data: branches = [] } = useQuery({ queryKey: ['admin-branches'], queryFn: () => base44.entities.Branch.list() });
  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => base44.entities.Product.list() });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrders = orders.filter((o) => ['received', 'preparing', 'ready'].includes(o.status));
  const todayOrders = orders.filter((o) => {
    const d = new Date(o.created_date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const stats = [
  { title: 'Total Revenue', value: `${totalRevenue.toLocaleString()} ETB`, icon: DollarSign, color: 'text-green-600 bg-green-100' },
  { title: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-100' },
  { title: 'Active Orders', value: activeOrders.length, icon: Clock, color: 'text-amber-600 bg-amber-100' },
  { title: 'Branches', value: branches.length, icon: Store, color: 'text-violet-600 bg-violet-100' }];


  const statusColors = {
    received: 'bg-blue-100 text-blue-700',
    preparing: 'bg-amber-100 text-amber-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600'
  };

  const monthOptions = useMemo(() => getMonthOptions(), []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.created_date);
      if (dateFilter) {
        const selected = new Date(dateFilter);
        if (d.toDateString() !== selected.toDateString()) return false;
      }
      if (monthFilter) {
        const [yr, mo] = monthFilter.split('-').map(Number);
        const start = startOfMonth(new Date(yr, mo - 1));
        const end = endOfMonth(new Date(yr, mo - 1));
        if (!isWithinInterval(d, { start, end })) return false;
      }
      return true;
    });
  }, [orders, dateFilter, monthFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDateFilter = (val) => {setDateFilter(val);setMonthFilter('');setPage(1);};
  const handleMonthFilter = (val) => {setMonthFilter(val === 'all' ? '' : val);setDateFilter('');setPage(1);};

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your Milto Coffee operations</p>
      </div>

      <StockAlerts />
      <LowStockTable />
      <SalesTrendsChart orders={orders} />
      <BranchPerformanceChart orders={orders} branches={branches} />
      <DailyPerformanceChart orders={orders} />
      <TimePerformanceChart orders={orders} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) =>
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
        )}
      </div>

      {/* Push Notifications Broadcast */}
      <Card className="border-0 shadow-sm mb-6">
        

        
        

        
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <CardTitle className="text-lg">Order History</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="h-8 text-xs w-40" />
                
                <Select value={monthFilter || 'all'} onValueChange={handleMonthFilter}>
                  <SelectTrigger className="h-8 text-xs w-40">
                    <SelectValue placeholder="Filter by month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All months</SelectItem>
                    {monthOptions.map((m) =>
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {(dateFilter || monthFilter) &&
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => {setDateFilter('');setMonthFilter('');setPage(1);}}>
                    Clear
                  </Button>
                }
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pagedOrders.map((order) =>
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">#{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_name} · {order.branch_name} · {format(new Date(order.created_date), 'MMM d, h:mm a')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusColors[order.status]} border-0 text-xs`}>{order.status}</Badge>
                    <span className="text-sm font-semibold">{order.total} ETB</span>
                  </div>
                </div>
              )}
              {filteredOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No orders found</p>}
            </div>

            {/* Pagination */}
            {totalPages > 1 &&
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">{filteredOrders.length} orders · Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            }
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
                <span className="font-bold">{products.filter((p) => p.is_available !== false).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Active Branches</span>
                <span className="font-bold">{branches.filter((b) => b.is_active !== false).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}