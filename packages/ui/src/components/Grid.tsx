import React, { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
}

export function Grid({
  children,
  columns = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'xl',
  className = ''
}: GridProps) {
  const getGridClasses = () => {
    const gapClass = {
      sm: 'gap-sm',
      md: 'gap-md',
      lg: 'gap-lg',
      xl: 'gap-xl',
      xxl: 'gap-xxl'
    }[gap];

    const columnClasses = [];
    if (columns.xs) columnClasses.push(`grid-cols-${columns.xs}`);
    if (columns.sm) columnClasses.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) columnClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) columnClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) columnClasses.push(`xl:grid-cols-${columns.xl}`);

    return `grid ${columnClasses.join(' ')} ${gapClass}`;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface MasonryGridProps {
  children: ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
}

export function MasonryGrid({
  children,
  columns = 3,
  gap = 'xl',
  className = ''
}: MasonryGridProps) {
  const gapValue = {
    sm: '16px',
    md: '24px',
    lg: '40px',
    xl: '64px',
    xxl: '96px'
  }[gap];

  return (
    <div
      className={className}
      style={{
        columnCount: columns,
        columnGap: gapValue,
        columnFill: 'balance'
      }}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          style={{
            breakInside: 'avoid',
            marginBottom: gapValue,
            display: 'inline-block',
            width: '100%'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}