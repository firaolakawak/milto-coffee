import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Star, Crown, Gem } from 'lucide-react';
import { motion } from 'framer-motion';

const tiers = [
  { name: 'Bronze', icon: Award, perk: 'Welcome rewards & birthday treat', color: 'text-amber-700', bg: 'bg-amber-100' },
  { name: 'Silver', icon: Star, perk: 'Free size upgrades & early access', color: 'text-slate-500', bg: 'bg-slate-100' },
  { name: 'Gold', icon: Crown, perk: 'Priority ordering & double points', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { name: 'Platinum', icon: Gem, perk: 'Exclusive releases & workshop invites', color: 'text-violet-600', bg: 'bg-violet-100' },
];

export default function LoyaltyPreview() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Rewards Program</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2 mb-4">
              Every Sip <span className="text-secondary italic">Rewards</span> You
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Join our loyalty program and earn Coffee Credits with every purchase. 
              Rise through membership tiers to unlock exclusive perks and experiences.
            </p>
            <Link to="/rewards">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8">
                Join Rewards
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl ${tier.bg} flex items-center justify-center mb-3`}>
                      <tier.icon className={`h-5 w-5 ${tier.color}`} />
                    </div>
                    <h3 className="font-semibold text-primary">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tier.perk}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}