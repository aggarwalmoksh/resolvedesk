import React from 'react';
import { cn } from '../lib/cn';

/**
 * Infinite horizontal marquee for trust logos / integration badges.
 * Pure CSS animation — no JS runtime cost.
 */
export function Marquee({
  children,
  className,
  speed = 40,
  pauseOnHover = true,
  reverse = false,
}) {
  return (
    <div
      className={cn(
        'marquee-wrap overflow-hidden',
        pauseOnHover && 'hover:[--marquee-play:paused]',
        className
      )}
      style={{ '--marquee-speed': `${speed}s` }}
    >
      <div
        className={cn(
          'marquee-track flex w-max gap-8',
          reverse ? 'marquee-reverse' : 'marquee-forward'
        )}
      >
        {children}
        {/* duplicate for seamless loop */}
        <div aria-hidden className="flex gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}
