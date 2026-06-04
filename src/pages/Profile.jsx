import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Settings, ShoppingBag, Coins, Star, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import ProfileHeader from '@/components/profile/ProfileHeader';
import LoyaltyCard from '@/components/profile/LoyaltyCard';
import OrderHistoryList from '@/components/profile/OrderHistoryList';
import PaymentHistoryList from '@/components/profile/PaymentHistoryList';
import RedeemedCoinsList from '@/components/profile/RedeemedCoinsList';

const TABS = [
  { id: 'orders',   label: 'Orders',   icon: ShoppingBag },
  { id: 'loyalty',  label: 'Loyalty',  icon: Star },
  { id: 'coins',    label: 'Redeemed', icon: Coins },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('en');
  const [favCoffee, setFavCoffee] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setLanguage(user.preferred_language || 'en');
      setFavCoffee(user.favorite_coffee || '');
      setAvatarUrl(user.avatar_url || '');
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
    await base44.auth.updateMe({ phone, preferred_language: language, favorite_coffee: favCoffee });
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

      {activeTab === 'payments' && <PaymentHistoryList orders={orders} />}

      {activeTab === 'settings' && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm">Phone Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 9XX XXX XXX" className="mt-1" />
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
            <Button onClick={handleSave} disabled={saving} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" className="w-full rounded-full text-destructive border-destructive/30" onClick={() => base44.auth.logout()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}