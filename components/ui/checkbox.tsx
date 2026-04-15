import * as React from 'react';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', type = 'checkbox', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={[
          'h-4 w-4 shrink-0 rounded border border-slate-400 bg-white text-slate-950 shadow-sm',
          'accent-slate-950',
          'focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        ].join(' ')}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';