import React from 'react';
import { Star, TrendingUp, Award, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TIERS = {
  bronze: { label: 'Bronze', next: 'Silver', nextAt: 500, color: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  silver: { label: 'Silver', next: 'Gold', nextAt: 2000, color: 'bg-slate-100 text-slate-700', bar: 'bg-slate-400' },
  gold:   { label: 'Gold',   next: 'Platinum', nextAt: 5000, color: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
  platinum: { label: 'Platinum', next: null, nextAt: null, color: 'bg-violet-100 text-violet-800', bar: 'bg-violet-500' },
};

export default function LoyaltyCard({ account }) {
  if (!account) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center text-muted-foreground text-sm py-10">
          <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          No loyalty account yet. Complete your first order to start earning points!
        </CardContent>
      </Card>
    );
  }

  const tier = TIERS[account.tier] || TIERS.bronze;
  const progress = tier.nextAt ? Math.min(100, ((account.total_points_earned || 0) / tier.nextAt) * 100) : 100;

  const stats = [
    { icon: Star, label: 'Available Points', value: account.points || 0, color: 'text-secondary' },
    { icon: TrendingUp, label: 'Total Earned', value: account.total_points_earned || 0, color: 'text-green-600' },
    { icon: Award, label: 'Total Orders', value: account.total_orders || 0, color: 'text-blue-600' },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">Loyalty Points</h3>
          <Badge className={`${tier.color} border-0 text-xs font-semibold`}>{tier.label}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {stats.map(s => (
            <div key={s.label} className="bg-muted/50 rounded-xl p-3 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg font-bold">{s.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {tier.next && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{tier.label}</span>
              <span>{tier.next} at {tier.nextAt?.toLocaleString()} pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${tier.bar} transition-all`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {account.referral_code && (
          <div className="mt-4 flex items-center gap-2 bg-secondary/10 rounded-lg px-3 py-2">
            <Gift className="h-4 w-4 text-secondary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Referral Code</p>
              <p className="font-mono font-bold text-sm text-primary">{account.referral_code}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}