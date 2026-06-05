import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Crown, Gem, Gift, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import JoinRewardForm from '@/components/rewards/JoinRewardForm';
import PushNotificationManager from '@/components/PushNotificationManager';

const tierConfig = {
  bronze: { icon: Award, color: 'text-amber-700', bg: 'bg-amber-100', next: 'silver', pointsNeeded: 500 },
  silver: { icon: Star, color: 'text-slate-500', bg: 'bg-slate-100', next: 'gold', pointsNeeded: 1500 },
  gold: { icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100', next: 'platinum', pointsNeeded: 3000 },
  platinum: { icon: Gem, color: 'text-violet-600', bg: 'bg-violet-100', next: null, pointsNeeded: null },
};

const perks = [
  { tier: 'Bronze', items: ['Welcome 50 bonus points', 'Birthday free drink', 'Access to member prices'] },
  { tier: 'Silver', items: ['Free size upgrades', 'Early access to new drinks', 'Double points weekends'] },
  { tier: 'Gold', items: ['Priority ordering', 'Free pastry monthly', 'Triple points events'] },
  { tier: 'Platinum', items: ['Exclusive coffee releases', 'Roasting workshop invites', 'Personal barista recommendations'] },
];

const redemptionRules = [
  { title: 'Point Conversion', description: '1 Coffee Credit = ETB 1 off your order' },
  { title: 'Minimum Redemption', description: 'Minimum 50 points required for redemption' },
  { title: 'No Expiration', description: 'Your points never expire as long as your account is active' },
  { title: 'Redemption Method', description: 'Select "Redeem Points" at checkout and apply to your order' },
  { title: 'Multiple Usage', description: 'Use points for drinks, food, pastries, and merchandise' },
  { title: 'Restrictions', description: 'Points cannot be transferred, refunded, or converted to cash' },
];

const referralRules = [
  { title: 'Referral Bonus', description: 'Earn 100 points when a referred friend makes their first purchase' },
  { title: 'Friend Benefit', description: 'Your referred friend gets 50 welcome bonus points' },
  { title: 'Unlimited Referrals', description: 'No limit on how many friends you can refer' },
  { title: 'Code Validity', description: 'Referral code must be used during signup registration' },
  { title: 'Active Account', description: 'Both referrer and referee must maintain active accounts' },
  { title: 'First Purchase Required', description: 'Bonus awarded after referred friend completes first order' },
];

const tandcPoints = [
  'Points are earned at 1 point per ETB 1 spent on eligible purchases',
  'Loyalty program is non-transferable and personal to your account',
  'Milto Coffee reserves the right to modify rewards program terms with 30 days notice',
  'Fraudulent activity or policy violations will result in account suspension',
  'Lost referral codes cannot be recovered - store safely',
  'Points are valid for registered and active members only',
  'Redemption is final and cannot be reversed',
  'Program participation implies acceptance of these terms',
];

export default function Rewards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());
  const [copiedCode, setCopiedCode] = useState(false);
  
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['loyalty-account'],
    queryFn: () => base44.entities.LoyaltyAccount.filter({ created_by_id: user?.id }),
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['loyalty-notifications'],
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.id }, '-created_date', 10),
    enabled: !!user,
  });

  const account = accounts[0] || { points: 0, total_points_earned: 0, tier: 'bronze', total_orders: 0, badges: [], referral_code: null };


  const tier = tierConfig[account.tier] || tierConfig.bronze;
  const TierIcon = tier.icon;
  const progress = tier.pointsNeeded ? (account.total_points_earned / tier.pointsNeeded) * 100 : 100;

  const recentNotifications = notifications
    .filter(n => ['general'].includes(n.type) && !dismissedNotifications.has(n.id))
    .slice(0, 3);

  const dismissNotification = (id) => {
    setDismissedNotifications(prev => new Set(prev).add(id));
  };

  const copyReferralCode = () => {
    if (account.referral_code) {
      navigator.clipboard.writeText(account.referral_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!accountsLoading && user && accounts.length === 0) {
    return (
      <JoinRewardForm
        onJoined={() => queryClient.invalidateQueries({ queryKey: ['loyalty-account'] })}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary">Rewards & Loyalty</h1>
        <p className="font-body text-muted-foreground mt-1">Earn Coffee Credits with every purchase</p>
      </div>

      {/* Recent Notifications */}
      {recentNotifications.length > 0 && (
        <div className="space-y-2 mb-6">
          {recentNotifications.map(notif => (
            <Card key={notif.id} className="border-0 shadow-sm bg-secondary/10 border-l-4 border-secondary">
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Bell className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-primary">{notif.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => dismissNotification(notif.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}



      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/90 text-primary-foreground mb-8 overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm opacity-80">Your Balance</p>
              <p className="text-4xl font-bold mt-1">{account.points}</p>
              <p className="text-sm opacity-70 mt-1">Coffee Credits</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${tier.bg} flex items-center justify-center`}>
              <TierIcon className={`h-7 w-7 ${tier.color}`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-secondary text-secondary-foreground capitalize">{account.tier} Member</Badge>
            {tier.next && (
              <span className="text-xs opacity-70">
                {tier.pointsNeeded - account.total_points_earned} points to {tier.next}
              </span>
            )}
          </div>
          {tier.pointsNeeded && (
            <Progress value={Math.min(100, progress)} className="mt-4 h-2 bg-primary-foreground/20" />
          )}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-primary-foreground/20">
            <div className="text-center"><p className="text-xl font-bold">{account.total_orders}</p><p className="text-xs opacity-70">Orders</p></div>
            <div className="text-center"><p className="text-xl font-bold">{account.total_points_earned}</p><p className="text-xs opacity-70">Total Earned</p></div>
            <div className="text-center"><p className="text-xl font-bold">{account.badges?.length || 0}</p><p className="text-xs opacity-70">Badges</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <PushNotificationManager />
      </div>

      <h2 className="font-heading text-xl font-semibold text-primary mb-4">Membership Tiers</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {perks.map(p => (
          <Card key={p.tier} className={`border-0 shadow-sm ${account.tier === p.tier.toLowerCase() ? 'ring-2 ring-secondary' : ''}`}>
            <CardContent className="p-5">
              <h3 className="font-semibold text-primary mb-3">{p.tier}</h3>
              <ul className="space-y-2">
                {p.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Gift className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* About Rewards */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-semibold text-primary mb-4">About Our Rewards Program</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Milto Coffee's loyalty program rewards you for every purchase. Earn Coffee Credits with each transaction, unlock exclusive tier benefits, and enjoy special promotions. As you climb through our membership tiers (Bronze, Silver, Gold, Platinum), you'll gain access to premium perks, exclusive events, and personalized offers designed to enhance your coffee experience.
          </p>
        </CardContent>
      </Card>

      {/* Redemption Rules */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-semibold text-primary mb-4">Redemption Rules</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {redemptionRules.map((rule, idx) => (
              <AccordionItem key={idx} value={`redemption-${idx}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="text-sm font-semibold text-primary text-left">{rule.title}</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  {rule.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Referral Rules */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-semibold text-primary mb-4">Referral Rules</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {referralRules.map((rule, idx) => (
              <AccordionItem key={idx} value={`referral-${idx}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="text-sm font-semibold text-primary text-left">{rule.title}</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  {rule.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card className="border-0 shadow-sm mb-8">
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-semibold text-primary mb-4">Terms & Conditions</h2>
          <ul className="space-y-3">
            {tandcPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
            Last updated: June 2026. For questions about our rewards program, contact support@miltocoffe.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}