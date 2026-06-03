import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Crown, Gem, Users } from 'lucide-react';

const tierConfig = {
  bronze: { icon: Award, color: 'text-amber-700', bg: 'bg-amber-100' },
  silver: { icon: Star, color: 'text-slate-500', bg: 'bg-slate-100' },
  gold: { icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  platinum: { icon: Gem, color: 'text-violet-600', bg: 'bg-violet-100' },
};

export default function LoyaltyAdmin() {
  const { data: accounts = [] } = useQuery({
    queryKey: ['admin-loyalty'],
    queryFn: () => base44.entities.LoyaltyAccount.list('-total_points_earned', 100),
  });

  const tierCounts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  accounts.forEach(a => { tierCounts[a.tier || 'bronze']++; });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Loyalty Program</h1>
        <p className="text-sm text-muted-foreground">Manage members and reward tiers</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(tierConfig).map(([tier, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Card key={tier} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tierCounts[tier]}</p>
                  <p className="text-xs text-muted-foreground capitalize">{tier} Members</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> All Members</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No loyalty members yet</p>
          ) : (
            <div className="space-y-3">
              {accounts.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{a.user_name || 'Member'}</p>
                    <p className="text-xs text-muted-foreground">{a.total_orders} orders · {a.total_points_earned} total points</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize text-xs">{a.tier || 'bronze'}</Badge>
                    <span className="font-bold text-sm text-secondary">{a.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}