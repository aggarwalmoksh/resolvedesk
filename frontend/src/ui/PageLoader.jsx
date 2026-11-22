import React from 'react';
import { motion } from 'motion/react';

export function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-0"
      aria-label="Loading page"
      role="status"
    >
      {/* Top progress line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-border-subtle overflow-hidden">
        <div
          className="h-full bg-accent-500 animate-progress origin-left"
          style={{ willChange: 'transform' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2.5 select-none"
      >
        <div className="h-6 w-6 rounded-md bg-brand-500 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
          R
        </div>
        <span className="text-sm font-semibold tracking-tight text-text-primary">
          ResolveDesk
        </span>
      </motion.div>
    </div>
  );
}

export default PageLoader;
