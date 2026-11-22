import React from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import { usePredictiveBack } from '../hooks/usePredictiveBack';
import { IconButton } from './primitives';
import { cn } from '../lib/cn';

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  direction = 'bottom',
  wide = false,
}) {
  usePredictiveBack(open, () => onOpenChange(false));

  const isSide = direction === 'right' || direction === 'left';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={direction} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/35" />
        <Drawer.Content
          className={cn(
            'fixed z-50 flex flex-col bg-elev outline-none',
            isSide
              ? 'right-0 top-0 bottom-0 w-full max-w-xl border-l border-line'
              : 'bottom-0 left-0 right-0 max-h-[92vh] rounded-t-[16px] border-t border-line',
            wide && isSide && 'max-w-3xl'
          )}
          style={{
            paddingBottom: isSide ? undefined : 'env(safe-area-inset-bottom)',
            paddingTop: isSide ? 'env(safe-area-inset-top)' : undefined,
          }}
        >
          {!isSide && (
            <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-line" />
          )}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-line min-h-hit">
            <Drawer.Title className="text-[15px] font-medium text-ink text-balance">
              {title}
            </Drawer.Title>
            <IconButton aria-label="Close" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </IconButton>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
