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
              <a href="/menu" className="hover:opacity-100 transition-opacity">Menu</a>
              <a href="/stores" className="hover:opacity-100 transition-opacity">Locations</a>
              <a href="/rewards" className="hover:opacity-100 transition-opacity">Rewards</a>
              <a href="/about" className="hover:opacity-100 transition-opacity">About Us</a>
              <a href="/contact" className="hover:opacity-100 transition-opacity">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <div className="flex flex-col gap-1 text-sm opacity-80">
              <a href="mailto:info@miltocoffe.com" className="hover:opacity-100 transition-opacity">info@miltocoffe.com</a>
              <a href="tel:+251911708622" className="hover:opacity-100 transition-opacity">+251911708622</a>
            </div>
          </div>
          <div>
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