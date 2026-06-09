import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Check, ChevronRight, ChevronDown } from 'lucide-react';
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
  { label: 'Oat',   icon: '🌾' },
  { label: 'Almond',icon: '🌰' },
  { label: 'None',  icon: '🚫' },
];

const SUGAR_OPTIONS = ['None', 'Light', 'Regular', 'Extra'];

const ROAST_OPTIONS = [
  { name: 'Light',   hint: 'Smooth, mild flavor.' },
  { name: 'Regular', hint: 'Balanced taste.' },
  { name: 'Dark',    hint: 'Bold, strong flavor.' },
];

const FULL_CUSTOM_CATEGORIES = ['espresso', 'macchiato', 'cappuccino', 'latte', 'specialty'];
const SIZE_ONLY_CATEGORIES   = ['traditional', 'cold_brew'];

/* ── shared option pill ── */
function Pill({ selected, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      style={{ minHeight: 44 }}
      className={`
        inline-flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm font-medium border-2
        transition-all duration-150 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${selected
          ? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
          : 'bg-background border-border text-foreground hover:border-secondary/60 hover:bg-secondary/5'}
        ${className}
      `}
    >
      {children}
      {selected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
    </button>
  );
}

/* ── section wrapper ── */
function Section({ label, hint, children }) {
  return (
    <>
      <div className="border-t border-border" />
      <div className="py-5">
        <p className="text-base font-bold text-foreground mb-0.5">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mb-3">{hint}</p>}
        {!hint && <div className="mb-3" />}
        {children}
      </div>
    </>
  );
}

export default function ProductCard({ group }) {
  const [open, setOpen]                   = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [size, setSize]                   = useState('Medium');
  const [milk, setMilk]                   = useState('Whole');
  const [sugar, setSugar]                 = useState('Regular');
  const [roast, setRoast]                 = useState('Regular');
  const [quantity, setQuantity]           = useState(1);
  const [detailsOpen, setDetailsOpen]     = useState(false);
  const { addItem } = useCart();

  const products        = group.products;
  const primaryProduct  = products[0];
  const isGrouped       = products.length > 1;
  const activeProduct   = products.find(p => p.id === activeProductId) || primaryProduct;

  const hasFullCustomizations = FULL_CUSTOM_CATEGORIES.includes(activeProduct.category);
  const hasSizeOnly           = SIZE_ONLY_CATEGORIES.includes(activeProduct.category);
  const hasSize               = hasFullCustomizations || hasSizeOnly;
  const sizeData              = hasSize ? SIZES.find(s => s.name === size) : null;
  const unitPrice             = activeProduct.price + (sizeData?.price_modifier || 0);
  const totalPrice            = unitPrice * quantity;

  const prices     = products.map(p => p.price);
  const minPrice   = Math.min(...prices);
  const maxPrice   = Math.max(...prices);
  const priceLabel = minPrice === maxPrice ? `${minPrice} ETB` : `${minPrice}–${maxPrice} ETB`;
  const cardImage  = products.find(p => p.image_url)?.image_url;

  // Concise tagline: first sentence or first 60 chars
  const fullDesc = activeProduct.description || '';
  const tagline  = fullDesc.includes('.')
    ? fullDesc.split('.')[0] + '.'
    : fullDesc.slice(0, 60) + (fullDesc.length > 60 ? '…' : '');
  const hasMore  = fullDesc.length > tagline.length;

  const handleOpen = () => {
    setActiveProductId(primaryProduct.id);
    setSize('Medium'); setMilk('Whole');
    setSugar('Regular'); setRoast('Regular');
    setQuantity(1); setDetailsOpen(false);
    setOpen(true);
  };

  const handleAdd = () => {
    const customizations = hasFullCustomizations ? { milk, sugar, roast } : {};
    addItem({ ...activeProduct, sizes: hasSize ? SIZES : [] }, quantity, hasSize ? size : null, customizations);
    toast.success(`Added ${activeProduct.name} to cart`);
    setOpen(false); setQuantity(1);
  };

  return (
    <>
      {/* ── card ── */}
      <Card
        className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleOpen}
      >
        <div className="h-40 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center overflow-hidden relative">
          {cardImage
            ? <img src={cardImage} alt={group.baseName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => { e.target.style.display = 'none'; }} />
            : <span className="text-5xl opacity-50">☕</span>}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-primary text-sm">{group.baseName}</h3>
          {isGrouped
            ? <p className="text-xs text-muted-foreground mt-0.5">{products.length} variants</p>
            : primaryProduct.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tagline}</p>
              )
          }
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-secondary">{priceLabel}</span>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col bg-background">

          {/* header */}
          <div className="flex gap-4 p-5 pb-0 items-start">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/10 flex-shrink-0 flex items-center justify-center shadow-sm">
              {cardImage
                ? <img src={cardImage} alt={activeProduct.name} className="w-full h-full object-cover" />
                : <span className="text-4xl">☕</span>}
            </div>
            <div className="flex-1 pt-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-primary leading-tight">{activeProduct.name}</h2>
              {tagline && (
                <p className="text-sm text-muted-foreground mt-1 leading-snug">{tagline}</p>
              )}
              {hasMore && (
                <button
                  onClick={() => setDetailsOpen(v => !v)}
                  className="flex items-center gap-0.5 text-xs text-secondary font-semibold mt-1.5 hover:underline focus-visible:outline-none"
                >
                  {detailsOpen ? 'Less details' : 'More details'}
                  {detailsOpen ? <ChevronDown className="h-3 w-3 rotate-180" /> : <ChevronRight className="h-3 w-3" />}
                </button>
              )}
              {detailsOpen && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{fullDesc}</p>
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
            </div>
          </div>

          {/* options */}
          <div className="overflow-y-auto flex-1 px-5">

            {hasSize && (
              <Section label="Size">
                <div className="flex gap-2">
                  {SIZES.map(s => {
                    const sel   = size === s.name;
                    const label = s.price_modifier === 0
                      ? `${s.name} (Base)`
                      : `${s.name} (${s.price_modifier > 0 ? '+' : ''}${s.price_modifier} ETB)`;
                    return (
                      <button
                        key={s.name}
                        onClick={() => setSize(s.name)}
                        style={{ minHeight: 52 }}
                        className={`
                          flex-1 px-2 rounded-xl text-sm font-medium border-2
                          transition-all duration-150 active:scale-95
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                          ${sel
                            ? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
                            : 'bg-background border-border text-foreground hover:border-secondary/60 hover:bg-secondary/5'}
                        `}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            {hasFullCustomizations && (
              <>
                <Section label="Milk">
                  {/* row 1: Whole Skim Oat */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {MILK_OPTIONS.slice(0, 3).map(({ label, icon }) => (
                      <Pill key={label} selected={milk === label} onClick={() => setMilk(label)}>
                        <span>{icon}</span><span>{label}</span>
                      </Pill>
                    ))}
                  </div>
                  {/* row 2: Almond None */}
                  <div className="flex flex-wrap gap-2">
                    {MILK_OPTIONS.slice(3).map(({ label, icon }) => (
                      <Pill key={label} selected={milk === label} onClick={() => setMilk(label)}>
                        <span>{icon}</span><span>{label}</span>
                      </Pill>
                    ))}
                  </div>
                  {milk === 'None' && (
                    <p className="text-xs text-muted-foreground mt-2 italic">No milk will be added.</p>
                  )}
                </Section>

                <Section label="Sugar" hint="Adjust sweetness level.">
                  <div className="flex flex-wrap gap-2">
                    {SUGAR_OPTIONS.map(s => (
                      <Pill key={s} selected={sugar === s} onClick={() => setSugar(s)}>{s}</Pill>
                    ))}
                  </div>
                </Section>

                <Section label="Roast" hint="Choose coffee intensity.">
                  <div className="flex flex-wrap gap-2">
                    {ROAST_OPTIONS.map(({ name, hint }) => (
                      <div key={name} className="relative group/roast">
                        <Pill selected={roast === name} onClick={() => setRoast(name)}>{name}</Pill>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover/roast:opacity-100 pointer-events-none transition-opacity z-10">
                          {hint}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            )}

            <div className="h-4" />
          </div>

          {/* footer */}
          <div className="px-5 pt-4 pb-6 border-t border-border bg-background">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ minWidth: 44, minHeight: 44 }}
                  className="rounded-full border-2 border-border flex items-center justify-center hover:border-secondary active:scale-90 transition-all"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold text-xl w-7 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  style={{ minWidth: 44, minHeight: 44 }}
                  className="rounded-full border-2 border-border flex items-center justify-center hover:border-secondary active:scale-90 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div>
                <span className="text-sm text-muted-foreground font-medium">Total: </span>
                <span className="text-2xl font-bold text-foreground tabular-nums">{totalPrice} ETB</span>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-base font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md"
            >
              Add to Cart — {totalPrice} ETB
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}