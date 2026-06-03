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
import { Plus, Pencil, Trash2, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TYPES = ['tasting', 'brewing_workshop', 'roasting_workshop', 'community', 'promotion'];
const emptyEvent = { title: '', title_am: '', description: '', description_am: '', type: 'tasting', date: '', branch_name: '', capacity: 30, price: 0, image_url: '', is_active: true };

export default function EventsAdmin() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const qc = useQueryClient();

  const { data: events = [] } = useQuery({ queryKey: ['admin-events'], queryFn: () => base44.entities.Event.list('-date', 100) });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Event.update(editing.id, data) : base44.entities.Event.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setOpen(false); setEditing(null); setForm(emptyEvent); toast.success('Event saved!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Event deleted'); },
  });

  const openEdit = (e) => { setEditing(e); setForm({ ...e, date: e.date ? new Date(e.date).toISOString().slice(0, 16) : '' }); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyEvent); setOpen(true); };
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-primary">Events</h1><p className="text-sm text-muted-foreground">Manage workshops and events</p></div>
        <Button onClick={openNew} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Event</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {events.map(e => (
          <Card key={e.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="text-xs capitalize">{e.type?.replace('_', ' ')}</Badge>
                <Switch checked={e.is_active} onCheckedChange={async (v) => { await base44.entities.Event.update(e.id, { is_active: v }); qc.invalidateQueries({ queryKey: ['admin-events'] }); }} />
              </div>
              <h3 className="font-semibold text-sm">{e.title}</h3>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.date ? format(new Date(e.date), 'MMM d, h:mm a') : 'TBD'}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {e.registered_count || 0}/{e.capacity}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => openEdit(e)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(e.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No events yet</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Event' : 'Add Event'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => set('title', e.target.value)} /></div>
            <div><Label className="text-xs">Title (Amharic)</Label><Input value={form.title_am} onChange={e => set('title_am', e.target.value)} /></div>
            <div><Label className="text-xs">Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Date & Time</Label><Input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></div>
            <div><Label className="text-xs">Branch Name</Label><Input value={form.branch_name} onChange={e => set('branch_name', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Capacity</Label><Input type="number" value={form.capacity} onChange={e => set('capacity', Number(e.target.value))} /></div>
              <div><Label className="text-xs">Price (ETB)</Label><Input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} /></div>
            </div>
            <div><Label className="text-xs">Image URL</Label><Input value={form.image_url} onChange={e => set('image_url', e.target.value)} /></div>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="w-full bg-secondary text-secondary-foreground">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}