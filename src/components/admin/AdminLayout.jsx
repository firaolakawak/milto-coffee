import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Store, Coffee, ClipboardList, Award, Calendar, Megaphone, ArrowLeft, Leaf, PackageSearch } from 'lucide-react';

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
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border overflow-y-auto">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/6a2091b55874dccfc09ef00c/2307f935d_milto.png" alt="Milto Coffee"
              className="h-7 w-auto"
            />
            <span className="font-display font-bold text-lg">Milto Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${pathname === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                  }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Button>
            </Link>
          ))}
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
          {navItems.slice(0, 5).map(item => (
            <Link key={item.path} to={item.path}>
              <Button variant="ghost" size="sm" className={`flex-col gap-0.5 h-auto py-1.5 text-sidebar-foreground ${pathname === item.path ? 'text-sidebar-primary' : 'opacity-60'}`}>
                <item.icon className="h-4 w-4" />
                <span className="text-[10px]">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}