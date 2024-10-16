'use client';

import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('animate-pulse bg-muted', className)} {...props} />
);

export { Skeleton };
