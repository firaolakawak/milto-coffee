import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip
} from 'recharts';
import { subDays, format } from 'date-fns';

const GREEN = 'hsl(155,38%,19%)';
const GOLD = 'hsl(43,50%,50%)';
const GOLD_LIGHT = 'hsl(43,35%,65%)';
const GREEN2 = 'hsl(155,30%,35%)';
const PIE_COLORS = [GREEN, GOLD, GREEN2, GOLD_LIGHT, 'hsl(155,20%,50%)'];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SalesTrendsChart({ orders }) {
  // Last 7 days revenue data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOrders = orders.filter(o => o.created_date ? format(new Date(o.created_date), 'yyyy-MM-dd') === dateStr : false);
    return {
      day: format(date, 'EEE'),
      revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
      orders: dayOrders.length,
    };
  });

  // Top 6 products by revenue + count for combo chart
  const productMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const name = item.product_name || 'Unknown';
      if (!productMap[name]) productMap[name] = { revenue: 0, count: 0 };
      productMap[name].revenue += item.total_price || 0;
      productMap[name].count += item.quantity || 1;
    });
  });
  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6)
    .map(([name, d]) => ({
      name: name.length > 13 ? name.slice(0, 13) + '…' : name,
      revenue: d.revenue,
      count: d.count,
    }));

  // Revenue pie by branch
  const branchRevMap = {};
  orders.forEach(o => {
    const key = o.branch_name || 'Unknown';
    branchRevMap[key] = (branchRevMap[key] || 0) + (o.total || 0);
  });
  const pieData = Object.entries(branchRevMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Top Products — Combo bar + line */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No order data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart data={topProducts} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(155,15%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v, name) => name === 'Revenue (ETB)' ? [`${v.toLocaleString()} ETB`, name] : [v, name]}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue (ETB)" fill={GOLD} radius={[3, 3, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="Qty Sold" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Revenue Overview — Pie chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue Overview</CardTitle>
          <p className="text-xs text-muted-foreground">Branch Revenue Distribution</p>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v.toLocaleString()} ETB`]} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex-1 space-y-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs truncate max-w-[90px]">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-secondary whitespace-nowrap">{d.value.toLocaleString()} ETB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}