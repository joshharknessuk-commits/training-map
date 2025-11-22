import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, helperText, label, options, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = `
      w-full px-4 py-2.5 text-base font-medium text-neutral-900
      bg-white border-2 rounded-xl
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
      transition-all duration-150 ease-out
      appearance-none
      bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")]
      bg-[length:1.5em_1.5em]
      bg-[right_0.5rem_center]
      bg-no-repeat
      pr-10
    `;

    const borderStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
      : 'border-neutral-200 focus:border-blue-500 focus:ring-blue-500/30';

    const combinedClassName = [baseStyles, borderStyles, className].filter(Boolean).join(' ');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-semibold text-neutral-950 mb-2">
            {label}
          </label>
        )}
        <select ref={ref} id={selectId} className={combinedClassName} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helperText && (
          <p className={`mt-1.5 text-sm font-medium ${error ? 'text-red-600' : 'text-neutral-600'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
