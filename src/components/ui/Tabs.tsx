import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const TabsRoot    = RadixTabs.Root;
export const TabsContent = RadixTabs.Content;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn(
        'flex items-center gap-0 border-b border-warm-200',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'relative px-4 py-2.5 text-sm font-medium text-warm-500 transition-colors',
        'hover:text-warm-900',
        'focus-visible:outline-none',
        'data-[state=active]:text-primary-600',
        'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary-500',
        'after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200',
        className
      )}
      {...props}
    />
  );
}
