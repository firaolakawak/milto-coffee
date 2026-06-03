import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Globe, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('en');
  const [favCoffee, setFavCoffee] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setLanguage(user.preferred_language || 'en');
      setFavCoffee(user.favorite_coffee || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ phone, preferred_language: language, favorite_coffee: favCoffee });
    toast.success('Profile updated!');
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-primary mb-6">My Profile</h1>
      
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="h-7 w-7 text-secondary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user?.full_name || 'Guest'}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
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
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full rounded-full text-destructive border-destructive/30" onClick={() => base44.auth.logout()}>
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}