import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['espresso', 'macchiato', 'cappuccino', 'latte', 'cold_brew', 'traditional', 'specialty', 'pastries', 'snacks', 'beans'];
const emptyProduct = { name: '', name_am: '', description: '', description_am: '', category: 'espresso', price: 0, image_url: '', is_available: true, is_featured: false };

export default function ProductsAdmin() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [filterCat, setFilterCat] = useState('all');
  const qc = useQueryClient();

  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => base44.entities.Product.list('-created_date', 200) });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Product.update(editing.id, data) : base44.entities.Product.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setOpen(false); setEditing(null); setForm(emptyProduct); toast.success('Product saved!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
  });

  const openEdit = (p) => { setEditing(p); setForm(p); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyProduct); setOpen(true); };
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="font-display text-2xl font-bold text-primary">Products</h1><p className="text-sm text-muted-foreground">Manage your menu items</p></div>
        <Button onClick={openNew} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>

      <Tabs value={filterCat} onValueChange={setFilterCat} className="mb-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="all" className="rounded-full px-3 py-1 text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">All</TabsTrigger>
          {CATEGORIES.map(c => <TabsTrigger key={c} value={c} className="rounded-full px-3 py-1 text-xs capitalize data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">{c.replace('_', ' ')}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <Badge variant="secondary" className="text-xs capitalize">{p.category?.replace('_', ' ')}</Badge>
                <Switch checked={p.is_available} onCheckedChange={async (v) => { await base44.entities.Product.update(p.id, { is_available: v }); qc.invalidateQueries({ queryKey: ['admin-products'] }); }} />
              </div>
              <h3 className="font-semibold text-sm mt-2">{p.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-secondary">{p.price} ETB</span>
                <div className="flex gap-1">
                  {p.is_featured && <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Featured</Badge>}
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><Label className="text-xs">Name (Amharic)</Label><Input value={form.name_am} onChange={e => set('name_am', e.target.value)} /></div>
            <div><Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('_', ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Price (ETB)</Label><Input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></div>
            <div><Label className="text-xs">Description (Amharic)</Label><Textarea value={form.description_am} onChange={e => set('description_am', e.target.value)} rows={2} /></div>
            <div><Label className="text-xs">Image URL</Label><Input value={form.image_url} onChange={e => set('image_url', e.target.value)} /></div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Featured</Label><Switch checked={form.is_featured} onCheckedChange={v => set('is_featured', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Available</Label><Switch checked={form.is_available} onCheckedChange={v => set('is_available', v)} />
            </div>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="w-full bg-secondary text-secondary-foreground">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}