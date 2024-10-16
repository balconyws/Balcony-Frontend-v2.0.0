'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DatePickerProps {
  className?: string;
  value?: Date;
  // eslint-disable-next-line no-unused-vars
  onChange?: (date: Date | undefined) => void;
  defaultMonth?: Date;
  minDate?: Date;
  error?: boolean;
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ className, value, onChange, defaultMonth, minDate, error }, ref) => {
    const [date, setDate] = React.useState<Date | undefined>(value);

    React.useEffect(() => {
      setDate(value);
    }, [value]);

    const handleDateChange = (selectedDate: Date | undefined) => {
      setDate(selectedDate);
      if (onChange) onChange(selectedDate);
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex justify-start items-center w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground placeholder:text-sm placeholder:leading-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
              !date && 'text-muted-foreground',
              error &&
                '!text-destructive !border-destructive placeholder:!text-destructive !ring-destructive focus-visible:!ring-destructive',
              className
            )}
            ref={ref}>
            <CalendarIcon
              className={cn('text-primary mr-2 h-4 w-4', error && '!text-destructive')}
            />
            {date ? format(date, 'MM/dd') : <span>MM/DD</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
            defaultMonth={defaultMonth}
            fromDate={minDate}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
