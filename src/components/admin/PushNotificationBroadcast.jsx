import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Bell, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const PRESETS = [
  { label: '☕ Daily Special', title: 'Today\'s Special at Milto Coffee', message: 'Check out our barista\'s pick of the day — only available today!', url: '/menu' },
  { label: '🎉 New on Menu', title: 'New Arrival at Milto Coffee ✨', message: 'A new coffee just landed on our menu. Be the first to try it!', url: '/menu' },
  { label: '🏷️ Flash Discount', title: 'Flash Offer — Limited Time!', message: 'Get 20% off your next order today only. Don\'t miss it!', url: '/menu' },
  { label: '📅 Upcoming Event', title: 'Join Us at Milto Coffee ☕', message: 'We have an exciting event coming up. Save your spot now!', url: '/events' },
];

export default function PushNotificationBroadcast() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setMessage(preset.message);
    setUrl(preset.url);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in title and message.');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('sendPushNotifications', { title, message, url });
      const results = res.data.results;
      setLastResult(results);
      toast.success(`Sent to ${results.success} device(s)!`);
      setTitle('');
      setMessage('');
      setUrl('/');
    } catch (error) {
      toast.error('Failed to send notifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:bg-muted/70 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compose Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="push-title">Title</Label>
            <Input
              id="push-title"
              placeholder="e.g. Today's Special at Milto Coffee ☕"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={65}
            />
            <p className="text-xs text-muted-foreground">{title.length}/65</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="push-message">Message</Label>
            <textarea
              id="push-message"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Get 20% off your next order today only. Don't miss it!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">{message.length}/150</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="push-url">Tap URL (optional)</Label>
            <Input
              id="push-url"
              placeholder="/menu"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Phone Preview */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground mb-3">Lockscreen Preview</p>
          <div className="w-64 bg-gray-900 rounded-3xl p-4 shadow-2xl">
            <div className="text-center text-gray-400 text-xs mb-3">9:41 AM</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-yellow-400" />
                <span className="text-white text-xs font-semibold">Milto Coffee</span>
                <span className="text-gray-400 text-xs ml-auto">now</span>
              </div>
              <p className="text-white text-sm font-semibold leading-tight">
                {title || 'Notification Title'}
              </p>
              <p className="text-gray-300 text-xs leading-snug">
                {message || 'Your notification message will appear here on the lockscreen.'}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Smartphone className="h-3 w-3" />
            <span>iOS / Android lockscreen</span>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        {lastResult && (
          <p className="text-xs text-muted-foreground">
            Last send: <span className="text-green-600 font-medium">{lastResult.success} delivered</span>
            {lastResult.failed > 0 && <span className="text-destructive"> · {lastResult.failed} failed</span>}
          </p>
        )}
        <Button onClick={handleSend} disabled={loading} className="ml-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          Send Notification
        </Button>
      </div>
    </div>
  );
}