import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Star, Crown, Gem, Gift, CheckCircle2 } from 'lucide-react';

const tiers = [
  { name: 'Bronze', icon: Award, color: 'text-amber-700', bg: 'bg-amber-50', desc: 'Start earning' },
  { name: 'Silver', icon: Star, color: 'text-slate-500', bg: 'bg-slate-50', desc: '500+ pts' },
  { name: 'Gold', icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-50', desc: '1,500+ pts' },
  { name: 'Platinum', icon: Gem, color: 'text-violet-600', bg: 'bg-violet-50', desc: '3,000+ pts' },
];

const benefits = [
  'Earn 1 Credit per ETB 1 spent',
  'Exclusive member-only promotions',
  'Birthday free drink every year',
  'Priority ordering for Gold & Platinum',
  'Invite friends & earn bonus points',
];

function generateReferralCode(name) {
  const prefix = (name || 'MILTO').replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

export default function JoinRewardForm({ onJoined }) {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newCode = generateReferralCode(user?.full_name);
    await base44.entities.LoyaltyAccount.create({
      user_name: user?.full_name || '',
      points: 50,
      total_points_earned: 50,
      tier: 'bronze',
      total_orders: 0,
      referral_code: newCode,
      ...(referralCode.trim() && { referred_by: referralCode.trim().toUpperCase() }),
      badges: ['early_member'],
    });
    setJoined(true);
    setLoading(false);
    setTimeout(() => onJoined?.(), 1800);
  };

  if (joined) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-primary mb-2">Welcome to Milto Rewards!</h2>
        <p className="font-body text-muted-foreground">You've received 50 welcome bonus points 🎉</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <p className="font-display text-lg text-secondary italic mb-2">Your Coffee Journey, Rewarded</p>
        <h1 className="font-heading text-4xl font-bold text-primary mb-3">Join Milto Rewards</h1>
        <p className="font-body text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Earn Coffee Credits on every order. Unlock exclusive perks as you climb from Bronze to Platinum.
        </p>
      </div>

      {/* Tier ladder */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {tiers.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.name} className={`${t.bg} rounded-xl p-3 text-center border border-border/50`}>
              <div className="flex justify-center mb-2">
                <Icon className={`h-6 w-6 ${t.color}`} />
              </div>
              <p className="font-heading text-xs font-semibold text-primary">{t.name}</p>
              <p className="font-body text-xs text-muted-foreground">{t.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Benefits card */}
        <Card className="border-0 shadow-sm bg-muted/40">
          <CardContent className="p-5">
            <h3 className="font-heading text-base font-semibold text-primary mb-4">What You Get</h3>
            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Gift className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-border">
              <p className="font-heading text-sm font-semibold text-secondary">🎉 Welcome Bonus</p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Get <span className="font-semibold text-primary">50 Coffee Credits</span> just for joining — on us.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sign-up form */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <h3 className="font-heading text-base font-semibold text-primary mb-4">Complete Your Profile</h3>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <Label className="font-body text-sm font-medium mb-1.5 block">Full Name</Label>
                <Input value={user?.full_name || ''} disabled className="bg-muted font-body" />
              </div>
              <div>
                <Label className="font-body text-sm font-medium mb-1.5 block">Email</Label>
                <Input value={user?.email || ''} disabled className="bg-muted font-body" />
              </div>
              <div>
                <Label className="font-body text-sm font-medium mb-1.5 block">
                  Referral Code{' '}
                  <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g. ABEL2024"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value)}
                  className="font-mono uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                  maxLength={10}
                />
              </div>
              <Button
                type="submit"
                className="w-full font-body font-medium"
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join Milto Rewards — Free'}
              </Button>
              <p className="font-body text-xs text-muted-foreground text-center leading-relaxed">
                By joining, you accept our{' '}
                <span className="underline cursor-pointer">rewards program terms</span>.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}