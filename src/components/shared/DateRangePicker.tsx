import { useState } from 'react';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types/api';
import { Button } from '@/components/ui/Button';

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

const PRESETS: { label: string; days: number }[] = [
  { label: 'Hoy',        days: 0 },
  { label: 'Ayer',       days: 1 },
  { label: 'Últimos 7d', days: 7 },
  { label: 'Últimos 30d', days: 30 },
  { label: 'Últimos 90d', days: 90 },
];

function preset(days: number): DateRange {
  const to   = endOfDay(new Date());
  const from = startOfDay(days === 0 ? new Date() : new Date(Date.now() - days * 86400000));
  return {
    from: from.toISOString(),
    to:   to.toISOString(),
  };
}

export function DateRangePicker({
  value, onChange, className, placeholder = 'Seleccionar período',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ from?: Date; to?: Date }>(() => ({
    from: value?.from ? new Date(value.from) : undefined,
    to:   value?.to   ? new Date(value.to)   : undefined,
  }));

  const label = value
    ? `${format(new Date(value.from), 'd MMM yyyy', { locale: es })} — ${format(new Date(value.to), 'd MMM yyyy', { locale: es })}`
    : placeholder;

  function apply() {
    if (selected.from && selected.to) {
      onChange({
        from: startOfDay(selected.from).toISOString(),
        to:   endOfDay(selected.to).toISOString(),
      });
      setOpen(false);
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(undefined);
    setSelected({});
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-sm border border-warm-300 bg-white px-3 py-2 text-sm text-warm-700 transition-colors hover:border-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            value ? 'text-warm-900' : 'text-warm-400',
            className
          )}
        >
          <CalendarDays size={14} className="shrink-0 text-warm-400" />
          <span className="whitespace-nowrap">{label}</span>
          {value ? (
            <X size={13} className="ml-auto text-warm-400 hover:text-warm-600" onClick={clear} />
          ) : (
            <ChevronDown size={13} className="ml-auto text-warm-400" />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-popover w-auto rounded-lg border border-warm-200 bg-white p-4 shadow-lg animate-slide-down"
        >
          <div className="flex gap-4">
            {/* Presets */}
            <div className="flex flex-col gap-1 border-r border-warm-100 pr-4">
              <p className="mb-1 text-xs font-semibold text-warm-500">Atajos</p>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    const r = preset(p.days);
                    setSelected({ from: new Date(r.from), to: new Date(r.to) });
                    onChange(r);
                    setOpen(false);
                  }}
                  className="rounded px-2 py-1 text-left text-xs text-warm-600 transition-colors hover:bg-warm-100 hover:text-warm-900"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <div>
              <DayPicker
                mode="range"
                locale={es}
                selected={{ from: selected.from, to: selected.to }}
                onSelect={(r) => setSelected({ from: r?.from, to: r?.to })}
                numberOfMonths={2}
                className="text-sm"
                classNames={{
                  months: 'flex gap-4',
                  month: 'space-y-2',
                  caption: 'flex items-center justify-between px-1',
                  caption_label: 'font-medium text-warm-800 text-sm',
                  nav: 'flex items-center gap-1',
                  nav_button: 'h-6 w-6 flex items-center justify-center rounded text-warm-500 hover:bg-warm-100',
                  table: 'w-full border-collapse',
                  head_row: 'flex',
                  head_cell: 'w-8 text-[10px] font-semibold text-warm-400 text-center',
                  row: 'flex w-full',
                  cell: 'w-8 text-center text-sm p-0',
                  day: 'h-8 w-8 rounded text-sm hover:bg-warm-100 transition-colors',
                  day_selected: 'bg-primary-500 text-white hover:bg-primary-600',
                  day_today: 'font-bold text-primary-600',
                  day_range_middle: 'bg-primary-50 text-primary-800 rounded-none',
                  day_range_start: 'bg-primary-500 text-white rounded-l-full',
                  day_range_end: 'bg-primary-500 text-white rounded-r-full',
                  day_outside: 'text-warm-300',
                  day_disabled: 'text-warm-200 cursor-not-allowed',
                }}
              />

              <div className="mt-3 flex justify-end gap-2 border-t border-warm-100 pt-3">
                <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selected.from || !selected.to}
                  onClick={apply}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
