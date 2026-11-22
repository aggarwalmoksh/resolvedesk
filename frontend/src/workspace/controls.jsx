import React, { useId } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

export const ease = [0.22, 1, 0.36, 1];

export function Segments({ label, options, value, onChange }) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div className="rd-segments" role="group" aria-label={label}>
      {options.map(([key, name]) => (
        <motion.button key={key} type="button" aria-pressed={value === key}
          whileTap={reduce ? undefined : { scale: 0.97 }} onClick={() => onChange(key)}>
          {value === key && <motion.span className="rd-segment-marker" layoutId={id}
            transition={{ duration: reduce ? 0 : 0.21, ease: [0.4, 0, 0.2, 1] }} />}
          <span>{name}</span>
        </motion.button>
      ))}
    </div>
  );
}

export function PageHeading({ title, description, action }) {
  return <header className="rd-page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>;
}

export function WorkspaceSkeleton({ page = 'insights' }) {
  const analytics = page === 'insights';
  const shapes = {
    insights: ['chart', 'chart'],
    inbox: ['toolbar', 'row', 'row', 'row', 'row', 'row'],
    team: ['toolbar', 'row', 'row', 'row'],
    bots: ['chart', 'chart'],
    billing: ['toolbar', 'chart', 'chart', 'chart'],
    profile: ['row', 'row', 'row', 'row'],
  };
  return (
    <div className="rd-skeleton" role="status" aria-label={`Loading ${page}`}>
      <i className="rd-sk-title" />
      {analytics && <div className="rd-sk-metrics">{[1, 2, 3, 4].map(n => <i key={n} />)}</div>}
      <div className={`rd-sk-panels rd-sk-${page}`}>
        {(shapes[page] || shapes.team).map((shape, index) => <i key={index} data-shape={shape} />)}
      </div>
    </div>
  );
}

export function MetricNumber({ value, format }) {
  const reduce = useReducedMotion();
  const count = useMotionValue(value);
  const label = useTransform(count, number => format.format(Math.round(number)));
  React.useEffect(() => {
    if (reduce) {
      count.jump(value);
      return;
    }
    const animation = animate(count, value, { duration: 0.38, ease });
    return () => animation.stop();
  }, [count, reduce, value]);
  return <><span className="sr-only">{format.format(value)}</span><motion.span aria-hidden>{label}</motion.span></>;
}

export function WorkspaceDialog({ title, onClose, children, drawer = false }) {
  const ref = React.useRef(null);
  const trigger = React.useRef(null);
  const id = useId();
  const reduce = useReducedMotion();
  const [closing, setClosing] = React.useState(false);
  React.useEffect(() => {
    const dialog = ref.current;
    trigger.current = document.activeElement;
    const origin = trigger.current?.getBoundingClientRect();
    dialog.showModal();
    if (origin && !drawer) {
      const bounds = dialog.getBoundingClientRect();
      dialog.style.transformOrigin = `${origin.x + origin.width / 2 - bounds.x}px ${origin.y + origin.height / 2 - bounds.y}px`;
    }
    return () => {
      dialog.close();
      trigger.current?.focus({ preventScroll: true });
    };
  }, [drawer]);

  function requestClose() {
    if (reduce) onClose();
    else setClosing(true);
  }

  return <dialog ref={ref} className={`rd-dialog ${drawer ? 'rd-drawer' : ''}`} aria-labelledby={id}
    data-closing={closing}
    onAnimationEnd={event => {
      if (closing && event.target === event.currentTarget) {
        setClosing(false);
        onClose();
      }
    }}
    onCancel={event => { event.preventDefault(); requestClose(); }}
    onClick={event => { if (event.target === event.currentTarget) requestClose(); }}>
    <div className="rd-dialog-content">
      <header><h2 id={id}>{title}</h2><button type="button" className="rd-icon-button" aria-label="Close" onClick={requestClose}>×</button></header>
      {children}
    </div>
  </dialog>;
}
