import React, { useRef, useState, useCallback } from 'react';
import { cn } from '../lib/cn';

/**
 * Card with a radial spotlight that follows the cursor.
 * Pure CSS radial-gradient — no canvas, no three.js.
 */
export function SpotlightCard({ children, className, ...props }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      className={cn('spotlight-card relative overflow-hidden surface', className)}
      style={{
        '--spot-x': `${pos.x}px`,
        '--spot-y': `${pos.y}px`,
        '--spot-opacity': hovering ? '1' : '0',
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: 'var(--spot-opacity)',
          background: `radial-gradient(420px circle at var(--spot-x) var(--spot-y), color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
