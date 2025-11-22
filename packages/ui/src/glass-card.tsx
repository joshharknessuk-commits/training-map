import * as React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  shadow?: boolean;
  hoverable?: boolean;
}

const blurStyles = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      blur = 'xl',
      border = true,
      shadow = true,
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      rounded-2xl
      bg-white/60
      supports-[backdrop-filter]:bg-white/40
    `;

    const combinedClassName = [
      baseStyles,
      blurStyles[blur],
      border && 'border border-white/20',
      shadow && 'shadow-lg shadow-neutral-900/5',
      hoverable && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-neutral-900/10',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
