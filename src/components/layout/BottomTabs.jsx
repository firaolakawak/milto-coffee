import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, User } from 'lucide-react';
import { useTabsContext } from '@/lib/TabsContext';

const TABS = [
  { label: 'Home',   path: '/',        icon: Home },
  { label: 'Order',  path: '/order',   icon: UtensilsCrossed },
  { label: 'Orders', path: '/orders',  icon: ShoppingBag },
  { label: 'Profile',path: '/profile', icon: User },
];

export default function BottomTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { activeTab, setActiveTab, resetTabState } = useTabsContext();

  const handleTabClick = (path) => {
    if (activeTab === path) {
      // Reset to root if clicking active tab
      resetTabState(path);
      navigate(path);
    } else {
      setActiveTab(path);
      navigate(path);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {TABS.map(({ label, path, icon: Icon }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => handleTabClick(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                active ? 'text-secondary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-secondary' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}