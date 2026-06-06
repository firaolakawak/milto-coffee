import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';

const RANGE_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: 'All', days: null },
];

const COLORS = [
  'hsl(43,50%,50%)',
  'hsl(155,38%,19%)',
  'hsl(155,30%,35%)',
  'hsl(43,35%,65%)',
  'hsl(155,20%,50%)',
];

export default function BranchPerformanceChart({ orders, branches }) {
  const [range, setRange] = useState(7);
  const [metric, setMetric] = useState('revenue');

  const cutoff = range ? subDays(new Date(), range) : null;
  const filtered = cutoff ? orders.filter(o => new Date(o.created_date) >= cutoff) : orders;

  // Build daily data points per branch
  const days = range ?? 30;
  const datePoints = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = subDays(new Date(), Math.min(days, 30) - 1 - i);
    return format(date, 'MMM d');
  });

  const chartData = datePoints.map(label => {
    const row = { name: label };
    branches.forEach((b, i) => {
      const branchLabel = b.name?.replace('Milto Coffee - ', '').replace('Milto Coffee', 'Main') || `Branch ${i + 1}`;
      const dateStr = label;
      const dayOrders = filtered.filter(o => {
        const match = b.id ? o.branch_id === b.id : o.branch_name === b.name;
        return match && format(new Date(o.created_date), 'MMM d') === dateStr;
      });
      row[branchLabel] = metric === 'revenue'
        ? dayOrders.reduce((s, o) => s + (o.total || 0), 0)
        : dayOrders.length;
    });
    return row;
  });

  const branchLabels = branches.map((b, i) =>
    b.name?.replace('Milto Coffee - ', '').replace('Milto Coffee', 'Main') || `Branch ${i + 1}`
  );

  // Summary per branch
  const summary = branches.map((b, i) => {
    const label = branchLabels[i];
    const branchOrders = filtered.filter(o => b.id ? o.branch_id === b.id : o.branch_name === b.name);
    return {
      label,
      value: metric === 'revenue' ? branchOrders.reduce((s, o) => s + (o.total || 0), 0) : branchOrders.length,
      color: COLORS[i % COLORS.length],
    };
  });

  const total = summary.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="border-0 shadow-sm mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">Branch Performance</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-border overflow-hidden text-xs">
              <button onClick={() => setMetric('revenue')} className={`px-3 py-1 transition-colors ${metric === 'revenue' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}>Revenue</button>
              <button onClick={() => setMetric('orders')} className={`px-3 py-1 transition-colors ${metric === 'orders' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}>Orders</button>
            </div>
            <div className="flex rounded-full border border-border overflow-hidden text-xs">
              {RANGE_OPTIONS.map(opt => (
                <button key={opt.label} onClick={() => setRange(opt.days)} className={`px-3 py-1 transition-colors ${range === opt.days ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}>{opt.label}</button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No branch data yet</p>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(155,15%,88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => metric === 'revenue' ? [`${v.toLocaleString()} ETB`] : [v, 'Orders']} />
                  {branchLabels.map((label, i) => (
                    <Line
                      key={label}
                      type="monotone"
                      dataKey={label}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend right */}
            <div className="flex flex-col justify-center gap-3 min-w-[140px]">
              {summary.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs font-medium truncate max-w-[80px]">{d.label}</span>
                  </div>
                  <span className="text-xs font-bold text-secondary">
                    {metric === 'revenue' ? `${d.value.toLocaleString()} ETB` : `${d.value}`}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 text-xs text-muted-foreground text-right">
                Total: {metric === 'revenue' ? `${total.toLocaleString()} ETB` : total}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}