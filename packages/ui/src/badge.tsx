import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'blue' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-neutral-100 text-neutral-900 border-neutral-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  outline: 'bg-white text-neutral-900 border-neutral-300',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1 font-semibold rounded-full border';

    const combinedClassName = [baseStyles, variantStyles[variant], sizeStyles[size], className]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={combinedClassName} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
