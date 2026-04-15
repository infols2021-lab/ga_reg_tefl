import * as React from 'react';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={[
          'flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm',
          'outline-none transition',
          'focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';