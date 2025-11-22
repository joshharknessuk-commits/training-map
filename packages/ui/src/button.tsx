import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles = {
  primary: `
    bg-blue-600 text-white
    hover:bg-blue-700
    active:bg-blue-800
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
    disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed
    shadow-sm hover:shadow-md
    transition-all duration-200 ease-out
  `,
  secondary: `
    bg-neutral-100 text-neutral-900
    hover:bg-neutral-200
    active:bg-neutral-300
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2
    disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
    shadow-sm hover:shadow
    transition-all duration-200 ease-out
  `,
  ghost: `
    bg-transparent text-neutral-900
    hover:bg-neutral-100
    active:bg-neutral-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2
    disabled:text-neutral-400 disabled:cursor-not-allowed
    transition-all duration-150 ease-out
  `,
  outline: `
    bg-white text-neutral-900 border-2 border-neutral-200
    hover:bg-neutral-50 hover:border-neutral-300
    active:bg-neutral-100
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
    disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200 disabled:cursor-not-allowed
    shadow-sm hover:shadow
    transition-all duration-200 ease-out
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700
    active:bg-red-800
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
    disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed
    shadow-sm hover:shadow-md
    transition-all duration-200 ease-out
  `,
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-lg',
  md: 'px-4 py-2 text-base font-semibold rounded-xl',
  lg: 'px-6 py-3 text-lg font-semibold rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold';
    const widthStyle = fullWidth ? 'w-full' : '';

    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      widthStyle,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
