import * as React from 'react';

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={[
          'flex min-h-[140px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm',
          'placeholder:text-slate-400',
          'outline-none transition',
          'focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          className,
        ].join(' ')}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';