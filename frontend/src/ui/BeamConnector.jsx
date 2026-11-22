import React from 'react';
import { cn } from '../lib/cn';

/**
 * Animated beam connector — a thin line with a glowing dot that travels along it.
 * Pure CSS animation. Used for "how it works" step connectors.
 */
export function BeamConnector({ className, vertical = false }) {
  return (
    <div
      className={cn(
        'beam-connector relative',
        vertical ? 'w-px h-full min-h-[48px]' : 'h-px w-full min-w-[48px]',
        className
      )}
    >
      <div className={cn('absolute inset-0 bg-line', vertical ? 'w-px' : 'h-px')} />
      <div
        className={cn(
          'beam-dot absolute rounded-full bg-accent',
          vertical
            ? 'left-1/2 -translate-x-1/2 h-2 w-2 beam-travel-v'
            : 'top-1/2 -translate-y-1/2 h-2 w-2 beam-travel-h'
        )}
      />
    </div>
  );
}
