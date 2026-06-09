import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Check, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { toast } from 'sonner';

const SIZES = [
  { name: 'Small', price_modifier: -10 },
  { name: 'Medium', price_modifier: 0 },
  { name: 'Large', price_modifier: 15 },
];

const MILK_OPTIONS = [
  { label: 'Whole', icon: '🐄' },
  { label: 'Skim', icon: '🥛' },
  { label: 'Oat', icon: '🌾' },
  { label: 'Almond', icon: '🌰' },
  { label: 'None', icon: '🚫' },
];
const SUGAR_OPTIONS = ['None', 'Light', 'Regular', 'Extra'];
const ROAST_OPTIONS = ['Light', 'Regular', 'Dark'];

const FULL_CUSTOM_CATEGORIES = ['espresso', 'macchiato', 'cappuccino', 'latte', 'specialty'];
const SIZE_ONLY_CATEGORIES = ['traditional', 'cold_brew'];

function SectionDivider() {
  return <div className="border-t border-border" />;
}

export default function OrderProductCard({ group, onAdded }) {
  const [open, setOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [size, setSize] = useState('Medium');
  const [milk, setMilk] = useState('Whole');
  const [sugar, setSugar] = useState('Regular');
  const [roast, setRoast] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const products = group.products;
  const primaryProduct = products[0];
  const isGrouped = products.length > 1;
  const activeProduct = products.find(p => p.id === activeProductId) || primaryProduct;
  const hasFullCustomizations = FULL_CUSTOM_CATEGORIES.includes(activeProduct.category);
  const hasSizeOnly = SIZE_ONLY_CATEGORIES.includes(activeProduct.category);
  const hasSize = hasFullCustomizations || hasSizeOnly;
  const sizeData = hasSize ? SIZES.find(s => s.name === size) : null;
  const unitPrice = activeProduct.price + (sizeData?.price_modifier || 0);
  const totalPrice = unitPrice * quantity;
  const prices = products.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceLabel = minPrice === maxPrice ? `${minPrice} ETB` : `${minPrice}–${maxPrice} ETB`;
  const cardImage = products.find(p => p.image_url)?.image_url;

  const handleOpen = () => {
    setActiveProductId(primaryProduct.id);
    setSize('Medium');
    setMilk('Whole');
    setSugar('Regular');
    setRoast('Regular');
    setQuantity(1);
    setOpen(true);
  };

  const handleAdd = () => {
    const customizations = hasFullCustomizations ? { milk, sugar, roast } : {};
    addItem({ ...activeProduct, sizes: hasSize ? SIZES : [] }, quantity, hasSize ? size : null, customizations);
    toast.success(`Added ${activeProduct.name}`);
    setOpen(false);
    setQuantity(1);
    onAdded?.();
  };

  return (
    <>
      <Card
        className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={handleOpen}
      >
        <div className="h-28 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center overflow-hidden relative">
          {cardImage ? (
            <img src={cardImage} alt={group.baseName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <span className="text-4xl opacity-50">☕</span>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-primary text-xs leading-tight line-clamp-1">{group.baseName}</h3>
          {isGrouped && <p className="text-xs text-muted-foreground">{products.length} variants</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-secondary text-xs">{priceLabel}</span>
            <button
              className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
              onClick={e => { e.stopPropagation(); handleOpen(); }}>
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col">
          {/* Header: image + title */}
          <div className="flex gap-4 p-5 pb-4 items-start">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/10 flex-shrink-0 flex items-center justify-center">
              {cardImage ? (
                <img src={cardImage} alt={activeProduct.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">☕</span>
              )}
            </div>
            <div className="flex-1 pt-1">
              <h2 className="font-display text-xl font-semibold text-primary leading-tight">{activeProduct.name}</h2>
              {activeProduct.description && (
                <p className="text-sm text-muted-foreground mt-1">{activeProduct.description}</p>
              )}
              {isGrouped && (
                <div className="mt-2">
                  <Tabs value={activeProduct.id} onValueChange={id => { setActiveProductId(id); setSize('Medium'); }}>
                    <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-xl">
                      {products.map(p => (
                        <TabsTrigger key={p.id} value={p.id}
                          className="rounded-lg text-xs px-3 py-1.5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                          {p.variantName}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}
              <button className="flex items-center gap-0.5 text-xs text-primary underline mt-1.5 font-medium">
                More details <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Scrollable options */}
          <div className="overflow-y-auto flex-1">
            <div className="px-5 space-y-0">

              {/* SIZE */}
              {hasSize && (
                <>
                  <SectionDivider />
                  <div className="py-4">
                    <p className="font-bold text-foreground text-base mb-3">Size</p>
                    <div className="flex gap-2">
                      {SIZES.map(s => {
                        const selected = size === s.name;
                        const label = s.price_modifier === 0
                          ? `${s.name} (Base)`
                          : `${s.name} (${s.price_modifier > 0 ? '+' : ''}${s.price_modifier} ETB)`;
                        return (
                          <button key={s.name} onClick={() => setSize(s.name)}
                            className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-medium border-2 transition-all relative flex flex-col items-center gap-0.5
                              ${selected
                                ? 'bg-secondary text-secondary-foreground border-secondary'
                                : 'bg-transparent border-border text-foreground hover:border-secondary/60'}`}>
                            <span>{label}</span>
                            {selected && <Check className="h-3.5 w-3.5 absolute bottom-1.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* MILK */}
              {hasFullCustomizations && (
                <>
                  <SectionDivider />
                  <div className="py-4">
                    <p className="font-bold text-foreground text-base mb-3">Milk</p>
                    <div className="flex flex-wrap gap-2">
                      {MILK_OPTIONS.map(({ label, icon }) => {
                        const selected = milk === label;
                        return (
                          <button key={label} onClick={() => setMilk(label)}
                            className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm border-2 transition-all font-medium
                              ${selected
                                ? 'bg-secondary text-secondary-foreground border-secondary'
                                : 'bg-transparent border-border text-foreground hover:border-secondary/60'}`}>
                            <span>{icon}</span>
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <SectionDivider />
                  <div className="py-4">
                    <p className="font-bold text-foreground text-base mb-3">Sugar</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGAR_OPTIONS.map(s => {
                        const selected = sugar === s;
                        return (
                          <button key={s} onClick={() => setSugar(s)}
                            className={`flex items-center gap-1 py-2 px-4 rounded-xl text-sm border-2 transition-all font-medium
                              ${selected
                                ? 'bg-secondary text-secondary-foreground border-secondary'
                                : 'bg-transparent border-border text-foreground hover:border-secondary/60'}`}>
                            {selected && <Check className="h-3.5 w-3.5" />}
                            <span>{s}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Adjust sweetness level.</p>
                  </div>

                  <SectionDivider />
                  <div className="py-4">
                    <p className="font-bold text-foreground text-base mb-3">Roast</p>
                    <div className="flex flex-wrap gap-2">
                      {ROAST_OPTIONS.map(r => {
                        const selected = roast === r;
                        return (
                          <button key={r} onClick={() => setRoast(r)}
                            className={`flex items-center gap-1 py-2 px-5 rounded-xl text-sm border-2 transition-all font-medium
                              ${selected
                                ? 'bg-secondary text-secondary-foreground border-secondary'
                                : 'bg-transparent border-border text-foreground hover:border-secondary/60'}`}>
                            {selected && <Check className="h-3.5 w-3.5" />}
                            <span>{r}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Choose coffee intensity.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom: quantity + total + CTA */}
          <div className="px-5 pt-3 pb-5 border-t border-border bg-background">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-9 w-9 rounded-full border-2 border-border flex items-center justify-center hover:border-secondary transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="h-9 w-9 rounded-full border-2 border-border flex items-center justify-center hover:border-secondary transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground text-sm font-medium">Total: </span>
                <span className="text-xl font-bold text-foreground">{totalPrice} ETB</span>
              </div>
            </div>
            <button onClick={handleAdd}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-base font-bold hover:bg-primary/90 transition-colors">
              Add to Order — {totalPrice} ETB
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}