import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/70" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1447933601403-0c6688de566e)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
              ☕ Ethiopia's Finest
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              From Ethiopia's Finest Farms to{' '}
              <span className="text-secondary italic">Your Cup</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg leading-relaxed">
              Experience the birthplace of coffee through every sip. 
              Premium beans, traditional brewing, modern convenience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base px-8 rounded-full">
                  Order Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/stores">
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-base px-8 rounded-full">
                  <MapPin className="mr-2 h-5 w-5" /> Find a Store
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 gap-4"
        >
          <div className="w-64 h-80 rounded-2xl overflow-hidden shadow-2xl rotate-3">
            <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80" alt="Coffee" className="w-full h-full object-cover" />
          </div>
          <div className="w-64 h-80 rounded-2xl overflow-hidden shadow-2xl -rotate-2 mt-12">
            <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&q=80" alt="Ethiopian Coffee" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}