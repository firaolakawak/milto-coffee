import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PushNotificationBroadcast from '@/components/admin/PushNotificationBroadcast';
import { Bell } from 'lucide-react';

export default function PushNotificationsAdmin() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
          <Bell className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Push Notifications</h1>
          <p className="text-sm text-muted-foreground">Broadcast offers, deals & updates to all subscribers</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <PushNotificationBroadcast />
        </CardContent>
      </Card>
    </div>
  );
}