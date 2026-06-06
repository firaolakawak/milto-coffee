import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Settings, ShoppingBag, Coins, Star, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import ProfileHeader from '@/components/profile/ProfileHeader';
import LoyaltyCard from '@/components/profile/LoyaltyCard';
import OrderHistoryList from '@/components/profile/OrderHistoryList';
import PointsHistoryList from '@/components/profile/PointsHistoryList';
import RedeemedCoinsList from '@/components/profile/RedeemedCoinsList';

const TABS = [
  { id: 'orders',   label: 'Orders',   icon: ShoppingBag },
  { id: 'loyalty',  label: 'Loyalty',  icon: Star },
  { id: 'coins',    label: 'Redeemed', icon: Coins },
  { id: 'payments', label: 'Points', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('en');
  const [favCoffee, setFavCoffee] = useState('');
  const [birthdayDay, setBirthdayDay] = useState('');
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setLanguage(user.preferred_language || 'en');
      setFavCoffee(user.favorite_coffee || '');
      setAvatarUrl(user.avatar_url || '');
      setBirthdayDay(user.birthday_day ? String(user.birthday_day) : '');
      setBirthdayMonth(user.birthday_month ? String(user.birthday_month) : '');
    }
  }, [user]);

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 50),
  });

  const { data: loyaltyAccounts = [] } = useQuery({
    queryKey: ['my-loyalty'],
    queryFn: () => base44.entities.LoyaltyAccount.list(),
  });

  const loyaltyAccount = loyaltyAccounts[0] || null;

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      phone,
      preferred_language: language,
      favorite_coffee: favCoffee,
    };
    // Only save birthday if not already set
    if (!user?.birthday_day && birthdayDay) updates.birthday_day = parseInt(birthdayDay);
    if (!user?.birthday_month && birthdayMonth) updates.birthday_month = parseInt(birthdayMonth);

    const updated = await base44.auth.updateMe(updates);
    // Sync local state from freshly saved user
    if (updated) {
      setBirthdayDay(updated.birthday_day ? String(updated.birthday_day) : birthdayDay);
      setBirthdayMonth(updated.birthday_month ? String(updated.birthday_month) : birthdayMonth);
    }
    toast.success('Profile updated!');
    setSaving(false);
  };

  const userWithAvatar = user ? { ...user, avatar_url: avatarUrl } : user;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <ProfileHeader
        user={userWithAvatar}
        onAvatarUpdate={(url) => setAvatarUrl(url)}
      />

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/60 rounded-xl p-1 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-1 justify-center
              ${activeTab === tab.id
                ? 'bg-white shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'}`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'orders' && <OrderHistoryList orders={orders} />}

      {activeTab === 'loyalty' && <LoyaltyCard account={loyaltyAccount} />}

      {activeTab === 'coins' && <RedeemedCoinsList orders={orders} />}

      {activeTab === 'payments' && <PointsHistoryList orders={orders} />}

      {activeTab === 'settings' && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm">Phone Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 9XX XXX XXX" className="mt-1" />
            </div>

            {/* Birthday */}
            <div>
              <Label className="text-sm">Birthday</Label>
              <p className="text-xs text-muted-foreground mb-2">Used for your free birthday drink 🎂</p>
              {user?.birthday_day && user?.birthday_month ? (
                <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-4 py-2.5 border border-border">
                  <span className="text-sm font-medium text-primary">
                    {['January','February','March','April','May','June','July','August','September','October','November','December'][user.birthday_month - 1]} {user.birthday_day}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">🔒 Cannot be changed</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Select value={birthdayMonth} onValueChange={setBirthdayMonth}>
                    <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>
                      {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={birthdayDay} onValueChange={setBirthdayDay}>
                    <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm">Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Favorite Coffee</Label>
              <Input value={favCoffee} onChange={e => setFavCoffee(e.target.value)} placeholder="e.g. Ethiopian Macchiato" className="mt-1" />
            </div>

            {/* Referral Code */}
            {loyaltyAccount?.referral_code && (
              <div>
                <Label className="text-sm">Your Referral Code</Label>
                <p className="text-xs text-muted-foreground mb-2">Share with friends — earn 100 points per successful referral</p>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3 border border-border">
                  <code className="font-mono font-bold text-primary text-base flex-1">{loyaltyAccount.referral_code}</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(loyaltyAccount.referral_code);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <Button onClick={handleSave} disabled={saving} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" className="w-full rounded-full text-destructive border-destructive/30" onClick={() => base44.auth.logout()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is permanent and cannot be undone. All your orders, rewards, and data will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      await base44.auth.updateMe({ deleted: true });
                      base44.auth.logout();
                    }}
                  >
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}