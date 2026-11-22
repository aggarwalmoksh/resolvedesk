import React, { useId, useState } from 'react';
import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import { Check, ChevronDown } from 'lucide-react';

export function Dropdown({ label, children, disabled = false, title, chevron = true }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { refs, floatingStyles, context, placement } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [offset(7), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return <div className="rd-dropdown">
    <button type="button" className="rd-secondary rd-dropdown-trigger" disabled={disabled} ref={refs.setReference}
      {...getReferenceProps({ 'aria-label': title, 'aria-expanded': open, 'aria-controls': open ? id : undefined })}>
      {label}{chevron && <ChevronDown aria-hidden />}
    </button>
    {open && <FloatingFocusManager context={context} modal={false}>
      <div ref={refs.setFloating} style={floatingStyles} className="rd-dropdown-positioner"
        {...getFloatingProps({ id, 'aria-label': title || label, 'data-side': placement.split('-')[0] })}>
        <div className="rd-panel rd-dropdown-panel">{children(() => setOpen(false))}</div>
      </div>
    </FloatingFocusManager>}
  </div>;
}

export function DropdownSelect({ label, options, value, onChange, disabled, name }) {
  const selected = options.find(([key]) => key === value);
  return <>
    {name && <input type="hidden" name={name} value={value} />}
    <Dropdown label={selected?.[1] || label} title={`${label}: ${selected?.[1] || 'Choose'}`} disabled={disabled}>
      {close => options.map(([key, text]) => <button type="button" key={key} className="rd-dropdown-option"
        aria-pressed={key === value} onClick={() => { onChange(key); close(); }}>
        <span>{text}</span>{key === value && <Check aria-hidden />}
      </button>)}
    </Dropdown>
  </>;
}
