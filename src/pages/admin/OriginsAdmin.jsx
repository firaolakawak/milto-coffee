import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Leaf, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const emptyOrigin = { region: '', region_am: '', story: '', story_am: '', flavor_profile: '', altitude: '', processing_method: '', farmer_info: '', image_url: '' };

export default function OriginsAdmin() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyOrigin);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const qc = useQueryClient();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
    toast.success('Image uploaded!');
  };

  const { data: origins = [] } = useQuery({ queryKey: ['admin-origins'], queryFn: () => base44.entities.CoffeeOrigin.list() });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.CoffeeOrigin.update(editing.id, data) : base44.entities.CoffeeOrigin.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-origins'] }); setOpen(false); setEditing(null); setForm(emptyOrigin); toast.success('Origin saved!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CoffeeOrigin.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-origins'] }); toast.success('Origin deleted'); },
  });

  const openEdit = (o) => { setEditing(o); setForm(o); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyOrigin); setOpen(true); };
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-primary">Coffee Origins</h1><p className="text-sm text-muted-foreground">Manage origin stories and regions</p></div>
        <Button onClick={openNew} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Origin</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {origins.map(o => (
          <Card key={o.id} className="border-0 shadow-sm overflow-hidden">
            {o.image_url && (
              <div className="h-32 overflow-hidden">
                <img src={o.image_url} alt={o.region} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-accent" />
                <h3 className="font-display font-semibold">{o.region}</h3>
                {o.region_am && <span className="text-xs text-muted-foreground">({o.region_am})</span>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{o.story}</p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                {o.altitude && <span>📍 {o.altitude}</span>}
                {o.processing_method && <span>⚙️ {o.processing_method}</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => openEdit(o)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(o.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {origins.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No origins added yet</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Origin' : 'Add Origin'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Region</Label><Input value={form.region} onChange={e => set('region', e.target.value)} /></div>
            <div><Label className="text-xs">Region (Amharic)</Label><Input value={form.region_am} onChange={e => set('region_am', e.target.value)} /></div>
            <div><Label className="text-xs">Story</Label><Textarea value={form.story} onChange={e => set('story', e.target.value)} rows={4} /></div>
            <div><Label className="text-xs">Story (Amharic)</Label><Textarea value={form.story_am} onChange={e => set('story_am', e.target.value)} rows={3} /></div>
            <div><Label className="text-xs">Flavor Profile</Label><Input value={form.flavor_profile} onChange={e => set('flavor_profile', e.target.value)} placeholder="e.g. Floral, Citrus, Tea-like" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Altitude</Label><Input value={form.altitude} onChange={e => set('altitude', e.target.value)} placeholder="e.g. 1,700-2,200m" /></div>
              <div><Label className="text-xs">Processing</Label><Input value={form.processing_method} onChange={e => set('processing_method', e.target.value)} /></div>
            </div>
            <div><Label className="text-xs">Farmer Info</Label><Textarea value={form.farmer_info} onChange={e => set('farmer_info', e.target.value)} rows={2} /></div>
            {/* Cover Image Upload */}
            <div>
              <Label className="text-xs">Cover Image</Label>
              <div className="mt-1 space-y-2">
                {form.image_url && (
                  <div className="relative h-36 rounded-xl overflow-hidden border border-border">
                    <img src={form.image_url} alt="cover" className="w-full h-full object-cover" />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? (
                    <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-t-transparent border-primary rounded-full animate-spin" /> Uploading...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Upload className="h-3.5 w-3.5" /> {form.image_url ? 'Change Image' : 'Upload Cover Image'}</span>
                  )}
                </Button>
                {form.image_url && (
                  <Input className="text-xs" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="or paste image URL" />
                )}
              </div>
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