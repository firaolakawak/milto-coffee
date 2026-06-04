import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (err) {
    console.log('Sound notification unavailable');
  }
};

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.id }, '-created_date', 20),
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const unread = notifications.filter(n => !n.is_read);

  useEffect(() => {
    if (unread.length > 0) {
      playNotificationSound();
    }
  }, [unread.length]);

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  });

  const markAll = async () => {
    for (const n of unread) await base44.entities.Notification.update(n.id, { is_read: true });
    qc.invalidateQueries({ queryKey: ['notifications', user?.id] });
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Notifications</span>
              {unread.length > 0 && (
                <button onClick={markAll} className="text-xs text-secondary hover:underline">Mark all read</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No notifications yet</p>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.is_read ? 'bg-secondary/5' : ''}`}
                  onClick={() => { if (!n.is_read) markRead.mutate(n.id); }}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 h-2 w-2 rounded-full bg-secondary flex-shrink-0" />}
                    {n.is_read && <span className="mt-1.5 h-2 w-2 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.created_date ? format(new Date(n.created_date), 'MMM d, h:mm a') : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}