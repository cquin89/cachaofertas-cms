import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-sm border bg-white px-3 py-2 text-sm text-warm-900',
        'placeholder:text-warm-400 resize-y',
        'transition-colors duration-150',
        'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-50',
        error
          ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
          : 'border-warm-300',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
