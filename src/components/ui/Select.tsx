import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Root exports (re-use Radix directly) ── */
export const SelectRoot    = RadixSelect.Root;
export const SelectGroup   = RadixSelect.Group;
export const SelectValue   = RadixSelect.Value;

/* ── Trigger ── */
interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger> {
  error?: boolean;
}

export function SelectTrigger({ className, error, children, ...props }: SelectTriggerProps) {
  return (
    <RadixSelect.Trigger
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-sm border bg-white px-3 py-2',
        'text-sm text-warm-900 placeholder:text-warm-400',
        'transition-colors duration-150',
        'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[placeholder]:text-warm-400',
        error ? 'border-danger-500' : 'border-warm-300',
        className
      )}
      {...props}
    >
      {children}
      <RadixSelect.Icon asChild>
        <ChevronDown size={14} className="shrink-0 text-warm-400" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

/* ── Content ── */
export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Content>) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position={position}
        sideOffset={4}
        className={cn(
          'relative z-dropdown max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
          'rounded-lg border border-warm-200 bg-surface-card shadow-lg',
          'animate-slide-down',
          className
        )}
        {...props}
      >
        <RadixSelect.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
          <ChevronUp size={14} className="text-warm-400" />
        </RadixSelect.ScrollUpButton>

        <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>

        <RadixSelect.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
          <ChevronDown size={14} className="text-warm-400" />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

/* ── Item ── */
export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Item>) {
  return (
    <RadixSelect.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3',
        'text-sm text-warm-700 outline-none',
        'focus:bg-primary-50 focus:text-primary-700',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <RadixSelect.ItemIndicator>
          <Check size={14} className="text-primary-500" />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

/* ── Label ── */
export function SelectLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Label>) {
  return (
    <RadixSelect.Label
      className={cn('py-1.5 pl-8 pr-3 text-xs font-semibold text-warm-400', className)}
      {...props}
    />
  );
}

/* ── Separator ── */
export function SelectSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Separator>) {
  return (
    <RadixSelect.Separator
      className={cn('my-1 h-px bg-warm-100', className)}
      {...props}
    />
  );
}

/* ── Native select — for simple/inline use cases where Radix is overkill ── */
interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  error?: boolean;
  className?: string;
}

export function Select({
  value, onValueChange, onChange, error, className, children, ...props
}: NativeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => {
        onChange?.(e);
        onValueChange?.(e.target.value);
      }}
      className={cn(
        'flex h-9 w-full items-center rounded-sm border bg-white px-3 py-2',
        'text-sm text-warm-900',
        'transition-colors duration-150',
        'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-danger-500' : 'border-warm-300',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/* ── Composed helper for simple use cases ── */
interface SimpleSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function SimpleSelect({
  value, onValueChange, placeholder = 'Seleccionar...', options, disabled, error, className,
}: SimpleSelectProps) {
  return (
    <SelectRoot value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger error={error} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
