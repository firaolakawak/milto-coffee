import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Responsive select: renders the standard Radix Select on desktop and a
 * Vaul bottom-sheet drawer on mobile, so native-style tap menus never
 * appear on small viewports. Desktop behavior is unchanged.
 *
 * Props: value, onValueChange, placeholder, options: [{value, label}],
 *        triggerClassName, id
 */
export function MobileSheetSelect({
  value,
  onValueChange,
  placeholder,
  options = [],
  triggerClassName,
  id,
  disabled = false,
  drawerTitle,
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            triggerClassName
          )}
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle>{drawerTitle || placeholder || 'Select an option'}</DrawerTitle>
        </DrawerHeader>
        <div
          role="listbox"
          className="overflow-y-auto px-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          {options.map(o => {
            const sel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={sel}
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-3.5 rounded-lg text-sm text-left transition-colors min-h-[44px]',
                  sel ? 'bg-secondary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'
                )}
              >
                <span className="truncate">{o.label}</span>
                {sel && <Check className="h-4 w-4 text-secondary shrink-0" />}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default MobileSheetSelect;
