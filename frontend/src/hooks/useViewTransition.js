import { useState, useCallback } from 'react';

/**
 * Run a state update with View Transition API
 * Falls back gracefully if not supported
 */
export function runViewTransition(updateCallback, options = {}) {
  const { fallback = true, classNames = [] } = options;

  if (!document.startViewTransition || !fallback) {
    updateCallback();
    return;
  }

  const transition = document.startViewTransition(() => {
    updateCallback();
  });

  classNames.forEach((className) => {
    if (transition.updateCallbackDone) {
      transition.updateCallbackDone.then(() => {
        document.documentElement.classList.add(className);
        setTimeout(() => document.documentElement.classList.remove(className), 300);
      });
    }
  });

  return transition;
}

/**
 * Hook for view transitions with navigation
 */
export function useViewTransition() {
  const navigate = useCallback((updateCallback, options = {}) => {
    runViewTransition(updateCallback, options);
  }, []);

  return navigate;
}

/**
 * Page transition hook for route changes
 */
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transition = useCallback(async (callback) => {
    setIsTransitioning(true);
    try {
      if (document.startViewTransition) {
        await document.startViewTransition(callback).finished;
      } else {
        callback();
      }
    } finally {
      setIsTransitioning(false);
    }
  }, []);

  return { transition, isTransitioning };
}

/**
 * Shared element transition helper
 */
export function useSharedElementTransition() {
  const elements = new Map();

  const register = useCallback((key, element) => {
    if (element) {
      element.style.viewTransitionName = key;
      elements.set(key, element);
    }
  }, []);

  const unregister = useCallback((key) => {
    const element = elements.get(key);
    if (element) {
      element.style.viewTransitionName = 'none';
      elements.delete(key);
    }
  }, []);

  return { register, unregister };
}