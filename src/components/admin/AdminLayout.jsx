import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Store, Coffee, ClipboardList, Award, Calendar, Megaphone, ArrowLeft, Leaf, PackageSearch, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const navItems = [
{ path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
{ path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
{ path: '/admin/products', icon: Coffee, label: 'Products' },
{ path: '/admin/promotions', icon: Megaphone, label: 'Promotions' },
{ path: '/admin/stock', icon: PackageSearch, label: 'Stock Inventory' },
{ path: '/admin/loyalty', icon: Award, label: 'Loyalty' },
{ path: '/admin/events', icon: Calendar, label: 'Events' },

{ path: '/admin/branches', icon: Store, label: 'Branches' },
{ path: '/admin/origins', icon: Leaf, label: 'Origins' },
{ path: '/admin/push', icon: Bell, label: 'Push Notifications' }];


export default function AdminLayout() {
  const { pathname } = useLocation();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 15000,
  });
  const activeOrderCount = orders.filter(o => ['received', 'preparing', 'ready'].includes(o.status)).length;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border overflow-y-auto">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/6a2091b55874dccfc09ef00c/2307f935d_milto.png" alt="Milto Coffee"
              className="h-10 w-auto" />
            
            <span className="font-display font-bold text-lg">Milto Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 bg-[hsl(var(--primary))]">
          {navItems.map((item) => {
            const isOrders = item.path === '/admin/orders';
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${pathname === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                >
                  <span className="relative">
                    <item.icon className="h-4 w-4" />
                    {isOrders && activeOrderCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}
                  </span>
                  {item.label}
                  {isOrders && activeOrderCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">{activeOrderCount}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to App
            </Button>
          </Link>
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border px-2 py-1">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const isOrders = item.path === '/admin/orders';
            return (
              <Link key={item.path} to={item.path}>
                <Button variant="ghost" size="sm" className={`flex-col gap-0.5 h-auto py-1.5 text-sidebar-foreground ${pathname === item.path ? 'text-sidebar-primary' : 'opacity-60'}`}>
                  <span className="relative">
                    <item.icon className="h-4 w-4" />
                    {isOrders && activeOrderCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}
                  </span>
                  <span className="text-[10px]">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <Outlet />
      </main>
    </div>);

}