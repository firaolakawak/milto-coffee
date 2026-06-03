import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Stores() {
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => base44.entities.Branch.list(),
  });

  return (
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
  );
}