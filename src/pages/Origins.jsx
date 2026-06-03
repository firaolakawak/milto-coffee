import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mountain, Leaf, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const defaultOrigins = [
  { id: '1', region: 'Yirgacheffe', story: 'Known as the birthplace of coffee, Yirgacheffe produces some of the world\'s most distinctive and sought-after beans. The region\'s high altitude, rich soil, and careful processing create a cup with ethereal floral aromatics and bright citrus notes.', flavor_profile: 'Floral, Citrus, Tea-like, Bergamot', altitude: '1,700 - 2,200m', processing_method: 'Washed', farmer_info: 'Smallholder farmers organized in cooperatives' },
  { id: '2', region: 'Sidamo', story: 'The Sidamo region produces incredibly complex coffees that range from fruit-forward naturals to clean and balanced washed lots. The diverse microclimates create unique flavor profiles that have won numerous international awards.', flavor_profile: 'Berry, Wine, Chocolate, Spice', altitude: '1,550 - 2,200m', processing_method: 'Natural & Washed', farmer_info: 'Over 150,000 smallholder farmers' },
  { id: '3', region: 'Harar', story: 'One of the oldest coffee-producing regions in the world, Harar coffees are legendary for their wild, fruity character. These naturally processed beans develop intense blueberry and wine-like flavors unique to this ancient coffee city.', flavor_profile: 'Blueberry, Wine, Mocha, Dark Chocolate', altitude: '1,500 - 2,100m', processing_method: 'Natural (Sun-dried)', farmer_info: 'Traditional farming methods passed down generations' },
  { id: '4', region: 'Limu', story: 'The lush forests of Limu provide the perfect shade canopy for coffee cultivation. Known for producing exceptionally well-balanced coffees with a distinctive winey character and pleasant sweetness.', flavor_profile: 'Wine, Spice, Sweet, Balanced', altitude: '1,400 - 2,000m', processing_method: 'Washed', farmer_info: 'Forest-grown shade coffee by smallholders' },
  { id: '5', region: 'Guji', story: 'A relatively new addition to the specialty coffee map, Guji has quickly gained recognition for producing exceptional quality. The region\'s unique terroir creates coffees with remarkable complexity and vibrant fruit notes.', flavor_profile: 'Peach, Floral, Jasmine, Honey', altitude: '1,800 - 2,300m', processing_method: 'Natural & Honey', farmer_info: 'Indigenous Oromo farmers using traditional methods' },
];

export default function Origins() {
  const { data: origins = [], isLoading } = useQuery({
    queryKey: ['origins'],
    queryFn: () => base44.entities.CoffeeOrigin.list(),
  });

  const displayOrigins = origins.length > 0 ? origins : defaultOrigins;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <span className="text-secondary font-medium text-sm uppercase tracking-wider">Ethiopian Heritage</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-primary mt-2">Coffee Origins</h1>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Discover the rich regions where our beans are grown, each with a unique story and flavor</p>
      </div>

      {isLoading ? (
        <div className="space-y-8">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-8">
          {displayOrigins.map((origin, i) => (
            <motion.div
              key={origin.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-3">
                    <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground flex flex-col justify-center">
                      <h2 className="font-display text-3xl font-bold mb-2">{origin.region}</h2>
                      {origin.region_am && <p className="text-sm opacity-80 mb-4">{origin.region_am}</p>}
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mountain className="h-4 w-4 opacity-70" />
                          <span>{origin.altitude}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Droplets className="h-4 w-4 opacity-70" />
                          <span>{origin.processing_method}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Leaf className="h-4 w-4 opacity-70" />
                          <span>{origin.flavor_profile}</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 p-8">
                      <p className="text-muted-foreground leading-relaxed mb-4">{origin.story}</p>
                      {origin.farmer_info && (
                        <div className="bg-secondary/10 rounded-xl p-4">
                          <p className="text-sm font-medium text-primary">About the Farmers</p>
                          <p className="text-sm text-muted-foreground mt-1">{origin.farmer_info}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {origin.flavor_profile?.split(',').map(f => (
                          <Badge key={f} variant="secondary" className="rounded-full">{f.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}