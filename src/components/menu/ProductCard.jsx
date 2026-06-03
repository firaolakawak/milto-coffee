import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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

export default function ProductCard({ product }) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState('Medium');
  const [milk, setMilk] = useState('Whole');
  const [sugar, setSugar] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const isBeverage = !['pastries', 'snacks', 'beans'].includes(product.category);
  const sizeData = SIZES.find(s => s.name === size);
  const unitPrice = product.price + (sizeData?.price_modifier || 0);

  const handleAdd = () => {
    const customizations = isBeverage ? { milk, sugar } : {};
    addItem({ ...product, sizes: SIZES }, quantity, size, customizations);
    toast.success(`Added ${product.name} to cart`);
    setOpen(false);
    setQuantity(1);
  };

  return (
    <>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setOpen(true)}>
        <div className="h-40 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <span className="text-5xl opacity-60">☕</span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-primary text-sm">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-secondary">{product.price} ETB</span>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{product.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

            {isBeverage && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Size</Label>
                  <RadioGroup value={size} onValueChange={setSize} className="flex gap-3">
                    {SIZES.map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <RadioGroupItem value={s.name} id={`size-${s.name}`} />
                        <Label htmlFor={`size-${s.name}`} className="text-sm cursor-pointer">
                          {s.name} ({s.price_modifier >= 0 ? '+' : ''}{s.price_modifier} ETB)
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Milk</Label>
                    <Select value={milk} onValueChange={setMilk}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MILK_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Sugar</Label>
                    <Select value={sugar} onValueChange={setSugar}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SUGAR_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
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