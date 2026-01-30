import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#07070c]',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-green-600 text-white hover:bg-green-500',
        secondary:
          'border-transparent bg-white/10 text-white/90 hover:bg-white/20',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-500',
        outline:
          'border-white/20 text-white/90 bg-transparent hover:bg-white/5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      role={props.onClick ? 'button' : undefined}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
