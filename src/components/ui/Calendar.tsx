import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-day-picker/style.css';

export type CalendarProps = DayPickerProps;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn('p-3 font-body text-sm', className)}
      classNames={{
        months:           'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month:            'space-y-4',
        caption:          'flex justify-center pt-1 relative items-center',
        caption_label:    'font-display text-sm font-semibold text-warm-800',
        nav:              'space-x-1 flex items-center',
        nav_button:       cn(
          'h-7 w-7 bg-transparent p-0 flex items-center justify-center rounded-md',
          'text-warm-400 hover:bg-warm-100 hover:text-warm-700 transition-colors'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next:  'absolute right-1',
        table:            'w-full border-collapse space-y-1',
        head_row:         'flex',
        head_cell:        'text-warm-400 rounded-md w-9 font-medium text-xs uppercase',
        row:              'flex w-full mt-2',
        cell:             cn(
          'h-9 w-9 text-center text-sm p-0 relative',
          'focus-within:relative focus-within:z-20'
        ),
        day:              cn(
          'h-9 w-9 p-0 font-normal rounded-md',
          'hover:bg-primary-50 hover:text-primary-700',
          'aria-selected:opacity-100 transition-colors'
        ),
        day_selected:     'bg-primary-500 text-white hover:bg-primary-600 hover:text-white focus:bg-primary-500 focus:text-white',
        day_today:        'bg-warm-100 text-warm-900 font-semibold',
        day_outside:      'text-warm-300 opacity-50',
        day_disabled:     'text-warm-300 opacity-50 cursor-not-allowed',
        day_range_middle: 'aria-selected:bg-primary-50 aria-selected:text-primary-700 rounded-none',
        day_range_start:  'bg-primary-500 text-white rounded-md',
        day_range_end:    'bg-primary-500 text-white rounded-md',
        day_hidden:       'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left'
            ? <ChevronLeft size={14} />
            : <ChevronRight size={14} />,
      }}
      {...props}
    />
  );
}
