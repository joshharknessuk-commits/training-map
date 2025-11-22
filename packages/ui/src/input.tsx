import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, helperText, label, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = `
      w-full px-4 py-2.5 text-base font-medium text-neutral-900
      bg-white border-2 rounded-xl
      placeholder:text-neutral-500 placeholder:font-normal
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
      transition-all duration-150 ease-out
    `;

    const borderStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
      : 'border-neutral-200 focus:border-blue-500 focus:ring-blue-500/30';

    const combinedClassName = [baseStyles, borderStyles, className].filter(Boolean).join(' ');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-neutral-950 mb-2">
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={combinedClassName} {...props} />
        {helperText && (
          <p className={`mt-1.5 text-sm font-medium ${error ? 'text-red-600' : 'text-neutral-600'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
