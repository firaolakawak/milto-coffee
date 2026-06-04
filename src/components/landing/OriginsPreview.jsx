import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const fallbackColors = [
  'from-green-800/80 to-green-600/60',
  'from-amber-900/80 to-amber-700/60',
  'from-purple-900/80 to-purple-700/60',
];

export default function OriginsPreview() {
  const { data: origins = [] } = useQuery({
    queryKey: ['origins-preview'],
    queryFn: () => base44.entities.CoffeeOrigin.list(),
  });

  const displayed = origins.slice(0, 3);

  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-secondary font-medium text-sm uppercase tracking-wider">Our Heritage</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2">Coffee Origins</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Every cup tells a story of Ethiopian heritage, from farm to cup</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayed.map((origin, i) => (
            <motion.div
              key={origin.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer"
            >
              {/* 1. Background image */}
              {origin.image_url ? (
                <img
                  src={origin.image_url}
                  alt={origin.region}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-primary/40" />
              )}
              {/* 2. Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${fallbackColors[i % fallbackColors.length]}`} />
              {/* 3. Text content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                {origin.altitude && (
                  <div className="flex items-center gap-2 mb-2">
                    <Mountain className="h-4 w-4 opacity-80" />
                    <span className="text-xs opacity-80">{origin.altitude}</span>
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold">{origin.region}</h3>
                <p className="text-sm opacity-80 mt-1">{origin.flavor_profile}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/origins">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Explore All Origins <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}