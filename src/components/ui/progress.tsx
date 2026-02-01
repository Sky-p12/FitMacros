import * as React from 'react';

import { cn } from '../../lib/utils';

const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  )
);
Progress.displayName = 'Progress';

const ProgressBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('h-full rounded-full bg-brand transition-all', className)}
      style={style}
      {...props}
    />
  )
);
ProgressBar.displayName = 'ProgressBar';

export { Progress, ProgressBar };
