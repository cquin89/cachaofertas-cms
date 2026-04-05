/**
 * Wrapper de cmdk con los estilos del sistema de diseño Warm Industrial.
 * Re-exporta los primitivos de cmdk añadiendo className defaults.
 */
import { Command as CmdkCommand } from 'cmdk';
import { cn } from '@/lib/utils';

export type { CommandProps } from 'cmdk';

/* Root */
export const Command = ({ className, ...props }: React.ComponentProps<typeof CmdkCommand>) => (
  <CmdkCommand
    className={cn('flex h-full w-full flex-col overflow-hidden rounded-lg bg-white text-warm-800', className)}
    {...props}
  />
);

/* Input */
export const CommandInput = ({ className, ...props }: React.ComponentProps<typeof CmdkCommand.Input>) => (
  <div className="flex items-center gap-2 border-b border-warm-200 px-3">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-warm-400">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
    <CmdkCommand.Input
      className={cn(
        'flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-warm-400 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  </div>
);

/* List */
export const CommandList = ({ className, ...props }: React.ComponentProps<typeof CmdkCommand.List>) => (
  <CmdkCommand.List
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
);

/* Empty */
export const CommandEmpty = ({ className, ...props }: React.ComponentProps<typeof CmdkCommand.Empty>) => (
  <CmdkCommand.Empty
    className={cn('py-6 text-center text-sm text-warm-400', className)}
    {...props}
  />
);

/* Group */
export const CommandGroup = ({ className, ...props }: React.ComponentProps<typeof CmdkCommand.Group>) => (
  <CmdkCommand.Group
    className={cn('[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-warm-400', className)}
    {...props}
  />
);

/* Separator */
export const CommandSeparator = ({ className, ...props }: React.ComponentProps<typeof CmdkCommand.Separator>) => (
  <CmdkCommand.Separator className={cn('mx-1 h-px bg-warm-100', className)} {...props} />
);

/* Item */
export const CommandItem = ({ className, ...props }: React.ComponentProps<typeof CmdkCommand.Item>) => (
  <CmdkCommand.Item
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-700 outline-none',
      'data-[selected=true]:bg-primary-50 data-[selected=true]:text-primary-900',
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className
    )}
    {...props}
  />
);

/* Shortcut hint */
export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('ml-auto text-[10px] font-medium text-warm-400', className)}
      {...props}
    />
  );
}
