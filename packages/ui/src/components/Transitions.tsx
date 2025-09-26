'use client';

import React, { useState, useEffect, useRef, cloneElement } from 'react';
import { fadeIn, fadeOut, slideIn, scaleIn, scaleOut } from '../utils/animations';

export interface TransitionProps {
  show: boolean;
  children: React.ReactElement;
  enter?: 'fade' | 'slide' | 'scale';
  enterFrom?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
  className?: string;
  onEntered?: () => void;
  onExited?: () => void;
}

export function Transition({
  show,
  children,
  enter = 'fade',
  enterFrom = 'top',
  duration = 200,
  className = '',
  onEntered,
  onExited
}: TransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (animationRef.current) {
      animationRef.current.cancel();
    }

    if (show) {
      const animation = (() => {
        switch (enter) {
          case 'slide':
            return slideIn(element, enterFrom, { duration });
          case 'scale':
            return scaleIn(element, { duration });
          default:
            return fadeIn(element, { duration });
        }
      })();

      animation.addEventListener('finish', () => {
        onEntered?.();
      });

      animationRef.current = animation;
    } else {
      const animation = (() => {
        switch (enter) {
          case 'scale':
            return scaleOut(element, { duration });
          default:
            return fadeOut(element, { duration });
        }
      })();

      animation.addEventListener('finish', () => {
        setShouldRender(false);
        onExited?.();
      });

      animationRef.current = animation;
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [show, enter, enterFrom, duration, onEntered, onExited]);

  if (!shouldRender) {
    return null;
  }

  const initialStyle = (() => {
    if (show) {
      switch (enter) {
        case 'slide':
          return {
            opacity: 0,
            transform: {
              left: 'translateX(-20px)',
              right: 'translateX(20px)',
              top: 'translateY(-20px)',
              bottom: 'translateY(20px)'
            }[enterFrom]
          };
        case 'scale':
          return { opacity: 0, transform: 'scale(0.8)' };
        default:
          return { opacity: 0 };
      }
    }
    return {};
  })();

  return cloneElement(children, {
    ref: elementRef,
    className: `${children.props.className || ''} ${className}`,
    style: {
      ...children.props.style,
      ...initialStyle
    }
  });
}

export interface CollapseProps {
  show: boolean;
  children: React.ReactNode;
  duration?: number;
  className?: string;
  onEntered?: () => void;
  onExited?: () => void;
}

export function Collapse({
  show,
  children,
  duration = 200,
  className = '',
  onEntered,
  onExited
}: CollapseProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [height, setHeight] = useState<number | 'auto'>(show ? 'auto' : 0);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (animationRef.current) {
      animationRef.current.cancel();
    }

    const contentHeight = content.scrollHeight;

    if (show) {
      setHeight(0);

      requestAnimationFrame(() => {
        const animation = content.animate([
          { height: '0px', opacity: 0 },
          { height: `${contentHeight}px`, opacity: 1 }
        ], {
          duration,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        });

        animation.addEventListener('finish', () => {
          setHeight('auto');
          onEntered?.();
        });

        animationRef.current = animation;
      });
    } else {
      setHeight(contentHeight);

      requestAnimationFrame(() => {
        const animation = content.animate([
          { height: `${contentHeight}px`, opacity: 1 },
          { height: '0px', opacity: 0 }
        ], {
          duration,
          easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
          fill: 'forwards'
        });

        animation.addEventListener('finish', () => {
          setShouldRender(false);
          onExited?.();
        });

        animationRef.current = animation;
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [show, duration, onEntered, onExited]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      className={`overflow-hidden ${className}`}
      style={{ height }}
    >
      {children}
    </div>
  );
}

export interface SlideOverProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SlideOver({
  show,
  onClose,
  children,
  side = 'right',
  size = 'md',
  className = ''
}: SlideOverProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (show) {
      fadeIn(overlay, { duration: 150 });
      slideIn(panel, side === 'left' ? 'right' : 'left', { duration: 200 });
    } else {
      fadeOut(overlay, { duration: 150 });

      const slideDirection = side === 'left' ? 'left' : 'right';
      const slideOutKeyframes = [
        { transform: 'translateX(0)' },
        { transform: `translateX(${slideDirection === 'left' ? '-' : ''}100%)` }
      ];

      const animation = panel.animate(slideOutKeyframes, {
        duration: 200,
        easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
        fill: 'forwards'
      });

      animation.addEventListener('finish', () => {
        setShouldRender(false);
      });
    }
  }, [show, side]);

  if (!shouldRender) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const slideClasses = {
    left: 'left-0',
    right: 'right-0'
  };

  const initialTransform = side === 'left' ? 'translateX(-100%)' : 'translateX(100%)';

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black bg-opacity-50 opacity-0"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`
          absolute top-0 bottom-0 ${slideClasses[side]}
          ${sizeClasses[size]} w-full
          bg-bg-primary-light dark:bg-bg-primary-dark
          shadow-xl ${className}
        `}
        style={{ transform: initialTransform }}
      >
        {children}
      </div>
    </div>
  );
}

export interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  className?: string;
}

export function Modal({
  show,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  className = ''
}: ModalProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (show) {
      fadeIn(overlay, { duration: 150 });
      scaleIn(panel, { duration: 200 });
    } else {
      fadeOut(overlay, { duration: 150 });

      const animation = scaleOut(panel, { duration: 150 });
      animation.addEventListener('finish', () => {
        setShouldRender(false);
      });
    }
  }, [show]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [show, onClose]);

  if (!shouldRender) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black bg-opacity-50 opacity-0"
        onClick={handleOverlayClick}
      />

      <div
        ref={panelRef}
        className={`
          relative ${sizeClasses[size]} w-full
          bg-bg-primary-light dark:bg-bg-primary-dark
          rounded-lg shadow-xl opacity-0 scale-90
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShouldShow(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShouldShow(false);
  };

  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    if (shouldShow) {
      setIsVisible(true);
      fadeIn(tooltip, { duration: 150 });
    } else {
      const animation = fadeOut(tooltip, { duration: 150 });
      animation.addEventListener('finish', () => {
        setIsVisible(false);
      });
    }
  }, [shouldShow]);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-text-primary-light dark:border-t-text-primary-dark',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-text-primary-light dark:border-b-text-primary-dark',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-text-primary-light dark:border-l-text-primary-dark',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-text-primary-light dark:border-r-text-primary-dark'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 ${positionClasses[position]}
            px-xs py-1 text-xs
            bg-text-primary-light dark:bg-text-primary-dark
            text-bg-primary-light dark:text-bg-primary-dark
            rounded shadow-lg whitespace-nowrap
            opacity-0 ${className}
          `}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-4
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
}