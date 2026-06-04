import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';
import { format } from 'date-fns';

const METHOD_ICONS = {
  telebirr:  <Smartphone className="h-4 w-4 text-blue-500" />,
  cbe_birr:  <Smartphone className="h-4 w-4 text-green-600" />,
  amole:     <Smartphone className="h-4 w-4 text-purple-500" />,
  visa:      <CreditCard className="h-4 w-4 text-blue-700" />,
  mastercard:<CreditCard className="h-4 w-4 text-red-500" />,
  cash:      <Banknote className="h-4 w-4 text-green-500" />,
};

const METHOD_LABELS = {
  telebirr: 'TeleBirr', cbe_birr: 'CBE Birr', amole: 'Amole',
  visa: 'Visa', mastercard: 'Mastercard', cash: 'Cash',
};

export default function PaymentHistoryList({ orders }) {
  const payments = (orders || [])
    .filter(o => o.payment_method && o.status !== 'cancelled')
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  if (payments.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center text-muted-foreground text-sm py-10">
          <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          No payment history yet.
        </CardContent>
      </Card>
    );
  }

  const totalSpent = payments.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between py-2 mb-2 border-b">
          <span className="text-xs text-muted-foreground">Total Spent</span>
          <span className="font-bold text-sm text-secondary">{totalSpent.toLocaleString()} ETB</span>
        </div>
        <div className="space-y-0">
          {payments.map(order => (
            <div key={order.id} className="flex items-center gap-3 py-2.5 border-b last:border-0">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {METHOD_ICONS[order.payment_method] || <CreditCard className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{METHOD_LABELS[order.payment_method] || order.payment_method}</p>
                <p className="text-xs text-muted-foreground truncate">
                  #{order.order_number || order.id?.slice(-6)} · {order.created_date ? format(new Date(order.created_date), 'MMM d, yyyy') : '—'}
                </p>
              </div>
              <span className="text-sm font-bold shrink-0">{(order.total || 0).toLocaleString()} ETB</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}