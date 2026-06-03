import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, ShoppingCart, Coffee, User, X } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';

const navLinks = [
  { label: 'Menu', path: '/menu' },
  { label: 'Origins', path: '/origins' },
  { label: 'Stores', path: '/stores' },
  { label: 'Rewards', path: '/rewards' },
  { label: 'Events', path: '/events' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Coffee className="h-7 w-7 text-secondary" />
          <span className="font-display text-xl font-bold text-primary">Milto Coffee</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}>
              <Button
                variant={pathname === link.path ? 'secondary' : 'ghost'}
                size="sm"
                className="text-sm font-medium"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-secondary text-secondary-foreground text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
          
          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden md:block">
              <Button variant="outline" size="sm">Admin</Button>
            </Link>
          )}

          <Link to="/profile" className="hidden md:block">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} onClick={() => setOpen(false)}>
                    <Button variant={pathname === link.path ? 'secondary' : 'ghost'} className="w-full justify-start">
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Link to="/profile" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Profile</Button>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">Admin Dashboard</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}