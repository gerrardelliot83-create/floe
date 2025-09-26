import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { fadeIn, slideIn, scaleIn, bounceIn, staggeredAnimation, ANIMATION_DURATIONS } from '../utils/animations';

export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: keyof typeof ANIMATION_DURATIONS | number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 'normal', className = '' }: FadeInProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isVisible) return;

    const animation = fadeIn(element, { delay, duration });

    return () => {
      animation.cancel();
    };
  }, [isVisible, delay, duration]);

  return (
    <div
      ref={elementRef}
      className={`opacity-0 ${className}`}
      style={{ animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
}

export interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  duration?: keyof typeof ANIMATION_DURATIONS | number;
  className?: string;
}

export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  duration = 'normal',
  className = ''
}: SlideInProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isVisible) return;

    const animation = slideIn(element, direction, { delay, duration });

    return () => {
      animation.cancel();
    };
  }, [isVisible, direction, delay, duration]);

  const initialTransform = {
    left: 'translateX(-20px)',
    right: 'translateX(20px)',
    top: 'translateY(-20px)',
    bottom: 'translateY(20px)'
  }[direction];

  return (
    <div
      ref={elementRef}
      className={`opacity-0 ${className}`}
      style={{
        transform: initialTransform,
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );
}

export interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: keyof typeof ANIMATION_DURATIONS | number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, duration = 'normal', className = '' }: ScaleInProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isVisible) return;

    const animation = scaleIn(element, { delay, duration });

    return () => {
      animation.cancel();
    };
  }, [isVisible, delay, duration]);

  return (
    <div
      ref={elementRef}
      className={`opacity-0 ${className}`}
      style={{
        transform: 'scale(0.8)',
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );
}

export interface BounceInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: keyof typeof ANIMATION_DURATIONS | number;
  className?: string;
}

export function BounceIn({ children, delay = 0, duration = 'slow', className = '' }: BounceInProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isVisible) return;

    const animation = bounceIn(element, { delay, duration });

    return () => {
      animation.cancel();
    };
  }, [isVisible, delay, duration]);

  return (
    <div
      ref={elementRef}
      className={`opacity-0 ${className}`}
      style={{
        transform: 'scale(0)',
        animationFillMode: 'forwards'
      }}
    >
      {children}
    </div>
  );
}

export interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 100,
  animationType = 'fade',
  direction = 'left',
  className = ''
}: StaggeredListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(container);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isVisible) return;

    const elements = Array.from(container.children) as HTMLElement[];

    const animationFn = (element: HTMLElement) => {
      switch (animationType) {
        case 'slide':
          return slideIn(element, direction);
        case 'scale':
          return scaleIn(element);
        default:
          return fadeIn(element);
      }
    };

    staggeredAnimation(elements, animationFn, staggerDelay);
  }, [isVisible, staggerDelay, animationType, direction]);

  const initialStyles = {
    fade: { opacity: 0 },
    slide: {
      opacity: 0,
      transform: {
        left: 'translateX(-20px)',
        right: 'translateX(20px)',
        top: 'translateY(-20px)',
        bottom: 'translateY(20px)'
      }[direction]
    },
    scale: { opacity: 0, transform: 'scale(0.8)' }
  }[animationType];

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          style={{
            ...initialStyles,
            animationFillMode: 'forwards'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  formatter = (v) => Math.round(v).toString(),
  className = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {formatter(displayValue)}
    </span>
  );
}

export interface PulseDotProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function PulseDot({ size = 'md', color = 'primary', className = '' }: PulseDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    primary: 'bg-text-primary-light dark:bg-text-primary-dark',
    secondary: 'bg-text-secondary-light dark:bg-text-secondary-dark',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          rounded-full
        `}
      />
      <div
        className={`
          absolute inset-0
          ${sizeClasses[size]}
          ${colorClasses[color]}
          rounded-full opacity-75
          animate-ping
        `}
      />
    </div>
  );
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 border-border-light dark:border-border-dark
        border-t-text-primary-light dark:border-t-text-primary-dark
        rounded-full animate-spin
        ${className}
      `}
    />
  );
}

export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingDots({ size = 'md', className = '' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`
            ${sizeClasses[size]}
            bg-text-secondary-light dark:bg-text-secondary-dark
            rounded-full
          `}
          style={{
            animation: `pulse 0.8s ease-in-out ${index * 0.2}s infinite`
          }}
        />
      ))}
    </div>
  );
}

export interface ProgressBarProps {
  progress: number;
  animated?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function ProgressBar({
  progress,
  animated = true,
  showLabel = false,
  size = 'md',
  color = 'primary',
  className = ''
}: ProgressBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(progress);
      return;
    }

    const duration = 500;
    const startTime = Date.now();
    const startProgress = animatedProgress;
    const targetProgress = Math.max(0, Math.min(100, progress));

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
      const currentProgress = startProgress + (targetProgress - startProgress) * easeOutQuart;

      setAnimatedProgress(currentProgress);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, animated]);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-text-primary-light dark:bg-text-primary-dark',
    secondary: 'bg-text-secondary-light dark:bg-text-secondary-dark',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className={`space-y-xs ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <span>Progress</span>
          <span>{Math.round(animatedProgress)}%</span>
        </div>
      )}
      <div
        ref={containerRef}
        className={`
          w-full ${sizeClasses[size]}
          bg-bg-secondary-light dark:bg-bg-secondary-dark
          rounded-full overflow-hidden
        `}
      >
        <div
          className={`
            h-full ${colorClasses[color]} rounded-full transition-all duration-300
          `}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
}

export interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  size = 'md',
  className = ''
}: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${sizeClasses[size]}
          bg-text-primary-light dark:bg-text-primary-dark
          text-bg-primary-light dark:text-bg-primary-dark
          rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-200
          hover:scale-110 hover:shadow-xl
          active:scale-95
        `}
      >
        <div className={`transition-transform duration-200 ${isHovered ? 'scale-110' : 'scale-100'}`}>
          {icon}
        </div>
      </button>

      {label && isHovered && (
        <div
          className={`
            absolute bg-text-primary-light dark:bg-text-primary-dark
            text-bg-primary-light dark:text-bg-primary-dark
            text-xs px-xs py-1 rounded whitespace-nowrap
            ${position.includes('right') ? 'right-0 mr-16' : 'left-0 ml-16'}
            ${position.includes('bottom') ? 'bottom-4' : 'top-4'}
          `}
        >
          {label}
        </div>
      )}
    </div>
  );
}