import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export const TooltipProvider = RadixTooltip.Provider;
export const TooltipRoot     = RadixTooltip.Root;
export const TooltipTrigger  = RadixTooltip.Trigger;

export function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTooltip.Content>) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        sideOffset={sideOffset}
        className={cn(
          'z-tooltip max-w-xs rounded-md bg-surface-tooltip px-3 py-1.5',
          'text-xs font-medium text-warm-100 shadow-lg',
          'animate-fade-in',
          className
        )}
        {...props}
      >
        {props.children}
        <RadixTooltip.Arrow className="fill-surface-tooltip" />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
}

/* ── Tooltip compuesto para uso simple ── */
interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export function Tooltip({ content, children, side = 'top', delayDuration = 200 }: SimpleTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
