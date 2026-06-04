import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Clock, Phone } from 'lucide-react';

export default function AppLayout() {
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-footer'],
    queryFn: () => base44.entities.Branch.filter({ is_active: true }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-display text-lg font-bold mb-3">Milto Coffee</h3>
            <p className="text-sm opacity-80">From Ethiopia's Finest Farms to Your Cup.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
            <div className="flex flex-col gap-1 text-sm opacity-80">
              <a href="/menu" className="hover:opacity-100 transition-opacity">Menu</a>
              <a href="/stores" className="hover:opacity-100 transition-opacity">Locations</a>
              <a href="/rewards" className="hover:opacity-100 transition-opacity">Rewards</a>
              <a href="/about" className="hover:opacity-100 transition-opacity">About Us</a>
              <a href="/contact" className="hover:opacity-100 transition-opacity">Contact</a>
            </div>
          </div>

          {/* Our Locations */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold mb-3 text-sm">Our Locations</h4>
            {branches.length === 0 ? (
              <p className="text-sm opacity-60">No locations available.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {branches.map(branch => (
                  <div key={branch.id} className="text-sm opacity-80 space-y-1">
                    <p className="font-semibold opacity-100 text-primary-foreground">{branch.name}</p>
                    {(branch.address || branch.city) && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70" />
                        <span>{branch.address}{branch.city ? `, ${branch.city}` : ''}</span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <a href={`tel:${branch.phone}`} className="hover:opacity-100 transition-opacity">{branch.phone}</a>
                      </div>
                    )}
                    {branch.opening_hours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span>{branch.opening_hours}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact + Social */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <div className="flex flex-col gap-1 text-sm opacity-80 mb-5">
              <a href="mailto:info@miltocoffe.com" className="hover:opacity-100 transition-opacity">info@miltocoffe.com</a>
              <a href="tel:+251911708622" className="hover:opacity-100 transition-opacity">+251 911 708 622</a>
            </div>
            <h4 className="font-semibold mb-3 text-sm">Follow Us</h4>
            <div className="flex flex-col gap-1 text-sm opacity-80">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Facebook</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">TikTok</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-primary-foreground/20 text-center text-xs opacity-60">
          © 2026 Milto Coffee. All rights reserved.
        </div>
      </footer>
    </div>
  );
}