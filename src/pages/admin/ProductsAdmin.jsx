import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import MobileSheetSelect from '@/components/ui/MobileSheetSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Upload, Download, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['espresso', 'macchiato', 'cappuccino', 'latte', 'cold_brew', 'traditional', 'specialty', 'pastries', 'snacks', 'beans'];
const emptyProduct = { name: '', name_am: '', description: '', description_am: '', category: 'espresso', price: 0, image_url: '', is_available: true, is_featured: false };

export default function ProductsAdmin() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [filterCat, setFilterCat] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => base44.entities.Product.list('-created_date', 200) });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Product.update(editing.id, data) : base44.entities.Product.create(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['admin-products'] });
      const prev = qc.getQueryData(['admin-products']);
      if (editing) {
        qc.setQueryData(['admin-products'], (old) =>
          old.map(p => p.id === editing.id ? { ...p, ...data } : p)
        );
      } else {
        qc.setQueryData(['admin-products'], (old) =>
          [{ ...emptyProduct, ...data, id: Date.now().toString() }, ...old]
        );
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) qc.setQueryData(['admin-products'], context.prev);
      toast.error('Failed to save product');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setOpen(false); setEditing(null); setForm(emptyProduct); toast.success('Product saved!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['admin-products'] });
      const prev = qc.getQueryData(['admin-products']);
      qc.setQueryData(['admin-products'], (old) => old.filter(p => p.id !== id));
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) qc.setQueryData(['admin-products'], context.prev);
      toast.error('Failed to delete product');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
  });

  const openEdit = (p) => { setEditing(p); setForm(p); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyProduct); setOpen(true); };
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('image_url', file_url);
    setUploadingImage(false);
    toast.success('Image uploaded!');
    e.target.value = '';
  };

  const handleExport = () => {
    const headers = ['name', 'name_am', 'category', 'price', 'description', 'description_am', 'image_url', 'is_available', 'is_featured'];
    const rows = products.map(p => headers.map(h => {
      const val = p[h] ?? '';
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'milto_menu.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Menu exported!');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || line.split(',');
        const obj = {};
        headers.forEach((h, i) => {
          let v = (vals[i] || '').trim().replace(/^"|"$/g, '');
          if (h === 'price') v = Number(v) || 0;
          else if (h === 'is_available' || h === 'is_featured') v = v === 'true' || v === '1';
          obj[h] = v;
        });
        return obj;
      }).filter(r => r.name);
      let count = 0;
      for (const row of rows) {
        await base44.entities.Product.create({ ...emptyProduct, ...row });
        count++;
      }
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(`Imported ${count} products!`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background px-6 pt-6 pb-4 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="font-display text-2xl font-bold text-primary">Products</h1><p className="text-sm text-muted-foreground">Manage your menu items</p></div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button variant="outline" onClick={() => fileInputRef.current.click()} className="rounded-full"><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>
          <Button variant="outline" onClick={handleExport} className="rounded-full"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          <Button onClick={openNew} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </div>
      </div>

      <Tabs value={filterCat} onValueChange={setFilterCat}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="all" className="rounded-full px-3 py-1 text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">All</TabsTrigger>
          {CATEGORIES.map(c => <TabsTrigger key={c} value={c} className="rounded-full px-3 py-1 text-xs capitalize data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">{c.replace('_', ' ')}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="border-0 shadow-sm overflow-hidden">
            {p.image_url ? (
              <div className="h-32 overflow-hidden">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-24 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-1">
                <Badge variant="secondary" className="text-xs capitalize">{p.category?.replace('_', ' ')}</Badge>
                <Switch checked={p.is_available} onCheckedChange={(v) => {
                 qc.setQueryData(['admin-products'], (old) =>
                   old.map(prod => prod.id === p.id ? { ...prod, is_available: v } : prod)
                 );
                 base44.entities.Product.update(p.id, { is_available: v }).then(() => {
                   qc.invalidateQueries({ queryKey: ['admin-products'] });
                 });
               }} />
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
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><Label className="text-xs">Name (Amharic)</Label><Input value={form.name_am} onChange={e => set('name_am', e.target.value)} /></div>
            <div><Label className="text-xs">Category</Label>
              <MobileSheetSelect
                value={form.category}
                onValueChange={v => set('category', v)}
                placeholder="Category"
                options={CATEGORIES.map(value => ({ value, label: value.replace('_', ' ') }))}
                triggerClassName="capitalize"
              />
            </div>
            <div><Label className="text-xs">Price (ETB)</Label><Input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></div>
            <div><Label className="text-xs">Description (Amharic)</Label><Textarea value={form.description_am} onChange={e => set('description_am', e.target.value)} rows={2} /></div>
            {/* Product Image */}
            <div>
              <Label className="text-xs">Product Image</Label>
              <div className="mt-1 space-y-2">
                {form.image_url && (
                  <div className="relative h-36 rounded-xl overflow-hidden border border-border">
                    <img src={form.image_url} alt="product" className="w-full h-full object-cover" />
                  </div>
                )}
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}>
                  {uploadingImage ? (
                    <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-t-transparent border-primary rounded-full animate-spin" /> Uploading...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Upload className="h-3.5 w-3.5" /> {form.image_url ? 'Change Image' : 'Upload Image'}</span>
                  )}
                </Button>
                <Input
                  value={form.image_url}
                  onChange={e => set('image_url', e.target.value)}
                  placeholder="or paste image URL here"
                  className="text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Stock Level</Label><Input type="number" value={form.stock_level ?? 100} onChange={e => set('stock_level', Number(e.target.value))} /></div>
              <div><Label className="text-xs">Low Stock Threshold</Label><Input type="number" value={form.stock_threshold ?? 10} onChange={e => set('stock_threshold', Number(e.target.value))} /></div>
            </div>
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
