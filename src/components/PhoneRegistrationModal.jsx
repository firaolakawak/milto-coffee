import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileSheetSelect } from '@/components/ui/MobileSheetSelect';
import { Phone, Coffee, Loader2 } from 'lucide-react';

const coffeeOptions = [
  'Espresso',
  'Cappuccino',
  'Latte',
  'Macchiato',
  'Cold Brew',
  'Traditional Ethiopian Coffee',
  'Specialty Blend',
  'Not yet decided',
];

export default function PhoneRegistrationModal({ open, onComplete }) {
  const [phone, setPhone] = useState('');
  const [favoriteCoffee, setFavoriteCoffee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (e) => {
    // Only allow +, digits, spaces, and dashes
    const val = e.target.value.replace(/[^\d+\s\-]/g, '');
    setPhone(val);
  };

  const validatePhone = (p) => {
    const digits = p.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 15;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (9–15 digits)');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await base44.auth.updateMe({
        phone,
        favorite_coffee: favoriteCoffee || null,
      });
      onComplete();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" closeButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-secondary" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            We need your phone number to send order updates and special offers
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="phone"
                type="tel"
                placeholder="+971 50 123 4567"
                value={phone}
                onChange={handlePhoneChange}
                className="pl-10"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee" className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-secondary" />
              Favorite Coffee
            </Label>
            <MobileSheetSelect
              value={favoriteCoffee}
              onValueChange={setFavoriteCoffee}
              placeholder="Select your favorite coffee"
              id="coffee"
              options={coffeeOptions.map(coffee => ({ value: coffee, label: coffee }))}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !phone.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}