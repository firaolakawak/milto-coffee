import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

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

  const clearCart = () => { setItems([]); setPromoCode(''); setDiscount(0); };

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      selectedBranch, setSelectedBranch,
      promoCode, setPromoCode, discount, setDiscount,
      subtotal, total, itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);