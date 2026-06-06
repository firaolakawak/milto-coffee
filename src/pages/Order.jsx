import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import OrderMenuPanel from '@/components/order/OrderMenuPanel';
import OrderSummaryPanel from '@/components/order/OrderSummaryPanel';
import { ShoppingBag } from 'lucide-react';

const DELIVERY_FEE = 50;

export default function Order() {
  const {
    items, updateQuantity, removeItem, clearCart,
    selectedBranch, setSelectedBranch,
    subtotal, total, itemCount,
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
  const [mobileTab, setMobileTab] = useState('menu'); // 'menu' | 'checkout'

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

  const handleApplyPromo = (code) => {
    if (!code.trim()) return;
    applyPromoCode(code, user?.id);
  };

  const handleOrder = () => {
    if (!selectedBranch) { toast.error('Please select a branch'); return; }
    if (isDelivery && !deliveryAddress.trim()) { toast.error('Please enter a delivery address'); return; }
    if (items.length === 0) { toast.error('Add items to your order first'); return; }

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

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-b bg-background shrink-0">
        <button
          onClick={() => setMobileTab('menu')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileTab === 'menu' ? 'text-primary border-b-2 border-secondary' : 'text-muted-foreground'}`}
        >
          Menu
        </button>
        <button
          onClick={() => setMobileTab('checkout')}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${mobileTab === 'checkout' ? 'text-primary border-b-2 border-secondary' : 'text-muted-foreground'}`}
        >
          <span>Checkout</span>
          {itemCount > 0 && (
            <span className="bg-secondary text-secondary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{itemCount}</span>
          )}
        </button>
      </div>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Menu */}
        <div className={`${mobileTab === 'menu' ? 'flex' : 'hidden'} md:flex md:w-[58%] lg:w-[62%] flex-col border-r overflow-hidden`}>
          <OrderMenuPanel onItemAdded={() => setMobileTab('checkout')} />
        </div>

        {/* RIGHT: Checkout */}
        <div className={`${mobileTab === 'checkout' ? 'flex' : 'hidden'} md:flex md:flex-1 flex-col overflow-hidden`}>
          <OrderSummaryPanel
            items={items}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            itemCount={itemCount}
            subtotal={subtotal}
            total={total}
            discount={discount}
            appliedPromo={appliedPromo}
            promoLoading={promoLoading}
            promoError={promoError}
            setPromoError={setPromoError}
            removePromo={removePromo}
            onApplyPromo={handleApplyPromo}
            branches={branches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            deliveryType={deliveryType}
            setDeliveryType={setDeliveryType}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            notes={notes}
            setNotes={setNotes}
            isDelivery={isDelivery}
            orderTotal={orderTotal}
            deliveryFee={DELIVERY_FEE}
            submitting={submitting}
            onPlaceOrder={handleOrder}
            onBrowseMenu={() => setMobileTab('menu')}
          />
        </div>
      </div>
    </div>
  );
}