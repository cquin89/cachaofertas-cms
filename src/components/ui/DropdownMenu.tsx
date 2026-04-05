/**
 * Re-exporta @radix-ui/react-dropdown-menu con clases del sistema de diseño.
 * Usado directamente en Header.tsx y otros componentes.
 */
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DropdownMenuRoot          = RadixDropdown.Root;
export const DropdownMenuTrigger       = RadixDropdown.Trigger;
export const DropdownMenuGroup         = RadixDropdown.Group;
export const DropdownMenuPortal        = RadixDropdown.Portal;
export const DropdownMenuSub           = RadixDropdown.Sub;
export const DropdownMenuRadioGroup    = RadixDropdown.RadioGroup;

export function DropdownMenuContent({
  className, sideOffset = 4, ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdown.Content>) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        sideOffset={sideOffset}
        className={cn(
          'z-dropdown min-w-[160px] overflow-hidden rounded-lg border border-warm-200 bg-surface-card p-1 shadow-lg',
          'animate-slide-down',
          className
        )}
        {...props}
      />
    </RadixDropdown.Portal>
  );
}

export function DropdownMenuItem({
  className, inset, ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdown.Item> & { inset?: boolean }) {
  return (
    <RadixDropdown.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700',
        'outline-none transition-colors',
        'focus:bg-warm-100 focus:text-warm-900',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({
  className, children, checked, ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdown.CheckboxItem>) {
  return (
    <RadixDropdown.CheckboxItem
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-warm-700',
        'outline-none focus:bg-warm-100',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <RadixDropdown.ItemIndicator>
          <Check size={14} className="text-primary-500" />
        </RadixDropdown.ItemIndicator>
      </span>
      {children}
    </RadixDropdown.CheckboxItem>
  );
}

export function DropdownMenuRadioItem({
  className, children, ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdown.RadioItem>) {
  return (
    <RadixDropdown.RadioItem
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-warm-700',
        'outline-none focus:bg-warm-100',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <RadixDropdown.ItemIndicator>
          <Circle size={8} className="fill-primary-500 text-primary-500" />
        </RadixDropdown.ItemIndicator>
      </span>
      {children}
    </RadixDropdown.RadioItem>
  );
}

export function DropdownMenuLabel({
  className, inset, ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdown.Label> & { inset?: boolean }) {
  return (
    <RadixDropdown.Label
      className={cn('px-3 py-1.5 text-xs font-semibold text-warm-400', inset && 'pl-8', className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className, ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdown.Separator>) {
  return (
    <RadixDropdown.Separator className={cn('my-1 h-px bg-warm-100', className)} {...props} />
  );
}

export function DropdownMenuSubTrigger({
  className, inset, children, ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdown.SubTrigger> & { inset?: boolean }) {
  return (
    <RadixDropdown.SubTrigger
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700',
        'outline-none focus:bg-warm-100 data-[state=open]:bg-warm-100',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight size={14} className="ml-auto" />
    </RadixDropdown.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className, ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdown.SubContent>) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.SubContent
        className={cn(
          'z-dropdown min-w-[140px] overflow-hidden rounded-lg border border-warm-200 bg-surface-card p-1 shadow-lg animate-slide-right',
          className
        )}
        {...props}
      />
    </RadixDropdown.Portal>
  );
}
