import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Minus, Trash2, ShoppingBag, MapPin, CreditCard,
  ArrowLeft, Store, Truck, Tag, X, CheckCircle2, Loader2
} from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
  { value: 'telebirr', label: 'Telebirr' },
  { value: 'cbe_birr', label: 'CBE Birr' },
  { value: 'amole', label: 'Amole' },
  { value: 'cash', label: 'Cash on Pickup' },
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
];

const DELIVERY_FEE = 50;

export default function Cart() {
  const {
    items, updateQuantity, removeItem, clearCart,
    selectedBranch, setSelectedBranch,
    subtotal, total, itemCount,
    promoCode, setPromoCode,
    appliedPromo, promoLoading, promoError, setPromoError,
    applyPromoCode, removePromo,
    discount,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState('');

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-cart'],
    queryFn: () => base44.entities.Branch.filter({ is_active: true }),
  });

  const isDelivery = deliveryType === 'delivery';
  const orderTotal = isDelivery ? total + DELIVERY_FEE : total;

  const orderMutation = useMutation({
    mutationFn: (orderData) => base44.entities.Order.create(orderData),
    onMutate: () => setSubmitting(true),
    onSuccess: (created) => {
      clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/orders/track/${created.id}`);
      setSubmitting(false);
    },
    onError: () => {
      toast.error('Failed to place order');
      setSubmitting(false);
    },
  });

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    applyPromoCode(promoInput, user?.id);
  };

  const handleOrder = async () => {
    if (!selectedBranch) { toast.error('Please select a branch'); return; }
    if (isDelivery && !deliveryAddress.trim()) { toast.error('Please enter a delivery address'); return; }
    if (items.length === 0) return;

    const branch = branches.find(b => b.id === selectedBranch);
    orderMutation.mutate({
      order_number: `MIL-${Date.now().toString(36).toUpperCase()}`,
      customer_name: user?.full_name || 'Guest',
      customer_phone: user?.phone || '',
      branch_id: selectedBranch,
      branch_name: branch?.name || '',
      items: items.map(i => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        size: i.size,
        customizations: i.customizations,
        unit_price: i.unitPrice,
        total_price: i.unitPrice * i.quantity,
      })),
      subtotal,
      discount: discount || 0,
      total: orderTotal,
      delivery_type: deliveryType,
      delivery_address: isDelivery ? deliveryAddress : undefined,
      delivery_fee: isDelivery ? DELIVERY_FEE : 0,
      status: 'received',
      payment_method: paymentMethod,
      promo_code: appliedPromo?.code || undefined,
      notes: notes || undefined,
      loyalty_points_earned: Math.floor(orderTotal / 10),
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-bold text-primary mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some delicious coffee to get started</p>
        <Link to="/menu"><Button className="rounded-full bg-secondary text-secondary-foreground">Browse Menu</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/menu"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Your Cart</h1>
          <p className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: Items + Checkout details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cart Items */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Order Items</CardTitle>
                <Link to="/menu">
                  <Button variant="ghost" size="sm" className="text-secondary gap-1.5 h-7 text-xs">
                    <Plus className="h-3 w-3" /> Add More
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {items.map(item => (
                <div key={item.key} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    {item.product.image_url
                      ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                      : <span className="text-xl">☕</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.size}{item.customizations?.milk ? ` · ${item.customizations.milk} milk` : ''}</p>
                    <p className="text-sm font-bold text-secondary mt-0.5">{item.unitPrice} ETB</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                    <button onClick={() => removeItem(item.key)} className="w-6 h-6 ml-1 text-destructive hover:bg-destructive/10 rounded-full flex items-center justify-center transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Type */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Order Type</CardTitle></CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-2">
              {[
                { value: 'pickup', icon: Store, label: 'Pickup' },
                { value: 'delivery', icon: Truck, label: `Delivery (+${DELIVERY_FEE} ETB)` },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.value} onClick={() => setDeliveryType(opt.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-colors
                      ${deliveryType === opt.value ? 'border-secondary bg-secondary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                    <Icon className="h-5 w-5" />
                    {opt.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Branch + Address */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {isDelivery ? 'Nearest Branch' : 'Pickup Branch'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Select value={selectedBranch || ''} onValueChange={setSelectedBranch}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {isDelivery && (
                <Input
                  placeholder="Enter your delivery address..."
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(pm => (
                  <div key={pm.value}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors
                      ${paymentMethod === pm.value ? 'border-secondary bg-secondary/5' : 'border-border'}`}
                    onClick={() => setPaymentMethod(pm.value)}>
                    <RadioGroupItem value={pm.value} id={`pm-${pm.value}`} />
                    <Label htmlFor={`pm-${pm.value}`} className="text-sm cursor-pointer">{pm.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Special Instructions</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <Textarea
                placeholder="Any special requests? (e.g. extra sugar, no ice...)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="space-y-4">
          {/* Promo / Birthday Code */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" /> Promo / Birthday Code
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-800 font-mono">{appliedPromo.code}</p>
                      <p className="text-xs text-green-600">{appliedPromo.label} · −{appliedPromo.value} ETB</p>
                    </div>
                  </div>
                  <button onClick={removePromo} className="text-green-600 hover:text-green-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code (e.g. BDAY-XXXXXX)"
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value); setPromoError && setPromoError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                      className="rounded-lg text-sm uppercase"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="shrink-0"
                    >
                      {promoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <X className="h-3 w-3" /> {promoError}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-0 shadow-md bg-primary text-primary-foreground">
            <CardContent className="p-5 space-y-3">
              <p className="font-semibold text-sm opacity-90 mb-1">Order Summary</p>
              <div className="flex justify-between text-sm"><span className="opacity-75">Subtotal</span><span>{subtotal} ETB</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="opacity-75 flex items-center gap-1"><Tag className="h-3 w-3" /> Discount</span>
                  <span className="text-green-300">−{discount} ETB</span>
                </div>
              )}
              {isDelivery && (
                <div className="flex justify-between text-sm"><span className="opacity-75">Delivery Fee</span><span>{DELIVERY_FEE} ETB</span></div>
              )}
              <Separator className="bg-primary-foreground/20" />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{orderTotal} ETB</span></div>
              {appliedPromo && (
                <Badge className="bg-green-500/20 text-green-300 border-0 text-xs w-full justify-center py-1">
                  🎉 {appliedPromo.label} applied!
                </Badge>
              )}
              <Button
                onClick={handleOrder}
                disabled={submitting}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full mt-1"
                size="lg"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Placing Order...</> : 'Place Order'}
              </Button>
              <p className="text-center text-xs opacity-50">+{Math.floor(orderTotal / 10)} loyalty points earned</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}