import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Store } from 'lucide-react';
import { toast } from 'sonner';

const emptyBranch = { name: '', name_am: '', address: '', city: '', phone: '', opening_hours: '', image_url: '', is_active: true, estimated_wait_minutes: 5 };

export default function BranchesAdmin() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBranch);
  const qc = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({ queryKey: ['admin-branches'], queryFn: () => base44.entities.Branch.list() });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Branch.update(editing.id, data) : base44.entities.Branch.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-branches'] }); setOpen(false); setEditing(null); setForm(emptyBranch); toast.success('Branch saved!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Branch.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-branches'] }); toast.success('Branch deleted'); },
  });

  const openEdit = (branch) => { setEditing(branch); setForm(branch); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyBranch); setOpen(true); };
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-primary">Branches</h1><p className="text-sm text-muted-foreground">Manage your store locations</p></div>
        <Button onClick={openNew} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Branch</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(b => (
          <Card key={b.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-secondary" />
                  <h3 className="font-semibold text-sm">{b.name}</h3>
                </div>
                <Switch checked={b.is_active} onCheckedChange={async (v) => { await base44.entities.Branch.update(b.id, { is_active: v }); qc.invalidateQueries({ queryKey: ['admin-branches'] }); }} />
              </div>
              <p className="text-xs text-muted-foreground">{b.address}{b.city ? `, ${b.city}` : ''}</p>
              <p className="text-xs text-muted-foreground mt-1">{b.opening_hours}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => openEdit(b)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(b.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Branch' : 'Add Branch'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><Label className="text-xs">Name (Amharic)</Label><Input value={form.name_am} onChange={e => set('name_am', e.target.value)} /></div>
            <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={e => set('address', e.target.value)} /></div>
            <div><Label className="text-xs">City</Label><Input value={form.city} onChange={e => set('city', e.target.value)} /></div>
            <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><Label className="text-xs">Opening Hours</Label><Input value={form.opening_hours} onChange={e => set('opening_hours', e.target.value)} placeholder="e.g. 6:00 AM - 10:00 PM" /></div>
            <div><Label className="text-xs">Image URL</Label><Input value={form.image_url} onChange={e => set('image_url', e.target.value)} /></div>
            <div><Label className="text-xs">Est. Wait (min)</Label><Input type="number" value={form.estimated_wait_minutes} onChange={e => set('estimated_wait_minutes', Number(e.target.value))} /></div>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="w-full bg-secondary text-secondary-foreground">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}