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

export default function ProductCard({ group }) {
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

  // The currently active product in the dialog
  const activeProduct = products.find(p => p.id === activeProductId) || primaryProduct;

  const isBeverage = !['pastries', 'snacks', 'beans'].includes(activeProduct.category);
  const sizeData = SIZES.find(s => s.name === size);
  const unitPrice = activeProduct.price + (sizeData?.price_modifier || 0);

  // Price display on the card: show range if variants differ in price
  const prices = products.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceLabel = minPrice === maxPrice ? `${minPrice} ETB` : `${minPrice}–${maxPrice} ETB`;

  const handleOpen = () => {
    setActiveProductId(primaryProduct.id);
    setSize('Medium');
    setMilk('Whole');
    setSugar('Regular');
    setRoast('Regular');
    setQuantity(1);
    setOpen(true);
  };

  const handleTabChange = (productId) => {
    setActiveProductId(productId);
    setSize('Medium');
    setMilk('Whole');
    setSugar('Regular');
    setRoast('Regular');
    setQuantity(1);
  };

  const handleAdd = () => {
    const customizations = isBeverage ? { milk, sugar, roast } : {};
    addItem({ ...activeProduct, sizes: SIZES }, quantity, size, customizations);
    toast.success(`Added ${activeProduct.name} to cart`);
    setOpen(false);
    setQuantity(1);
  };

  // Image from the first product that has one
  const cardImage = products.find(p => p.image_url)?.image_url;

  return (
    <>
      <Card
        className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleOpen}
      >
        <div className="h-40 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center overflow-hidden relative">
          {cardImage ? (
            <img
              src={cardImage}
              alt={group.baseName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <span
            className="text-5xl opacity-60 absolute inset-0 flex items-center justify-center"
            style={{ display: cardImage ? 'none' : 'flex' }}
          >☕</span>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-primary text-sm">{group.baseName}</h2>
          {isGrouped && (
            <p className="text-xs text-muted-foreground mt-0.5">{products.length} variants</p>
          )}
          {!isGrouped && primaryProduct.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{primaryProduct.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-secondary">{priceLabel}</span>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{group.baseName}</DialogTitle>
          </DialogHeader>

          {/* Variant Tabs */}
          {isGrouped && (
            <div className="mb-2">
              <Label className="text-sm font-medium mb-2 block">Choose Variant</Label>
              <Tabs value={activeProduct.id} onValueChange={handleTabChange}>
                <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-xl">
                  {products.map(p => (
                    <TabsTrigger
                      key={p.id}
                      value={p.id}
                      className="rounded-lg text-xs px-3 py-1.5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                    >
                      {p.variantName}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="space-y-5">
            {activeProduct.description && (
              <p className="text-sm text-muted-foreground">{activeProduct.description}</p>
            )}

            {isBeverage && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Size</Label>
                  <div className="flex gap-2">
                    {SIZES.map(s => (
                      <button
                        key={s.name}
                        onClick={() => setSize(s.name)}
                        className={`flex-1 py-2 px-3 rounded-full text-sm font-medium border transition-all ${size === s.name ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-transparent border-border text-muted-foreground hover:border-secondary/50'}`}
                      >
                        {s.name}<br />
                        <span className="text-xs opacity-75">{s.price_modifier >= 0 ? '+' : ''}{s.price_modifier} ETB</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Milk</Label>
                  <div className="flex flex-wrap gap-2">
                    {MILK_OPTIONS.map(m => (
                      <button
                        key={m}
                        onClick={() => setMilk(m)}
                        className={`py-1.5 px-3 rounded-full text-sm border transition-all ${milk === m ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-transparent border-border text-muted-foreground hover:border-secondary/50'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sugar</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUGAR_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setSugar(s)}
                        className={`py-1.5 px-3 rounded-full text-sm border transition-all ${sugar === s ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-transparent border-border text-muted-foreground hover:border-secondary/50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Roast</Label>
                  <div className="flex flex-wrap gap-2">
                    {ROAST_OPTIONS.map(r => (
                      <button
                        key={r}
                        onClick={() => setRoast(r)}
                        className={`py-1.5 px-3 rounded-full text-sm border transition-all ${roast === r ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-transparent border-border text-muted-foreground hover:border-secondary/50'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-semibold w-6 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-lg font-bold text-secondary">{unitPrice * quantity} ETB</span>
            </div>

            <Button onClick={handleAdd} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}