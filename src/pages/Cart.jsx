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
import { Plus, Minus, Trash2, ShoppingBag, MapPin, CreditCard, ArrowLeft, Store, Truck } from 'lucide-react';
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

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, selectedBranch, setSelectedBranch, subtotal, total, promoCode, setPromoCode } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const DELIVERY_FEE = 50;

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-cart'],
    queryFn: () => base44.entities.Branch.filter({ is_active: true }),
  });

  const isDelivery = deliveryType === 'delivery';
  const orderTotal = isDelivery ? total + DELIVERY_FEE : total;

  const orderMutation = useMutation({
    mutationFn: (orderData) => base44.entities.Order.create(orderData),
    onMutate: async () => {
      setSubmitting(true);
    },
    onSuccess: (created) => {
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/track/${created.id}`);
      setSubmitting(false);
    },
    onError: () => {
      toast.error('Failed to place order');
      setSubmitting(false);
    },
  });

  const handleOrder = async () => {
    if (!selectedBranch) { toast.error('Please select a branch'); return; }
    if (isDelivery && !deliveryAddress.trim()) { toast.error('Please enter a delivery address'); return; }
    if (items.length === 0) return;
    
    const branch = branches.find(b => b.id === selectedBranch);
    const orderData = {
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
      total: orderTotal,
      delivery_type: deliveryType,
      delivery_address: isDelivery ? deliveryAddress : undefined,
      delivery_fee: isDelivery ? DELIVERY_FEE : 0,
      status: 'received',
      payment_method: paymentMethod,
      promo_code: promoCode || undefined,
      notes: notes || undefined,
      loyalty_points_earned: Math.floor(orderTotal / 10),
    };
    orderMutation.mutate(orderData);
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

  // "Add More" button rendered inside the cart items section
  const AddMoreButton = () => (
    <Link to="/menu">
      <Button variant="outline" className="w-full rounded-full border-dashed border-secondary text-secondary gap-2">
        <Plus className="h-4 w-4" /> Add More Items
      </Button>
    </Link>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/menu"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <h1 className="font-display text-2xl font-bold text-primary">Your Cart</h1>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <AddMoreButton />
          {items.map(item => (
            <Card key={item.key} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : <span className="text-2xl">☕</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{item.product.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.size}{item.customizations?.milk ? ` · ${item.customizations.milk} milk` : ''}</p>
                  <p className="text-sm font-bold text-secondary mt-1">{item.unitPrice * item.quantity} ETB</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.key, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.key, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.key)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {/* Delivery Type */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Order Type</CardTitle></CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeliveryType('pickup')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-colors
                  ${deliveryType === 'pickup' ? 'border-secondary bg-secondary/5 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <Store className="h-5 w-5" />
                Pickup
              </button>
              <button
                onClick={() => setDeliveryType('delivery')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-colors
                  ${deliveryType === 'delivery' ? 'border-secondary bg-secondary/5 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <Truck className="h-5 w-5" />
                Delivery (+{DELIVERY_FEE} ETB)
              </button>
            </CardContent>
          </Card>

          {/* Branch */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> {isDelivery ? 'Nearest Branch' : 'Pickup Branch'}</CardTitle></CardHeader>
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                {PAYMENT_METHODS.map(pm => (
                  <div key={pm.value} className="flex items-center gap-2">
                    <RadioGroupItem value={pm.value} id={pm.value} />
                    <Label htmlFor={pm.value} className="text-sm cursor-pointer">{pm.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <Input placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="rounded-full" />
              <Textarea placeholder="Special instructions..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-primary text-primary-foreground">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="opacity-80">Subtotal</span><span>{subtotal} ETB</span></div>
              {isDelivery && <div className="flex justify-between text-sm"><span className="opacity-80">Delivery Fee</span><span>{DELIVERY_FEE} ETB</span></div>}
              <Separator className="bg-primary-foreground/20" />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{orderTotal} ETB</span></div>
              <Button onClick={handleOrder} disabled={submitting} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full mt-2" size="lg">
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}