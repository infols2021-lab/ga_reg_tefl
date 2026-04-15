import * as React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={[
          'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900',
          'placeholder:text-gray-400',
          'outline-none transition',
          'focus:border-black focus:ring-2 focus:ring-black/10',
          'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
          className,
        ].join(' ')}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';