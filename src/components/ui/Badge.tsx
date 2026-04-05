import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-warm-100 text-warm-700 border-warm-200',
        primary:     'bg-primary-100 text-primary-700 border-primary-200',
        success:     'bg-success-50 text-success-700 border-success-500/30',
        warning:     'bg-warning-50 text-warning-700 border-warning-500/30',
        danger:      'bg-danger-50 text-danger-700 border-danger-500/30',
        info:        'bg-info-50 text-info-700 border-info-500/30',
        outline:     'bg-transparent text-warm-700 border-warm-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
