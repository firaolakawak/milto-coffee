import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Bell, BellOff, Loader2 } from 'lucide-react';
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

export default function PushNotificationManager() {
  const { user } = useAuth();
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setSubscribed(true);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported on this browser.');
      return;
    }

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const granted = await Notification.requestPermission();
      setPermission(granted);

      if (granted !== 'granted') {
        toast.error('Notification permission was denied.');
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

      setSubscribed(true);
      toast.success('🎉 You\'ll now receive offers & updates!');
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast.error('Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !('Notification' in window)) return null;

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="h-4 w-4 text-secondary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Offers & Daily Deals</p>
          <p className="text-xs text-muted-foreground">Get notified about new menu items, promotions & exclusive discounts.</p>
        </div>
      </div>
      <Button
        size="sm"
        variant={subscribed ? 'outline' : 'default'}
        onClick={handleSubscribe}
        disabled={loading || subscribed}
        className="shrink-0"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : subscribed ? (
          <><BellOff className="h-4 w-4 mr-1" /> On</>
        ) : (
          <><Bell className="h-4 w-4 mr-1" /> Enable</>
        )}
      </Button>
    </div>
  );
}