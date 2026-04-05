import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root> {
  indeterminate?: boolean;
}

export function Checkbox({ className, indeterminate, ...props }: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-warm-300 bg-white',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-500',
        'data-[state=indeterminate]:border-primary-500 data-[state=indeterminate]:bg-primary-500',
        className
      )}
      checked={indeterminate ? 'indeterminate' : props.checked}
      {...props}
    >
      <RadixCheckbox.Indicator>
        {indeterminate
          ? <Minus size={10} className="text-white stroke-[3]" />
          : <Check size={10} className="text-white stroke-[3]" />
        }
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
