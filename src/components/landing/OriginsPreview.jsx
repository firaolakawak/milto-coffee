import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';

const regions = [
  { name: 'Yirgacheffe', flavor: 'Floral, Citrus, Tea-like', altitude: '1,700-2,200m', color: 'from-green-800/80 to-green-600/60' },
  { name: 'Sidamo', flavor: 'Berry, Wine, Chocolate', altitude: '1,550-2,200m', color: 'from-amber-900/80 to-amber-700/60' },
  { name: 'Harar', flavor: 'Blueberry, Wine, Mocha', altitude: '1,500-2,100m', color: 'from-purple-900/80 to-purple-700/60' },
];

export default function OriginsPreview() {
  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-secondary font-medium text-sm uppercase tracking-wider">Our Heritage</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2">Coffee Origins</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Every cup tells a story of Ethiopian heritage, from farm to cup</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {regions.map((region, i) => (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer"
            >
            <img 
  src="/your-image.jpg"
  alt={region.name}
  className="absolute inset-0 w-full h-full object-cover"
/>

              <div className={`absolute inset-0 bg-gradient-to-t ${region.color}`} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Mountain className="h-4 w-4 opacity-80" />
                  <span className="text-xs opacity-80">{region.altitude}</span>
                </div>
                <h3 className="font-display text-2xl font-bold">{region.name}</h3>
                <p className="text-sm opacity-80 mt-1">{region.flavor}</p>
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