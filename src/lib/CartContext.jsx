import React, { createContext, useContext, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, type, value, label }
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const addItem = (product, quantity = 1, size = 'Medium', customizations = {}) => {
    const key = `${product.id}-${size}-${JSON.stringify(customizations)}`;
    setItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      const sizeData = product.sizes?.find(s => s.name === size);
      const unitPrice = product.price + (sizeData?.price_modifier || 0);
      return [...prev, { key, product, quantity, size, customizations, unitPrice }];
    });
  };

  const removeItem = (key) => setItems(prev => prev.filter(i => i.key !== key));

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) return removeItem(key);
    setItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
    setDiscount(0);
    setAppliedPromo(null);
    setPromoError('');
  };

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Validate and apply a promo or birthday code
  const applyPromoCode = useCallback(async (code, userId) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setPromoLoading(true);
    setPromoError('');

    try {
      // --- Birthday code check: BDAY-XXXXXX ---
      const isBirthdayCode = trimmed.startsWith('BDAY-');
      if (isBirthdayCode) {
        if (!userId) {
          setPromoError('Please log in to use a birthday code.');
          setPromoLoading(false);
          return;
        }
        // Validate the code matches this user
        const expectedCode = `BDAY-${userId.slice(-6).toUpperCase()}`;
        if (trimmed !== expectedCode) {
          setPromoError('This birthday code is not valid for your account.');
          setPromoLoading(false);
          return;
        }
        // Check today is actually the user's birthday
        const user = await base44.auth.me();
        const now = new Date();
        if (user.birthday_month !== now.getMonth() + 1 || user.birthday_day !== now.getDate()) {
          setPromoError('Birthday codes are only valid on your birthday.');
          setPromoLoading(false);
          return;
        }
        // 100% free drink — apply fixed discount equal to the cheapest item
        const cheapestItem = [...items].sort((a, b) => a.unitPrice - b.unitPrice)[0];
        const discountAmount = cheapestItem ? cheapestItem.unitPrice : 0;
        setDiscount(discountAmount);
        setAppliedPromo({ code: trimmed, type: 'birthday', value: discountAmount, label: '🎂 Birthday — 1 free drink' });
        setPromoCode(trimmed);
        setPromoLoading(false);
        return;
      }

      // --- Regular promo code ---
      const promos = await base44.entities.Promotion.filter({ code: trimmed, is_active: true });
      if (!promos || promos.length === 0) {
        setPromoError('Invalid or expired promo code.');
        setPromoLoading(false);
        return;
      }
      const promo = promos[0];

      // Date validity
      const today = new Date().toISOString().slice(0, 10);
      if (promo.start_date && today < promo.start_date) {
        setPromoError('This promo code is not active yet.');
        setPromoLoading(false);
        return;
      }
      if (promo.end_date && today > promo.end_date) {
        setPromoError('This promo code has expired.');
        setPromoLoading(false);
        return;
      }
      // Min order check
      if (promo.min_order && subtotal < promo.min_order) {
        setPromoError(`Minimum order of ${promo.min_order} ETB required.`);
        setPromoLoading(false);
        return;
      }

      let discountAmount = 0;
      let label = '';
      if (promo.discount_type === 'percentage') {
        discountAmount = Math.round((subtotal * promo.discount_value) / 100);
        label = `${promo.discount_value}% off`;
      } else {
        discountAmount = promo.discount_value;
        label = `${promo.discount_value} ETB off`;
      }
      discountAmount = Math.min(discountAmount, subtotal);

      setDiscount(discountAmount);
      setAppliedPromo({ code: trimmed, type: promo.discount_type, value: discountAmount, label });
      setPromoCode(trimmed);
    } catch {
      setPromoError('Could not validate code. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  }, [items, subtotal]);

  const removePromo = () => {
    setPromoCode('');
    setDiscount(0);
    setAppliedPromo(null);
    setPromoError('');
  };

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      selectedBranch, setSelectedBranch,
      promoCode, setPromoCode,
      discount, setDiscount,
      appliedPromo, promoLoading, promoError, setPromoError,
      applyPromoCode, removePromo,
      subtotal, total, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);