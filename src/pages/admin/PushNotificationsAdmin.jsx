import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PushNotificationBroadcast from '@/components/admin/PushNotificationBroadcast';
import { Bell, Cake, Send, Loader2, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PushNotificationsAdmin() {
  const [birthdaySending, setBirthdaySending] = useState(false);
  const [birthdayResult, setBirthdayResult] = useState(null);
  const [birthdayUsers, setBirthdayUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchBirthdayUsers = async () => {
      setLoadingUsers(true);
      const now = new Date();
      const todayMonth = now.getMonth() + 1;
      const todayDay = now.getDate();
      const allUsers = await base44.entities.User.list();
      const bday = allUsers.filter(
        u => u.birthday_month === todayMonth && u.birthday_day === todayDay && u.phone
      );
      setBirthdayUsers(bday);
      setLoadingUsers(false);
    };
    fetchBirthdayUsers();
  }, []);

  const sendBirthdayOffers = async () => {
    setBirthdaySending(true);
    try {
      const res = await base44.functions.invoke('sendBirthdayOffers', {});
      const { count, sent } = res.data;
      if (count === 0) {
        toast.info('No users have a birthday today.');
      } else {
        toast.success(`Birthday offers sent to ${sent} subscriber(s)!`);
      }
      setBirthdayResult({ count, sent });
    } catch (err) {
      toast.error('Failed to send birthday offers.');
    } finally {
      setBirthdaySending(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
          <Bell className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Push Notifications</h1>
          <p className="text-sm text-muted-foreground">Broadcast offers, deals & updates to all subscribers</p>
        </div>
      </div>

      {/* Birthday Offers */}
      <Card className="border-0 shadow-sm border-l-4 border-secondary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Cake className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-semibold text-primary">Birthday Offers</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Send a free drink notification to all members whose birthday is <span className="font-medium text-primary">today</span>. Run this daily or set up a scheduled automation.
                </p>
                {birthdayResult && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last run: <span className="text-primary font-medium">{birthdayResult.count} birthday(s) today</span>
                    {birthdayResult.sent !== undefined && <span> · {birthdayResult.sent} notification(s) sent</span>}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={sendBirthdayOffers}
              disabled={birthdaySending}
              className="shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {birthdaySending
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</>
                : <><Send className="h-4 w-4 mr-2" />Send Today's</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Birthday Messages */}
      <Card className="border-0 shadow-sm border-l-4 border-green-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">WhatsApp Birthday Messages</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manually send a WhatsApp birthday greeting to today's birthday members.
              </p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading today's birthdays...
            </div>
          ) : birthdayUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-4 py-3">
              🎂 No members with a birthday today (or missing phone numbers).
            </p>
          ) : (
            <div className="space-y-3">
              {birthdayUsers.map(u => {
                const firstName = (u.full_name || '').split(' ')[0] || 'Friend';
                const couponCode = `BDAY-${u.id.slice(-6).toUpperCase()}`;
                const phone = u.phone.replace(/[^0-9]/g, '');
                const message = encodeURIComponent(
                  `✨ Happy Birthday, ${firstName}! ✨\nThe Milto Coffee family is celebrating you today.\n\n🎁 Enjoy a FREE DRINK on us!\nYour exclusive code: ${couponCode}\n\nShow this message at any Milto Coffee branch.\n☕ Menu: https://miltocoffee.com/menu`
                );
                const waUrl = `https://wa.me/${phone}?text=${message}`;
                return (
                  <div key={u.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-primary">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">{u.phone} · Code: <span className="font-mono font-semibold">{couponCode}</span></p>
                    </div>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" /> Send via WhatsApp
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Broadcast */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <PushNotificationBroadcast />
        </CardContent>
      </Card>
    </div>
  );
}