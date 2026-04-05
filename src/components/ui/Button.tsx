import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-sm font-medium text-sm',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:     'bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700 hover:shadow-md',
        secondary:   'bg-white border border-warm-300 text-warm-700 hover:bg-warm-50 hover:border-warm-400 shadow-sm',
        destructive: 'bg-danger-500 text-white hover:bg-danger-600 shadow-sm',
        ghost:       'text-warm-700 hover:bg-warm-100 hover:text-warm-900',
        outline:     'border border-warm-300 bg-transparent text-warm-700 hover:bg-warm-50',
        link:        'text-primary-600 underline-offset-4 hover:underline h-auto p-0',
      },
      size: {
        sm:      'h-7 px-3 text-xs',
        md:      'h-9 px-4 text-sm',
        lg:      'h-10 px-6 text-base',
        icon:    'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
