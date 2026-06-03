import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Percent, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const emptyPromo = { title: '', title_am: '', description: '', code: '', discount_type: 'percentage', discount_value: 0, min_order: 0, start_date: '', end_date: '', is_active: true, image_url: '' };

export default function PromotionsAdmin() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPromo);
  const qc = useQueryClient();

  const { data: promos = [] } = useQuery({ queryKey: ['admin-promos'], queryFn: () => base44.entities.Promotion.list('-created_date', 100) });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Promotion.update(editing.id, data) : base44.entities.Promotion.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-promos'] }); setOpen(false); setEditing(null); setForm(emptyPromo); toast.success('Promotion saved!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Promotion.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-promos'] }); toast.success('Promotion deleted'); },
  });

  const openEdit = (p) => { setEditing(p); setForm(p); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyPromo); setOpen(true); };
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-primary">Promotions</h1><p className="text-sm text-muted-foreground">Manage promo codes and campaigns</p></div>
        <Button onClick={openNew} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Promotion</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map(p => (
          <Card key={p.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="font-mono text-xs">{p.code}</Badge>
                <Switch checked={p.is_active} onCheckedChange={async (v) => { await base44.entities.Promotion.update(p.id, { is_active: v }); qc.invalidateQueries({ queryKey: ['admin-promos'] }); }} />
              </div>
              <h3 className="font-semibold text-sm">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              <div className="flex items-center gap-2 mt-3">
                {p.discount_type === 'percentage' ? <Percent className="h-4 w-4 text-secondary" /> : <DollarSign className="h-4 w-4 text-secondary" />}
                <span className="font-bold text-secondary">{p.discount_value}{p.discount_type === 'percentage' ? '%' : ' ETB'} off</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {promos.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No promotions yet</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Promotion' : 'Add Promotion'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => set('title', e.target.value)} /></div>
            <div><Label className="text-xs">Promo Code</Label><Input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} className="font-mono" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Discount Type</Label>
                <Select value={form.discount_type} onValueChange={v => set('discount_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Discount Value</Label><Input type="number" value={form.discount_value} onChange={e => set('discount_value', Number(e.target.value))} /></div>
            </div>
            <div><Label className="text-xs">Min Order (ETB)</Label><Input type="number" value={form.min_order} onChange={e => set('min_order', Number(e.target.value))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start Date</Label><Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
              <div><Label className="text-xs">End Date</Label><Input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} /></div>
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