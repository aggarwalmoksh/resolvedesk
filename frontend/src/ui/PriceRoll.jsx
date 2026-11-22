import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/cn';

/**
 * Buttery smooth price transition inspired by Linear & Stripe.
 * Transitions directly between discrete price states using spring physics.
 */
export function PriceRoll({ value, prefix = '₹', suffix = '', className }) {
  return (
    <span className={cn('inline-flex items-baseline font-semibold text-text-primary', className)}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <span className="relative inline-flex items-baseline overflow-hidden h-[1.2em] leading-none">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="inline-block tabular leading-none"
            initial={{ y: '70%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-70%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 32,
              mass: 0.8,
            }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      {suffix && <span className="text-text-tertiary text-xs ml-1 font-normal">{suffix}</span>}
    </span>
  );
}

export default PriceRoll;
