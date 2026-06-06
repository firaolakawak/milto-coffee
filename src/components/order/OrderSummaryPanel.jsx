import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Minus, Trash2, ShoppingBag, MapPin, CreditCard,
  Store, Truck, Tag, X, CheckCircle2, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'telebirr', label: 'Telebirr' },
  { value: 'cbe_birr', label: 'CBE Birr' },
  { value: 'amole', label: 'Amole' },
  { value: 'cash', label: 'Cash' },
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
];

export default function OrderSummaryPanel({
  items, updateQuantity, removeItem, itemCount,
  subtotal, total, discount, appliedPromo,
  promoLoading, promoError, setPromoError, removePromo, onApplyPromo,
  branches, selectedBranch, setSelectedBranch,
  deliveryType, setDeliveryType, deliveryAddress, setDeliveryAddress,
  paymentMethod, setPaymentMethod,
  notes, setNotes,
  isDelivery, orderTotal, deliveryFee,
  submitting, onPlaceOrder, onBrowseMenu,
}) {
  const [promoInput, setPromoInput] = useState('');
  const [showDetails, setShowDetails] = useState(true);

  const handleApply = () => {
    onApplyPromo(promoInput);
    setPromoInput('');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
        <ShoppingBag className="h-14 w-14 text-muted-foreground/25" />
        <div>
          <p className="font-semibold text-primary">Your order is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add items from the menu to get started</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={onBrowseMenu}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b bg-background shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-primary">Your Order</h2>
          <span className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Items */}
        <div className="bg-background border-b">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span>Order Items</span>
            {showDetails ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showDetails && (
            <div className="px-4 pb-3 space-y-3">
              {items.map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.image_url
                      ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-lg">☕</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.size}{item.customizations?.milk && item.customizations.milk !== 'None' ? ` · ${item.customizations.milk}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="w-5 h-5 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus className="h-2.5 w-2.5" />
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="w-5 h-5 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold text-secondary w-14 text-right">{item.unitPrice * item.quantity} ETB</span>
                    <button onClick={() => removeItem(item.key)} className="text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="px-4 py-3 space-y-4">
          {/* Order Type */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Order Type</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'pickup', icon: Store, label: 'Pickup' },
                { value: 'delivery', icon: Truck, label: `Delivery (+${deliveryFee} ETB)` },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.value} onClick={() => setDeliveryType(opt.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-medium transition-colors
                      ${deliveryType === opt.value ? 'border-secondary bg-secondary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Branch */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> {isDelivery ? 'Nearest Branch' : 'Pickup Branch'}
            </p>
            <Select value={selectedBranch || ''} onValueChange={setSelectedBranch}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select branch" /></SelectTrigger>
              <SelectContent>
                {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {isDelivery && (
              <Input
                placeholder="Delivery address..."
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                className="mt-2 h-9 text-sm"
              />
            )}
          </div>

          {/* Payment */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CreditCard className="h-3 w-3" /> Payment
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map(pm => (
                <button key={pm.value}
                  onClick={() => setPaymentMethod(pm.value)}
                  className={`py-2 px-2 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === pm.value ? 'border-secondary bg-secondary/5 text-primary' : 'border-border text-muted-foreground hover:border-secondary/30'}`}>
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Promo */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Tag className="h-3 w-3" /> Promo Code
            </p>
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-800 font-mono">{appliedPromo.code}</p>
                    <p className="text-xs text-green-600">{appliedPromo.label} · −{appliedPromo.value} ETB</p>
                  </div>
                </div>
                <button onClick={removePromo}><X className="h-4 w-4 text-green-600 hover:text-green-800" /></button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code..."
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError?.(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApply()}
                    className="h-9 text-sm uppercase"
                  />
                  <Button size="sm" variant="outline" onClick={handleApply} disabled={promoLoading || !promoInput.trim()} className="shrink-0 h-9">
                    {promoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <X className="h-3 w-3" /> {promoError}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Special Instructions</p>
            <Textarea
              placeholder="Any special requests..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sticky footer: Summary + CTA */}
      <div className="shrink-0 border-t bg-background px-4 pt-3 pb-4 space-y-2">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{subtotal} ETB</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> Discount</span>
              <span className="text-green-600">−{discount} ETB</span>
            </div>
          )}
          {isDelivery && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{deliveryFee} ETB</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{orderTotal} ETB</span>
          </div>
        </div>

        <Button
          onClick={onPlaceOrder}
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11"
          size="lg"
        >
          {submitting
            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Placing Order...</>
            : `Place Order · ${orderTotal} ETB`}
        </Button>
        <p className="text-center text-xs text-muted-foreground">+{Math.floor(orderTotal / 10)} loyalty points earned</p>
      </div>
    </div>
  );
}