import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturedCoffees() {
  const { data: products = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => base44.entities.Product.filter({ is_featured: true }, '-created_date', 4),
  });

  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Ethiopian Macchiato', category: 'macchiato', price: 65, description: 'Rich espresso with silky steamed milk foam' },
    { id: '2', name: 'Yirgacheffe Pour Over', category: 'specialty', price: 85, description: 'Floral notes with bright citrus finish' },
    { id: '3', name: 'Jebena Traditional', category: 'traditional', price: 55, description: 'Brewed in the traditional Ethiopian ceremony style' },
    { id: '4', name: 'Cold Brew Harar', category: 'cold_brew', price: 75, description: 'Smooth, chocolate-forward cold extraction' },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-secondary font-medium text-sm uppercase tracking-wider">Our Menu</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2">Featured Coffees</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">Handcrafted with beans sourced directly from Ethiopian farmers</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-6xl">☕</span>
                  )}
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="text-xs mb-2">{product.category?.replace('_', ' ')}</Badge>
                  <h3 className="font-display font-semibold text-lg text-primary">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-secondary">{product.price} ETB</span>
                    <div className="flex items-center gap-1 text-secondary">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-medium">4.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/menu">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              View Full Menu <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}