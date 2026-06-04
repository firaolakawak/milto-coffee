import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, User } from 'lucide-react';

const TABS = [
  { label: 'Home',   path: '/',        icon: Home },
  { label: 'Menu',   path: '/menu',    icon: UtensilsCrossed },
  { label: 'Orders', path: '/orders',  icon: ShoppingBag },
  { label: 'Profile',path: '/profile', icon: User },
];

export default function BottomTabs() {
  const { pathname } = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {TABS.map(({ label, path, icon: Icon }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                active ? 'text-secondary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-secondary' : ''}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}