import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold mb-3">Milto Coffee</h3>
            <p className="text-sm opacity-80">From Ethiopia's Finest Farms to Your Cup.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
            <div className="flex flex-col gap-1 text-sm opacity-80">
              <span>Menu</span><span>Locations</span><span>Rewards</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <div className="flex flex-col gap-1 text-sm opacity-80">
              <span>info@miltocoffee.com</span><span>+251911708622</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Follow Us</h4>
            <div className="flex flex-col gap-1 text-sm opacity-80">
              <span>Instagram</span><span>Facebook</span><span>TikTok</span>
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