import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const GREEN = 'hsl(155,38%,19%)';
const GOLD = 'hsl(43,50%,50%)';

const HOUR_LABELS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a',
                     '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TimePerformanceChart({ orders }) {
  // Orders by hour of day
  const hourMap = Array.from({ length: 24 }, (_, h) => ({ hour: HOUR_LABELS[h], orders: 0, revenue: 0 }));
  orders.forEach(o => {
    if (!o.created_date) return;
    const h = new Date(o.created_date).getHours();
    hourMap[h].orders += 1;
    hourMap[h].revenue += o.total || 0;
  });

  // Orders by day of week
  const dayMap = Array.from({ length: 7 }, (_, d) => ({ day: DAY_LABELS[d], orders: 0, revenue: 0 }));
  orders.forEach(o => {
    if (!o.created_date) return;
    const d = new Date(o.created_date).getDay();
    dayMap[d].orders += 1;
    dayMap[d].revenue += o.total || 0;
  });

  // Peak hours — only show meaningful hours (where there are orders, or trim edges)
  const peakHours = hourMap.filter((_, i) => i >= 5 && i <= 23);

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Hourly performance */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Peak Hours</CardTitle>
          <p className="text-xs text-muted-foreground">Orders by hour of day</p>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={peakHours} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(155,15%,88%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v, name) => name === 'Revenue' ? [`${v.toLocaleString()} ETB`, name] : [v, name]}
                />
                <Bar dataKey="orders" name="Orders" fill={GREEN} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Day of week performance — Radar */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Pattern</CardTitle>
          <p className="text-xs text-muted-foreground">Orders & revenue by day of week</p>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart cx="50%" cy="50%" outerRadius={80} data={dayMap}>
                <PolarGrid stroke="hsl(155,15%,88%)" />
                <PolarAngleAxis dataKey="day" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} />
                <Radar name="Orders" dataKey="orders" stroke={GREEN} fill={GREEN} fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Revenue" dataKey="revenue" stroke={GOLD} fill={GOLD} fillOpacity={0.15} strokeWidth={2} />
                <Tooltip formatter={(v, name) => name === 'Revenue' ? [`${v.toLocaleString()} ETB`, name] : [v, name]} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}