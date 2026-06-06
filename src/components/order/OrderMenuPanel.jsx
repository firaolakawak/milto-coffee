import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import OrderProductCard from './OrderProductCard';

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
  { value: 'beans', label: 'Beans' },
];

const BASE_NAMES = [
  'Macchiato', 'Latte', 'Cappuccino', 'Espresso',
  'Cold Brew', 'Hot Chocolate', 'Hot Caramel', 'Tea', 'Coffee',
];

function getProductGroup(productName) {
  const name = productName.trim();
  for (const base of BASE_NAMES) {
    if (name.toLowerCase().includes(base.toLowerCase())) {
      const variant = name.replace(new RegExp(base, 'gi'), '').trim();
      return { baseName: base, variantName: variant || 'Classic' };
    }
  }
  if (name.toLowerCase().startsWith('milk with')) {
    return { baseName: 'Milk with...', variantName: name.substring(9).trim() || 'Classic' };
  }
  return { baseName: name, variantName: 'Classic' };
}

function groupProducts(products) {
  const map = {};
  products.forEach(p => {
    const { baseName, variantName } = getProductGroup(p.name);
    if (!map[baseName]) map[baseName] = { baseName, category: p.category, products: [] };
    map[baseName].products.push({ ...p, variantName });
  });
  return Object.values(map);
}

export default function OrderMenuPanel({ onItemAdded }) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 100),
  });

  const filtered = products.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      const { baseName } = getProductGroup(p.name);
      if (!p.name?.toLowerCase().includes(q) && !baseName.toLowerCase().includes(q)) return false;
    }
    return p.is_available !== false;
  });

  const grouped = groupProducts(filtered);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 border-b space-y-3 shrink-0">
        <h2 className="font-display text-xl font-bold text-primary">Menu</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-full h-9"
          />
        </div>
        {/* Category pills - scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === cat.value
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-background border-border text-muted-foreground hover:border-secondary/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">☕</p>
            <p className="text-sm text-muted-foreground">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {grouped.map(group => (
              <OrderProductCard key={group.baseName} group={group} onAdded={onItemAdded} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}