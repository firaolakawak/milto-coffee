import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function LowStockTable() {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const lowStock = products
    .filter(p => p.stock_level != null && p.stock_threshold != null && p.stock_level <= p.stock_threshold)
    .sort((a, b) => a.stock_level - b.stock_level);

  if (lowStock.length === 0) return null;

  const urgency = (p) => {
    if (p.stock_level === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
    if (p.stock_level <= p.stock_threshold / 2) return { label: 'Critical', cls: 'bg-orange-100 text-orange-700' };
    return { label: 'Low', cls: 'bg-yellow-100 text-yellow-700' };
  };

  return (
    <Card className="border-0 shadow-sm mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Restock Today — {lowStock.length} item{lowStock.length > 1 ? 's' : ''} low
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Category</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">In Stock</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Threshold</th>
                <th className="text-center px-4 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(p => {
                const u = urgency(p);
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{p.category?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-right font-bold">{p.stock_level}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{p.stock_threshold}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`${u.cls} border-0 text-xs`}>{u.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}