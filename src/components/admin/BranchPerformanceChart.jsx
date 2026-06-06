import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, format } from 'date-fns';

const RANGE_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: 'All', days: null },
];

const COLORS = [
  'hsl(155,38%,19%)',
  'hsl(43,50%,50%)',
  'hsl(155,30%,35%)',
  'hsl(43,35%,65%)',
  'hsl(155,20%,50%)',
];

export default function BranchPerformanceChart({ orders, branches }) {
  const [range, setRange] = useState(7);
  const [metric, setMetric] = useState('revenue'); // 'revenue' | 'orders'

  const cutoff = range ? subDays(new Date(), range) : null;
  const filtered = cutoff ? orders.filter(o => new Date(o.created_date) >= cutoff) : orders;

  const data = branches.map((b, i) => {
    const branchOrders = filtered.filter(o => o.branch_id === b.id || o.branch_name === b.name);
    return {
      name: b.name?.replace('Milto Coffee - ', '').replace('Milto Coffee', 'Main') || `Branch ${i + 1}`,
      revenue: branchOrders.reduce((s, o) => s + (o.total || 0), 0),
      orders: branchOrders.length,
      color: COLORS[i % COLORS.length],
    };
  }).sort((a, b) => b[metric] - a[metric]);

  const totalMetric = data.reduce((s, d) => s + d[metric], 0);

  return (
    <Card className="border-0 shadow-sm mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">Branch Performance</CardTitle>
          <div className="flex items-center gap-2">
            {/* Metric toggle */}
            <div className="flex rounded-full border border-border overflow-hidden text-xs">
              <button
                onClick={() => setMetric('revenue')}
                className={`px-3 py-1 transition-colors ${metric === 'revenue' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}
              >Revenue</button>
              <button
                onClick={() => setMetric('orders')}
                className={`px-3 py-1 transition-colors ${metric === 'orders' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}
              >Orders</button>
            </div>
            {/* Range toggle */}
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
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No branch data yet</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(155,15%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => metric === 'revenue' ? [`${v.toLocaleString()} ETB`, 'Revenue'] : [v, 'Orders']}
                />
                <Bar dataKey={metric} radius={[4, 4, 0, 0]}>
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Summary row */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs font-medium truncate max-w-[100px]">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-secondary">
                    {metric === 'revenue' ? `${d.revenue.toLocaleString()} ETB` : `${d.orders} orders`}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              Total: {metric === 'revenue' ? `${totalMetric.toLocaleString()} ETB` : `${totalMetric} orders`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}