import * as React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

function getVariantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case 'secondary':
      return 'bg-gray-100 text-gray-900 hover:bg-gray-200';
    case 'ghost':
      return 'bg-transparent text-gray-900 hover:bg-gray-100';
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700';
    case 'primary':
    default:
      return 'bg-black text-white hover:opacity-90';
  }
}

function getSizeClasses(size: ButtonSize): string {
  switch (size) {
    case 'sm':
      return 'h-9 px-3 text-sm';
    case 'lg':
      return 'h-12 px-5 text-base';
    case 'md':
    default:
      return 'h-10 px-4 text-sm';
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={[
          'inline-flex items-center justify-center rounded-lg font-medium transition',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus:outline-none focus:ring-2 focus:ring-black/20',
          getVariantClasses(variant),
          getSizeClasses(size),
          className,
        ].join(' ')}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';