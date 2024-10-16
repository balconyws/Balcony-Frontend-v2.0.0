'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:!cursor-not-allowed disabled:!opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/80 flex justify-center items-center text-sm font-semibold !leading-5',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 flex justify-center items-center text-sm font-semibold !leading-5',
        outline:
          'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border border-primary flex justify-center items-center text-sm font-semibold !leading-5',
        underline:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:hover:bg-inherit disabled:hover:text-inherit flex justify-center items-center text-sm !leading-5 font-normal !p-0 !rounded-none border-b border-b-primary',
        none: '',
      },
      size: {
        default: 'rounded-lg px-4 py-2',
        sm: 'rounded-sm px-2 py-1',
        md: 'rounded-md px-3 py-2',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  spinnerSize?: 'small' | 'medium' | 'large';
  strokeColor?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      spinnerSize = 'medium',
      strokeColor,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={isLoading || props.disabled}>
        {isLoading ? (
          <Spinner size={spinnerSize} show={true} strokeColor={strokeColor || 'white'} />
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
