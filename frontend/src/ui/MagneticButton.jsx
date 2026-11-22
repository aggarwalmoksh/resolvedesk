import React, { useRef, useState, useCallback } from 'react';
import { cn } from '../lib/cn';

/**
 * A button that subtly pulls toward the cursor on hover — React Bits magnetic effect.
 * No external deps, pure pointer math + CSS transform.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.3,
  as: Comp = 'button',
  ...props
}) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('translate3d(0,0,0)');

  const handleMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      setTransform(`translate3d(${dx}px, ${dy}px, 0)`);
    },
    [strength]
  );

  const handleLeave = useCallback(() => {
    setTransform('translate3d(0,0,0)');
  }, []);

  return (
    <Comp
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn('magnetic-btn', className)}
      style={{ transform, transition: 'transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)' }}
      {...props}
    >
      {children}
    </Comp>
  );
}
