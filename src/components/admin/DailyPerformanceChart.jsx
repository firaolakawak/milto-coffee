import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';

const GREEN = 'hsl(155,38%,19%)';
const GOLD = 'hsl(43,50%,50%)';

const RANGE_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
];

export default function DailyPerformanceChart({ orders }) {
  const [range, setRange] = useState(7);

  const data = Array.from({ length: range }, (_, i) => {
    const date = subDays(new Date(), range - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOrders = orders.filter(o =>
      o.created_date ? format(new Date(o.created_date), 'yyyy-MM-dd') === dateStr : false
    );
    return {
      day: format(date, range > 14 ? 'MM/dd' : 'EEE dd'),
      revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
      orders: dayOrders.length,
      avgOrder: dayOrders.length > 0
        ? Math.round(dayOrders.reduce((s, o) => s + (o.total || 0), 0) / dayOrders.length)
        : 0,
    };
  });

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Daily Revenue Trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daily Revenue Trend</CardTitle>
            <div className="flex rounded-full border border-border overflow-hidden text-xs">
              {RANGE_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setRange(opt.days)}
                  className={`px-3 py-1 transition-colors ${range === opt.days ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(155,15%,88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v, name) => [`${v.toLocaleString()} ETB`, name]} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={GREEN} fill="url(#revGrad2)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="avgOrder" name="Avg Order" stroke={GOLD} fill="url(#avgGrad)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Orders Count */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Orders Count</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(155,15%,88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Orders']} />
              <Bar dataKey="orders" name="Orders" fill={GOLD} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}