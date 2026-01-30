import React, { createContext, useContext } from 'react';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

const BadgeContext = createContext({ themed: false });

const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadgeContext must be used within an Announcement');
  }
  return context;
};

export function Announcement({
  variant = 'outline',
  themed = false,
  className,
  ...props
}) {
  return (
    <BadgeContext.Provider value={{ themed }}>
      <Badge
        variant={variant}
        className={cn(
          'max-w-full gap-2 rounded-full px-3 py-0.5 font-medium shadow-sm transition-all',
          'bg-white/[0.04] border-white/10 text-white/90',
          'hover:shadow-md hover:bg-white/[0.06]',
          themed && 'border-white/10',
          className
        )}
        {...props}
      />
    </BadgeContext.Provider>
  );
}

export function AnnouncementTag({ className, ...props }) {
  const { themed } = useBadgeContext();
  return (
    <div
      className={cn(
        '-ml-2.5 shrink-0 truncate rounded-full px-2.5 py-1 text-xs',
        'bg-white/5 text-white/80',
        themed && 'bg-white/[0.06]',
        className
      )}
      {...props}
    />
  );
}

export function AnnouncementTitle({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center gap-1 truncate py-1', className)}
      {...props}
    />
  );
}
