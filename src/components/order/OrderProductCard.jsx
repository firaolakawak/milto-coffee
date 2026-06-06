import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { toast } from 'sonner';

const SIZES = [
  { name: 'Small', price_modifier: -10 },
  { name: 'Medium', price_modifier: 0 },
  { name: 'Large', price_modifier: 15 },
];

const MILK_OPTIONS = ['Whole', 'Skim', 'Oat', 'Almond', 'None'];
const SUGAR_OPTIONS = ['None', 'Light', 'Regular', 'Extra'];
const ROAST_OPTIONS = ['Light', 'Regular', 'Dark'];

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
  const isBeverage = !['pastries', 'snacks', 'beans'].includes(activeProduct.category);
  const sizeData = SIZES.find(s => s.name === size);
  const unitPrice = activeProduct.price + (sizeData?.price_modifier || 0);
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
    const customizations = isBeverage ? { milk, sugar, roast } : {};
    addItem({ ...activeProduct, sizes: SIZES }, quantity, size, customizations);
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
            <img
              src={cardImage}
              alt={group.baseName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.style.display = 'none'; }}
            />
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
              onClick={e => { e.stopPropagation(); handleOpen(); }}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{group.baseName}</DialogTitle>
          </DialogHeader>

          {isGrouped && (
            <div>
              <Label className="text-xs font-medium mb-2 block">Variant</Label>
              <Tabs value={activeProduct.id} onValueChange={id => { setActiveProductId(id); setSize('Medium'); }}>
                <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-xl">
                  {products.map(p => (
                    <TabsTrigger key={p.id} value={p.id} className="rounded-lg text-xs px-3 py-1.5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                      {p.variantName}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="space-y-4">
            {activeProduct.description && (
              <p className="text-sm text-muted-foreground">{activeProduct.description}</p>
            )}

            {isBeverage && (
              <>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Size</Label>
                  <div className="flex gap-2">
                    {SIZES.map(s => (
                      <button key={s.name} onClick={() => setSize(s.name)}
                        className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium border transition-all ${size === s.name ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border text-muted-foreground hover:border-secondary/50'}`}>
                        {s.name}<br />
                        <span className="opacity-75">{s.price_modifier >= 0 ? '+' : ''}{s.price_modifier}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Milk</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {MILK_OPTIONS.map(m => (
                      <button key={m} onClick={() => setMilk(m)}
                        className={`py-1 px-2.5 rounded-full text-xs border transition-all ${milk === m ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border text-muted-foreground hover:border-secondary/50'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Sugar</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGAR_OPTIONS.map(s => (
                      <button key={s} onClick={() => setSugar(s)}
                        className={`py-1 px-2.5 rounded-full text-xs border transition-all ${sugar === s ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border text-muted-foreground hover:border-secondary/50'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Roast</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {ROAST_OPTIONS.map(r => (
                      <button key={r} onClick={() => setRoast(r)}
                        className={`py-1 px-2.5 rounded-full text-xs border transition-all ${roast === r ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border text-muted-foreground hover:border-secondary/50'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-semibold w-5 text-center text-sm">{quantity}</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <span className="font-bold text-secondary">{unitPrice * quantity} ETB</span>
            </div>

            <Button onClick={handleAdd} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}