import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const SheetRoot        = RadixDialog.Root;
export const SheetTrigger     = RadixDialog.Trigger;
export const SheetClose       = RadixDialog.Close;

export function SheetOverlay({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>) {
  return (
    <RadixDialog.Overlay
      className={cn(
        'fixed inset-0 z-modal bg-black/50 backdrop-blur-sm',
        'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
        className
      )}
      {...props}
    />
  );
}

const sheetVariants = cva(
  'fixed z-modal flex flex-col bg-surface-modal shadow-xl transition-transform duration-300 focus:outline-none',
  {
    variants: {
      side: {
        right:  'inset-y-0 right-0 h-full w-80 max-w-full border-l border-warm-200 data-[state=open]:animate-slide-left data-[state=closed]:translate-x-full',
        left:   'inset-y-0 left-0 h-full w-80 max-w-full border-r border-warm-200 data-[state=open]:animate-slide-right data-[state=closed]:-translate-x-full',
        top:    'inset-x-0 top-0 border-b border-warm-200 data-[state=open]:animate-slide-down data-[state=closed]:-translate-y-full',
        bottom: 'inset-x-0 bottom-0 border-t border-warm-200 data-[state=open]:animate-slide-up data-[state=closed]:translate-y-full',
      },
    },
    defaultVariants: { side: 'right' },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content>,
    VariantProps<typeof sheetVariants> {
  showClose?: boolean;
}

export function SheetContent({ className, children, side, showClose = true, ...props }: SheetContentProps) {
  return (
    <RadixDialog.Portal>
      <SheetOverlay />
      <RadixDialog.Content className={cn(sheetVariants({ side }), className)} {...props}>
        {showClose && (
          <RadixDialog.Close className="absolute right-4 top-4 rounded-md p-1 text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25">
            <X size={16} />
            <span className="sr-only">Cerrar</span>
          </RadixDialog.Close>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-6 pb-0', className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex justify-end gap-2 p-6 pt-0', className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      className={cn('font-display text-lg font-semibold text-warm-900', className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={cn('text-sm text-warm-500', className)}
      {...props}
    />
  );
}

export function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto p-6', className)} {...props} />;
}
