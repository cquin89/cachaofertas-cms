import type { LucideIcon } from 'lucide-react';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  imageSrc?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title, description, icon: Icon, imageSrc, action, className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className
      )}
    >
      {imageSrc ? (
        <img src={imageSrc} alt="" className="h-32 w-32 opacity-80" />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-100">
          {Icon ? (
            <Icon size={32} className="text-warm-400" />
          ) : (
            <PackageOpen size={32} className="text-warm-400" />
          )}
        </span>
      )}

      <div className="max-w-sm">
        <p className="font-display text-base font-semibold text-warm-700">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-warm-400">{description}</p>
        )}
      </div>

      {action && (
        <Button size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
