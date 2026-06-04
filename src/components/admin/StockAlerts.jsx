import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function StockAlerts() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date', 200),
  });

  const lowStockProducts = products.filter(p =>
    p.stock_level != null && p.stock_threshold != null && p.stock_level <= p.stock_threshold
  );

  const restock = useMutation({
    mutationFn: ({ id, stock_level }) => base44.entities.Product.update(id, { stock_level }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Stock updated!'); },
  });

  if (lowStockProducts.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-amber-500 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          Low Stock Alerts ({lowStockProducts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lowStockProducts.map(p => (
            <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.category?.replace('_', ' ')}</p>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0">
                  {p.stock_level} left (threshold: {p.stock_threshold})
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => restock.mutate({ id: p.id, stock_level: 100 })}
              >
                <PackageCheck className="h-3 w-3 mr-1" /> Restock +100
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}