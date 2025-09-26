'use client';

import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium
    transition-opacity duration-150
    disabled:opacity-30 disabled:cursor-not-allowed
    ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
  `;

  const variantClasses = {
    primary: `
      bg-text-primary-light dark:bg-text-primary-dark
      text-background-light dark:text-background-dark
      hover:opacity-70 active:opacity-50
    `,
    secondary: `
      border border-text-primary-light dark:border-text-primary-dark
      text-text-primary-light dark:text-text-primary-dark
      bg-transparent
      hover:opacity-70 active:opacity-50
    `,
    ghost: `
      text-text-primary-light dark:text-text-primary-dark
      bg-transparent
      hover:opacity-70 active:opacity-50
    `,
    danger: `
      bg-red-600 text-white
      hover:opacity-70 active:opacity-50
    `
  };

  const sizeClasses = {
    sm: 'px-sm py-xs text-sm',
    md: 'px-md py-sm text-sm',
    lg: 'px-lg py-md text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && (
        <div className="inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-xs"></div>
      )}
      {children}
    </button>
  );
}

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'primary';
  className?: string;
  title?: string;
}

export function IconButton({
  children,
  onClick,
  disabled = false,
  size = 'md',
  variant = 'ghost',
  className = '',
  title
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg'
  };

  const variantClasses = {
    ghost: `
      text-text-tertiary-light dark:text-text-tertiary-dark
      hover:text-text-primary-light dark:hover:text-text-primary-dark
    `,
    primary: `
      bg-text-primary-light dark:bg-text-primary-dark
      text-background-light dark:text-background-dark
      hover:opacity-70
    `
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center
        transition-all duration-150
        disabled:opacity-30 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

interface ButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  className = ''
}: ButtonGroupProps) {
  const orientationClasses = {
    horizontal: 'flex flex-row space-x-sm',
    vertical: 'flex flex-col space-y-sm'
  };

  return (
    <div className={`${orientationClasses[orientation]} ${className}`}>
      {children}
    </div>
  );
}