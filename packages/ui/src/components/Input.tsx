import React, { ReactNode } from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  label,
  required = false,
  autoFocus = false,
  className = ''
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        className={`
          input-minimal w-full
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      {error && (
        <p className="text-red-500 text-xs mt-xs">{error}</p>
      )}
    </div>
  );
}

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  rows?: number;
  autoFocus?: boolean;
  className?: string;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  label,
  required = false,
  rows = 3,
  autoFocus = false,
  className = ''
}: TextAreaProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        autoFocus={autoFocus}
        className={`
          w-full resize-none
          bg-transparent
          text-text-primary-light dark:text-text-primary-dark
          placeholder-text-tertiary-light dark:placeholder-text-tertiary-dark
          border border-border-light dark:border-border-dark
          px-sm py-sm
          focus:border-text-primary-light dark:focus:border-text-primary-dark
          focus:outline-none
          transition-colors duration-150
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      {error && (
        <p className="text-red-500 text-xs mt-xs">{error}</p>
      )}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
  label,
  required = false,
  className = ''
}: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={`
          w-full
          bg-transparent
          text-text-primary-light dark:text-text-primary-dark
          border border-border-light dark:border-border-dark
          px-sm py-sm
          focus:border-text-primary-light dark:focus:border-text-primary-dark
          focus:outline-none
          transition-colors duration-150
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-xs">{error}</p>
      )}
    </div>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}: CheckboxProps) {
  return (
    <label className={`flex items-center space-x-sm cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="
          w-4 h-4
          text-text-primary-light dark:text-text-primary-dark
          border-border-light dark:border-border-dark
          focus:ring-0
          focus:ring-offset-0
        "
      />
      {label && (
        <span className="text-text-primary-light dark:text-text-primary-dark text-sm">
          {label}
        </span>
      )}
    </label>
  );
}

interface FormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function Form({ children, onSubmit, className = '' }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-lg ${className}`}>
      {children}
    </form>
  );
}