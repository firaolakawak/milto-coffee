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
{ name: 'Large', price_modifier: 15 }];


const MILK_OPTIONS = [
{ label: 'Whole', icon: '🐄' },
{ label: 'Skim', icon: '🥛' },
{ label: 'Oat', icon: '🌾' },
{ label: 'Almond', icon: '🌰' },
{ label: 'None', icon: '🚫' }];

const MAX_WORDS = 8;

function ShortTagline({ text }) {
  const words = text.split(" ");
  const isLong = words.length > MAX_WORDS;
  const shortText = isLong ? words.slice(0, MAX_WORDS).join(" ") + "..." : text;

  const [expanded, setExpanded] = useState(false);

  return (
    <p className="text-sm text-foreground/70 mt-1 leading-snug">
      {expanded ? text : shortText}

      {isLong && !expanded &&
      <button
        onClick={() => setExpanded(true)}
        className="ml-1 text-primary font-medium hover:underline">
        
          See more...
        </button>
      }
    </p>);

}
const SUGAR_OPTIONS = ['None', 'Light', 'Regular', 'Extra'];
const ROAST_OPTIONS = ['Light', 'Regular', 'Dark'];

const FULL_CUSTOM_CATEGORIES = ['espresso', 'macchiato', 'cappuccino', 'latte', 'specialty'];
const SIZE_ONLY_CATEGORIES = ['traditional', 'cold_brew'];

