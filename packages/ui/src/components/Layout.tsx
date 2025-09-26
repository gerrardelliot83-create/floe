'use client';

import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  size?: 'full' | 'wide' | 'narrow' | 'article';
  className?: string;
}

export function Container({ children, size = 'wide', className = '' }: ContainerProps) {
  const sizeClasses = {
    full: 'max-w-full',
    wide: 'max-w-7xl',
    narrow: 'max-w-4xl',
    article: 'max-w-2xl'
  };

  return (
    <div className={`mx-auto px-lg ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
}

export function Section({ children, spacing = 'xl', className = '' }: SectionProps) {
  const spacingClasses = {
    sm: 'py-sm',
    md: 'py-md',
    lg: 'py-lg',
    xl: 'py-xl',
    xxl: 'py-xxl'
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </section>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <header className={`mb-xl ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-light text-text-primary-light dark:text-text-primary-dark mb-sm">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="ml-lg">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-xxxl ${className}`}>
      <h2 className="text-lg font-light text-text-primary-light dark:text-text-primary-dark mb-sm">
        {title}
      </h2>
      {description && (
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-lg">
          {description}
        </p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center py-xl ${className}`}>
      <div className="text-center">
        <div className="inline-block animate-spin w-4 h-4 border-2 border-text-tertiary-light dark:border-text-tertiary-dark border-t-transparent rounded-full mb-sm"></div>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title, message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div className={`text-center py-xl ${className}`}>
      <h2 className="text-lg font-light text-text-primary-light dark:text-text-primary-dark mb-sm">
        {title}
      </h2>
      {message && (
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-lg">
          {message}
        </p>
      )}
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      )}
    </div>
  );
}

interface SidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
  className?: string;
}

export function Sidebar({
  children,
  isOpen = true,
  onClose,
  position = 'left',
  className = ''
}: SidebarProps) {
  if (!isOpen) return null;

  const positionClasses = position === 'left'
    ? 'left-0 border-r border-border-light dark:border-border-dark'
    : 'right-0 border-l border-border-light dark:border-border-dark';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 ${positionClasses} h-full w-80
          bg-background-light dark:bg-background-dark
          z-50 md:relative md:z-auto
          transform transition-transform duration-200
          ${className}
        `}
      >
        <div className="h-full overflow-y-auto p-lg">
          {children}
        </div>
      </aside>
    </>
  );
}