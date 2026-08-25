import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MobileSheetSelect from '@/components/ui/MobileSheetSelect';
import { CheckCircle2 } from 'lucide-react';

function generateReferralCode(name) {
  const prefix = (name || 'MILTO').replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

export default function JoinRewardForm({ onJoined }) {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [birthdayDay, setBirthdayDay] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);

    try {
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

      // Save birthday if provided
      if (birthdayMonth && birthdayDay) {
        await base44.auth.updateMe({
          birthday_day: parseInt(birthdayDay),
          birthday_month: parseInt(birthdayMonth),
        });
      }

      setJoined(true);
      setTimeout(() => onJoined?.(), 1800);
    } catch (err) {
      console.error('Join rewards failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (joined) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-primary mb-2">Welcome to Milto Rewards!</h2>
        <p className="text-muted-foreground">You've received 50 welcome bonus points 🎉</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8">

      {/* Logo & Hero */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg">
          <span className="text-4xl">☕</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-primary text-center">Join now</h1>
        <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
          Join Milto Rewards to collect Stars and earn free drinks! Manage your account, track your Rewards and other useful stuff. Join now to get started.
        </p>
        <p className="text-xs text-muted-foreground mt-2">* Required fields are marked with an asterisk*</p>
      </div>

      <form onSubmit={handleJoin} className="space-y-6">

        {/* Personal Information */}
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground mb-3">Personal Information</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">* First name</Label>
              <Input
                value={(user?.full_name || '').split(' ')[0]}
                disabled
                className="mt-1 bg-muted/50"
              />
            </div>
            <div>
              <Label className="text-sm">* Last name</Label>
              <Input
                value={(user?.full_name || '').split(' ').slice(1).join(' ')}
                disabled
                className="mt-1 bg-muted/50"
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Account Security */}
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground mb-3">Account security</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">* Email</Label>
              <Input value={user?.email || ''} disabled className="mt-1 bg-muted/50" />
              <p className="text-xs text-muted-foreground mt-1">This will be your username</p>
            </div>
            <div>
              <Label className="text-sm">Referral Code <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                placeholder="e.g. ABEL2024"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value)}
                className="mt-1 font-mono uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Birthday */}
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground mb-1">Your birthday (optional)</h2>
          <p className="text-xs text-muted-foreground mb-3">Get a free drink on your birthday 🎂</p>
          <div className="grid grid-cols-2 gap-3">
            <MobileSheetSelect
              value={birthdayMonth}
              onValueChange={setBirthdayMonth}
              placeholder="Month"
              options={['January','February','March','April','May','June','July','August','September','October','November','December'].map((label, i) => ({ value: String(i + 1), label }))}
            />
            <MobileSheetSelect
              value={birthdayDay}
              onValueChange={setBirthdayDay}
              placeholder="Day"
              options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
            />
          </div>
        </div>

        <hr className="border-border" />

        {/* Terms */}
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground mb-3">Terms of Use</h2>
          <div className="space-y-2 text-xs text-muted-foreground mb-4">
            <p><span className="underline cursor-pointer text-primary">FAQ</span> ↗</p>
            <p><span className="underline cursor-pointer text-primary">Privacy Statement</span> ↗</p>
            <p><span className="underline cursor-pointer text-primary">Terms of Use</span> ↗</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              By tapping "Join Rewards" you accept and agree to the following terms and policies:{' '}
              <span className="underline cursor-pointer">Milto Rewards Terms and Conditions</span> and{' '}
              <span className="underline cursor-pointer">Terms of Use</span>.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 text-base font-semibold"
          disabled={loading || !agreed}
        >
          {loading ? 'Joining...' : 'Join Rewards'}
        </Button>

      </form>
    </div>
  );
}
