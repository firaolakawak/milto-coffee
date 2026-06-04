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
                <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">Our Locations</h1>
        <p className="text-muted-foreground mt-2">Find your nearest Milto Coffee branch</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No branches listed yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch, i) => (
            <motion.div key={branch.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                {branch.image_url && (
                  <div className="h-40 overflow-hidden">
                    <img src={branch.image_url} alt={branch.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-semibold text-lg text-primary">{branch.name}</h3>
                    <Badge variant={branch.is_active ? 'default' : 'secondary'} className={branch.is_active ? 'bg-accent text-accent-foreground' : ''}>
                      {branch.is_active ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{branch.address}{branch.city ? `, ${branch.city}` : ''}</span>
                    </div>
                    {branch.opening_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>{branch.opening_hours}</span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                    )}
                  </div>
                  {branch.estimated_wait_minutes > 0 && (
                    <p className="text-xs text-secondary font-medium mt-3">~{branch.estimated_wait_minutes} min wait</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
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