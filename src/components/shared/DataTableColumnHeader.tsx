import type { Column } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ChevronsUpDown, EyeOff } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column, title, className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn('text-xs font-semibold text-warm-500 uppercase tracking-wide', className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-auto px-0 py-0 font-semibold text-xs text-warm-500 uppercase tracking-wide hover:text-warm-800', className)}
        >
          {title}
          {sorted === 'asc'  ? <ArrowUp size={12} className="ml-1 text-primary-500" /> :
           sorted === 'desc' ? <ArrowDown size={12} className="ml-1 text-primary-500" /> :
           <ChevronsUpDown size={12} className="ml-1 opacity-40" />}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="z-dropdown min-w-[130px] overflow-hidden rounded-lg border border-warm-200 bg-surface-card p-1 shadow-lg animate-slide-down"
        >
          <DropdownMenu.Item
            onSelect={() => column.toggleSorting(false)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 outline-none hover:bg-warm-100"
          >
            <ArrowUp size={13} /> Ascendente
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => column.toggleSorting(true)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 outline-none hover:bg-warm-100"
          >
            <ArrowDown size={13} /> Descendente
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-warm-100" />
          <DropdownMenu.Item
            onSelect={() => column.toggleVisibility(false)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 outline-none hover:bg-warm-100"
          >
            <EyeOff size={13} /> Ocultar
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
