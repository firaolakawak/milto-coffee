import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PAGE_TITLES = {
  '/menu':            'Menu',
  '/cart':            'Cart',
  '/orders':          'My Orders',
  '/rewards':         'Rewards',
  '/profile':         'Profile',
  '/origins':         'Coffee Origins',
  '/stores':          'Our Stores',
  '/events':          'Events',
  '/about':           'About',
  '/contact':         'Contact',
};

const SUB_PAGES = ['/cart', '/orders', '/rewards', '/profile', '/origins', '/stores', '/events', '/about', '/contact'];

export default function MobileHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isSubPage = SUB_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (!isSubPage) return null;

  const title = Object.entries(PAGE_TITLES).find(([p]) => pathname === p || pathname.startsWith(p + '/'));

  return (
    <div
      className="md:hidden flex items-center h-14 px-2 bg-background/95 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h1 className="font-semibold text-base flex-1 text-center pr-9">{title?.[1] ?? 'Page'}</h1>
    </div>
  );
}