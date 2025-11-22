import * as React from 'react';

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'purple' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  shimmer?: boolean;
  loading?: boolean;
}

const variantStyles = {
  blue: `
    bg-gradient-to-r from-blue-600 to-blue-700
    hover:from-blue-700 hover:to-blue-800
    shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40
  `,
  purple: `
    bg-gradient-to-r from-purple-600 to-pink-600
    hover:from-purple-700 hover:to-pink-700
    shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/40
  `,
  gradient: `
    bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
    hover:from-blue-700 hover:via-purple-700 hover:to-pink-700
    shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-purple-600/40
    bg-[length:200%_auto]
    hover:bg-right-bottom
  `,
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3 text-lg rounded-xl',
};

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      variant = 'blue',
      size = 'md',
      shimmer = false,
      loading = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative
      inline-flex
      items-center
      justify-center
      gap-2
      font-semibold
      text-white
      transition-all
      duration-200
      overflow-hidden
      disabled:opacity-50
      disabled:cursor-not-allowed
    `;

    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={combinedClassName} disabled={disabled || loading} {...props}>
        {shimmer && !loading && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}

        {loading && (
          <svg
            className="h-5 w-5 animate-spin"
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

        <span className="relative">{children}</span>
      </button>
    );
  }
);

GradientButton.displayName = 'GradientButton';
