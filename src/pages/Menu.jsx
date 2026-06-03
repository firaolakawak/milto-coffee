import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/menu/ProductCard';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'espresso', label: 'Espresso' },
  { value: 'macchiato', label: 'Macchiato' },
  { value: 'cappuccino', label: 'Cappuccino' },
  { value: 'latte', label: 'Latte' },
  { value: 'cold_brew', label: 'Cold Brew' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'pastries', label: 'Pastries' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beans', label: 'Coffee Beans' },
];

export default function Menu() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 100),
  });

  const filtered = products.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return p.is_available !== false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">Our Menu</h1>
        <p className="text-muted-foreground mt-2">Handcrafted with the finest Ethiopian beans</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-8">
          {CATEGORIES.map(cat => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="rounded-full px-4 py-1.5 text-sm data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">☕</p>
          <p className="text-muted-foreground">No items found. Try a different category or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}