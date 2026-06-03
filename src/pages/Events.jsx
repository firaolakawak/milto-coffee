import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const typeLabels = {
  tasting: 'Coffee Tasting',
  brewing_workshop: 'Brewing Workshop',
  roasting_workshop: 'Roasting Workshop',
  community: 'Community Event',
  promotion: 'Promotion',
};

export default function Events() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.filter({ is_active: true }, '-date', 50),
  });

  const handleRegister = async (event) => {
    await base44.entities.Event.update(event.id, { registered_count: (event.registered_count || 0) + 1 });
    toast.success(`Registered for ${event.title}!`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">Events & Workshops</h1>
        <p className="text-muted-foreground mt-2">Join our community experiences</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No upcoming events. Stay tuned!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {event.image_url && (
                  <div className="h-40 overflow-hidden"><img src={event.image_url} alt="" className="w-full h-full object-cover" /></div>
                )}
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2 text-xs">{typeLabels[event.type] || event.type}</Badge>
                  <h3 className="font-display font-semibold text-lg text-primary">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(event.date), 'MMM d, yyyy · h:mm a')}</span>
                    {event.branch_name && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.branch_name}</span>}
                    {event.capacity && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.registered_count || 0}/{event.capacity}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-secondary">{event.price ? `${event.price} ETB` : 'Free'}</span>
                    <Button size="sm" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => handleRegister(event)}>
                      Register <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
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