import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackageSearch, Plus, Minus, Search, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['all', 'espresso', 'macchiato', 'cappuccino', 'latte', 'cold_brew', 'traditional', 'specialty', 'pastries', 'snacks', 'beans'];

const urgency = (p) => {
  if (!p.stock_level && p.stock_level !== 0) return null;
  if (p.stock_level === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
  if (p.stock_threshold && p.stock_level <= p.stock_threshold / 2) return { label: 'Critical', cls: 'bg-orange-100 text-orange-700' };
  if (p.stock_threshold && p.stock_level <= p.stock_threshold) return { label: 'Low', cls: 'bg-yellow-100 text-yellow-700' };
  return { label: 'OK', cls: 'bg-green-100 text-green-700' };
};

export default function StockInventory() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [filter, setFilter] = useState('all'); // all | low
  const qc = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const updateStock = useMutation({
    mutationFn: ({ id, stock_level }) => base44.entities.Product.update(id, { stock_level }),
    onMutate: async ({ id, stock_level }) => {
      await qc.cancelQueries({ queryKey: ['admin-products'] });
      const prev = qc.getQueryData(['admin-products']);
      qc.setQueryData(['admin-products'], (old) =>
        old.map(p => p.id === id ? { ...p, stock_level } : p)
      );
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) qc.setQueryData(['admin-products'], context.prev);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const filtered = products.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (filter === 'low' && !(p.stock_threshold && p.stock_level <= p.stock_threshold)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lowCount = products.filter(p => p.stock_threshold && p.stock_level <= p.stock_threshold).length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
            <PackageSearch className="h-6 w-6" /> Stock Inventory
          </h1>
          <p className="text-sm text-muted-foreground">Monitor and update product stock levels</p>
        </div>
        {lowCount > 0 && (
          <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 text-sm px-3 py-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {lowCount} item{lowCount > 1 ? 's' : ''} need restocking
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-full" />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-transparent p-0 flex gap-1 h-auto">
            <TabsTrigger value="all" className="rounded-full text-xs px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
            <TabsTrigger value="low" className="rounded-full text-xs px-3 data-[state=active]:bg-amber-500 data-[state=active]:text-white">Low Stock</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
              category === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
            }`}
          >
            {c === 'all' ? 'All Categories' : c.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Threshold</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Stock Level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const u = urgency(p);
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{p.category?.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-center">
                        {u ? <Badge className={`${u.cls} border-0 text-xs`}>{u.label}</Badge> : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{p.stock_threshold ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-full"
                            disabled={updateStock.isPending || !p.stock_level}
                            onClick={() => updateStock.mutate({ id: p.id, stock_level: Math.max(0, (p.stock_level || 0) - 1) })}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-bold">{p.stock_level ?? '—'}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-full"
                            disabled={updateStock.isPending}
                            onClick={() => updateStock.mutate({ id: p.id, stock_level: (p.stock_level || 0) + 10 })}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}