export default function OrderProductCard({ group, onAdded }) {
  const [open, setOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [size, setSize] = useState('Medium');
  const [milk, setMilk] = useState('Whole');
  const [sugar, setSugar] = useState('Regular');
  const [roast, setRoast] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const { addItem } = useCart();

  const products = group.products;
  const primaryProduct = products[0];
  const isGrouped = products.length > 1;
  const activeProduct = products.find((p) => p.id === activeProductId) || primaryProduct;

  const hasFullCustomizations = FULL_CUSTOM_CATEGORIES.includes(activeProduct.category);
  const hasSizeOnly = SIZE_ONLY_CATEGORIES.includes(activeProduct.category);
  const hasSize = hasFullCustomizations || hasSizeOnly;
  const sizeData = hasSize ? SIZES.find((s) => s.name === size) : null;
  const unitPrice = activeProduct.price + (sizeData?.price_modifier || 0);
  const totalPrice = unitPrice * quantity;

  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceLabel = minPrice === maxPrice ? `${minPrice} ETB` : `${minPrice}–${maxPrice} ETB`;
  const cardImage = products.find((p) => p.image_url)?.image_url;

  const fullDesc = activeProduct.description || '';
  const tagline = fullDesc.split('.')[0] + (fullDesc.includes('.') ? '.' : '');
  const extraDesc = fullDesc.slice(tagline.length).trim();

  const handleOpen = () => {
    setActiveProductId(primaryProduct.id);
    setSize('Medium');setMilk('Whole');
    setSugar('Regular');setRoast('Regular');
    setQuantity(1);setShowDetails(false);
    setOpen(true);
  };

  const handleAdd = () => {
    const customizations = hasFullCustomizations ? { milk, sugar, roast } : {};
    addItem({ ...activeProduct, sizes: hasSize ? SIZES : [] }, quantity, hasSize ? size : null, customizations);
    toast.success(`Added ${activeProduct.name}`);
    setOpen(false);setQuantity(1);
    onAdded?.();
  };

  return (
    <>
      {/* ── card ── */}
      <Card
        className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none"
        onClick={handleOpen}>
        
        <div className="h-28 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center overflow-hidden relative">
          {cardImage ?
          <img src={cardImage} alt={group.baseName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {e.target.style.display = 'none';}} /> :
          <span className="text-4xl opacity-50">☕</span>}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-primary text-xs leading-tight line-clamp-1">{group.baseName}</h3>
          {isGrouped && <p className="text-xs text-muted-foreground">{products.length} variants</p>}
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-secondary text-xs">{priceLabel}</span>
            <button
              className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
              onClick={(e) => {e.stopPropagation();handleOpen();}}>
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── customization dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col bg-card">

          {/* ── header ── */}
        

 <div className="flex gap-4 px-5 pt-5 pb-4 items-start bg-card">
  <div className="w-[90px] h-[90px] rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm">
    {cardImage ?
              <img
                src={cardImage}
                alt={activeProduct.name}
                className="w-full h-full object-cover" /> :


              <div className="w-full h-full flex items-center justify-center text-4xl">☕</div>
              }
  </div>

  <div className="flex-1 pt-0.5 min-w-0">
    <h2 className="font-display text-[22px] font-bold text-primary leading-tight">
      {activeProduct.name}
    </h2>

    {tagline && <ShortTagline text={tagline} />}

    {extraDesc &&
              <>
        <button
                  onClick={() => setShowDetails((v) => !v)}
                  className="flex items-center gap-1 text-sm text-primary underline underline-offset-2 mt-1.5 font-medium hover:text-primary/80 transition-colors">
                  
          {showDetails ? 'Hide details' : ''}
          <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                  
        </button>

        {showDetails &&
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {extraDesc}
          </p>
                }
      </>
              }

    {isGrouped &&
              <div className="mt-2">
        <Tabs
                  value={activeProduct.id}
                  onValueChange={(id) => {
                    setActiveProductId(id);
                    setSize('Medium');
                  }}>
                  
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-xl">
            {products.map((p) =>
                    <TabsTrigger
                      key={p.id}
                      value={p.id}
                      className="rounded-lg text-xs px-3 py-1.5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                      
                {p.variantName}
              </TabsTrigger>
                    )}
          </TabsList>
        </Tabs>
      </div>
              }
  </div>
</div>


          {/* ── scrollable sections ── */}
          <div className="overflow-y-auto flex-1 bg-card">

            {/* SIZE */}
            {hasSize &&
            <div className="px-5 py-4 border-t border-border">
                <p className="text-[10px] font-bold text-foreground mb-2">Size</p>
                <div className="flex gap-2">
                  {SIZES.map((s) => {
                  const sel = size === s.name;
                  const label = s.price_modifier === 0 ?
                  `${s.name}` :
                  `${s.name} (${s.price_modifier > 0 ? '+' : ''}${s.price_modifier})`;
                  return (
                    <button
                      key={s.name}
                      onClick={() => setSize(s.name)}
                      className={`
    flex items-center justify-center gap-1
    flex-1 rounded-xl border
    px-3 py-2 min-h-[10px]
    text-sm font-medium transition-all duration-150
    active:scale-[0.97] select-none
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary

    ${sel ?
                      'bg-secondary text-secondary-foreground border-secondary shadow-sm' :
                      'bg-background border-border text-foreground hover:border-secondary/40 hover:bg-secondary/5'}
  `}>
                      
  <span>{label}</span>
  {sel && <Check className="h-3.5 w-3.5 opacity-90" />}
</button>);




                })}
                </div>
              </div>
            }

            {/* MILK */}
            {hasFullCustomizations &&
            <>
                <div className="px-5 py-4 border-t border-border">
                  <p className="text-[15px] font-bold text-foreground mb-3">Milk</p>
                  <div className="flex flex-wrap gap-2">
                    {MILK_OPTIONS.map(({ label, icon }) => {
                    const sel = milk === label;
                    return (
                      <button
                        key={label}
                        onClick={() => setMilk(label)}
                        style={{ minHeight: 44 }}
                        className={`
                            flex items-center gap-1.5 border-2 transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold px-2 rounded-[14px]
                            ${
                        sel ?
                        'bg-secondary text-secondary-foreground border-secondary shadow-sm' :
                        'bg-background border-border text-foreground hover:border-secondary/50 hover:bg-secondary/5'}
                          `}>
                        
                          <span className="text-base leading-none">{icon}</span>
                          <span>{label}</span>
                        </button>);

                  })}
                  </div>
                  {milk === 'None' &&
                <p className="text-xs text-muted-foreground mt-2 italic">No milk will be added.</p>
                }
                </div>

                {/* SUGAR */}
                <div className="px-5 py-4 border-t border-border">
                  <p className="text-[15px] font-bold text-foreground mb-1">Sugar</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SUGAR_OPTIONS.map((s) => {
                    const sel = sugar === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSugar(s)}
                        style={{ minHeight: 44 }}
                        className={`
                            flex items-center gap-1 px-4 py-2 rounded-2xl text-sm font-medium border-2
                            transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                            ${sel ?
                        'bg-secondary text-secondary-foreground border-secondary shadow-sm' :
                        'bg-background border-border text-foreground hover:border-secondary/50 hover:bg-secondary/5'}
                          `}>
                        
                          {sel && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                          <span>{s}</span>
                        </button>);

                  })}
                  </div>
                  <p className="text-xs text-muted-foreground">Adjust sweetness level.</p>
                </div>

                {/* ROAST */}
                <div className="px-5 py-4 border-t border-border">
                  <p className="text-[15px] font-bold text-foreground mb-1">Roast</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {ROAST_OPTIONS.map((r) => {
                    const sel = roast === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setRoast(r)}
                        style={{ minHeight: 44 }}
                        className={`
                            flex items-center gap-1 px-5 py-2 rounded-2xl text-sm font-medium border-2
                            transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                            ${sel ?
                        'bg-secondary text-secondary-foreground border-secondary shadow-sm' :
                        'bg-background border-border text-foreground hover:border-secondary/50 hover:bg-secondary/5'}
                          `}>
                        
                          {sel && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                          <span>{r}</span>
                        </button>);

                  })}
                  </div>
                  <p className="text-xs text-muted-foreground">Choose coffee intensity.</p>
                </div>
              </>
            }
          </div>

          {/* ── footer ── */}
          <div className="px-5 pt-4 pb-6 border-t border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: 44, height: 44 }}
                  className="rounded-full border-2 border-border bg-background flex items-center justify-center hover:border-secondary active:scale-90 transition-all">
                  
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold w-7 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  style={{ width: 44, height: 44 }}
                  className="rounded-full border-2 border-border bg-background flex items-center justify-center hover:border-secondary active:scale-90 transition-all">
                  
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground font-medium">Total: </span>
                <span className="text-2xl font-bold text-foreground tabular-nums">{totalPrice} ETB</span>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-base font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md">
              
              Add to Order — {totalPrice} ETB
            </button>
          </div>

        </DialogContent>
      </Dialog>
    </>);

}