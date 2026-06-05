import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function BirthdayPromptModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !user.birthday_day && !user.birthday_month) {
      setOpen(true);
    }
  }, [user]);

  const handleSave = async () => {
    if (!month || !day) return;
    setSaving(true);
    await base44.auth.updateMe({
      birthday_day: parseInt(day),
      birthday_month: parseInt(month),
    });
    toast.success('Birthday saved! 🎂 Enjoy a free drink on your special day.');
    setSaving(false);
    setOpen(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">🎂 When's your birthday?</DialogTitle>
          <DialogDescription className="text-sm">
            Get a <span className="font-semibold text-secondary">free birthday drink</span> on us! Just tell us your birthday month and day.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => (
                <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={() => setOpen(false)}>
            Remind me later
          </Button>
          <Button
            className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"
            onClick={handleSave}
            disabled={!month || !day || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}