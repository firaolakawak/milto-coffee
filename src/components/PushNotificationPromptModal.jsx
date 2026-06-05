import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { Bell, ShieldAlert, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationPromptModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'default') {
      const hasPrompted = localStorage.getItem('milto_push_prompted');
      if (!hasPrompted || Date.now() - parseInt(hasPrompted) > 7 * 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => setOpen(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported on your browser.');
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const granted = await Notification.requestPermission();

      if (granted !== 'granted') {
        toast.error('Notification permission was denied. You can enable them later in browser settings.');
        localStorage.setItem('milto_push_prompted', Date.now().toString());
        setOpen(false);
        setLoading(false);
        return;
      }

      const res = await base44.functions.invoke('getVapidPublicKey', {});
      const vapidPublicKey = res.data.publicKey;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const subJson = subscription.toJSON();
      await base44.entities.PushSubscription.create({
        user_id: user?.id,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth
        },
        device_info: navigator.userAgent.substring(0, 200)
      });

      toast.success('🎉 Notifications enabled! You\'ll get alerts for offers and order updates.');
      setOpen(false);
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast.error('Failed to enable notifications. Please open the app in a dedicated browser tab.');
    } finally {
      setLoading(false);
      localStorage.setItem('milto_push_prompted', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('milto_push_prompted', Date.now().toString());
    setOpen(false);
  };

  if (!user || !('Notification' in window) || Notification.permission === 'granted') return null;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss(); }}>
      <DialogContent className="max-w-sm mx-4">
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-primary animate-bounce" />
            <Sparkles className="h-5 w-5 text-secondary absolute -top-1 -right-1" />
          </div>

          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-xl font-heading text-primary font-bold">
              Stay in the Loop! ☕
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Get instant lockscreen alerts when your coffee is ready, flash promotions go live, or we drop new menu items!
            </DialogDescription>
          </DialogHeader>

          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-3 my-4 text-xs text-muted-foreground flex items-start gap-2 text-left w-full">
            <ShieldAlert className="h-4 w-4 shrink-0 text-secondary mt-0.5" />
            <span>Open this app in a <strong>full browser tab</strong> (not a preview frame) to allow notification permissions.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="ghost"
              className="flex-1 rounded-full text-muted-foreground"
              onClick={handleDismiss}
              disabled={loading}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold gap-2"
              onClick={handleSubscribe}
              disabled={loading}
            >
              <Bell className="h-4 w-4" />
              {loading ? 'Enabling...' : 'Enable Alerts'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}