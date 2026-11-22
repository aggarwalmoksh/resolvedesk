import { useEffect, useRef } from 'react';

export function usePredictiveBack(open, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const pushed = useRef(false);

  useEffect(() => {
    if (!open) return undefined;

    window.history.pushState({ rdSheet: true }, '');
    pushed.current = true;

    const onPop = () => {
      pushed.current = false;
      onCloseRef.current?.();
    };

    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (pushed.current && window.history.state?.rdSheet) {
        pushed.current = false;
        window.history.back();
      }
    };
  }, [open]);
}
