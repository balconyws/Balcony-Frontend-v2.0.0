'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const spinnerVariants = cva('flex items-center justify-center', {
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
    size: {
      small: 'text-xs w-3 h-3',
      medium: 'text-sm w-4 h-4',
      large: 'text-lg w-6 h-6',
    },
  },
  defaultVariants: {
    show: true,
    size: 'medium',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  iconClassName?: string;
  strokeColor?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size, show, className, iconClassName, strokeColor, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(spinnerVariants({ show, size }), '!text-inherit', className)}
      {...props}>
      <svg viewBox="25 25 50 50" className={cn('spinner', '!text-inherit', iconClassName)}>
        <circle r="20" cy="50" cx="50" stroke={strokeColor || '#005451'}></circle>
      </svg>
    </div>
  )
);

Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };
