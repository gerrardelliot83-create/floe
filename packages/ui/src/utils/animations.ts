export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500
} as const;

export const ANIMATION_EASINGS = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const;

export interface AnimationConfig {
  duration?: keyof typeof ANIMATION_DURATIONS | number;
  easing?: keyof typeof ANIMATION_EASINGS | string;
  delay?: number;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export function createKeyframes(keyframes: Keyframe[]): Keyframe[] {
  return keyframes.map((frame, index) => ({
    offset: index / (keyframes.length - 1),
    ...frame
  }));
}

export function animate(
  element: HTMLElement,
  keyframes: Keyframe[],
  config: AnimationConfig = {}
): Animation {
  const {
    duration = 'normal',
    easing = 'easeOut',
    delay = 0,
    fillMode = 'none'
  } = config;

  const animationDuration = typeof duration === 'number'
    ? duration
    : ANIMATION_DURATIONS[duration];

  const animationEasing = easing in ANIMATION_EASINGS
    ? ANIMATION_EASINGS[easing as keyof typeof ANIMATION_EASINGS]
    : easing;

  return element.animate(keyframes, {
    duration: animationDuration,
    easing: animationEasing,
    delay,
    fill: fillMode
  });
}

// Predefined animations
export const SLIDE_IN_FROM_LEFT = createKeyframes([
  { transform: 'translateX(-100%)', opacity: 0 },
  { transform: 'translateX(0)', opacity: 1 }
]);

export const SLIDE_IN_FROM_RIGHT = createKeyframes([
  { transform: 'translateX(100%)', opacity: 0 },
  { transform: 'translateX(0)', opacity: 1 }
]);

export const SLIDE_IN_FROM_TOP = createKeyframes([
  { transform: 'translateY(-100%)', opacity: 0 },
  { transform: 'translateY(0)', opacity: 1 }
]);

export const SLIDE_IN_FROM_BOTTOM = createKeyframes([
  { transform: 'translateY(100%)', opacity: 0 },
  { transform: 'translateY(0)', opacity: 1 }
]);

export const FADE_IN = createKeyframes([
  { opacity: 0 },
  { opacity: 1 }
]);

export const FADE_OUT = createKeyframes([
  { opacity: 1 },
  { opacity: 0 }
]);

export const SCALE_IN = createKeyframes([
  { transform: 'scale(0.8)', opacity: 0 },
  { transform: 'scale(1)', opacity: 1 }
]);

export const SCALE_OUT = createKeyframes([
  { transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(0.8)', opacity: 0 }
]);

export const BOUNCE_IN = createKeyframes([
  { transform: 'scale(0)', opacity: 0 },
  { transform: 'scale(1.1)', opacity: 1 },
  { transform: 'scale(1)', opacity: 1 }
]);

export const SHAKE = createKeyframes([
  { transform: 'translateX(0)' },
  { transform: 'translateX(-10px)' },
  { transform: 'translateX(10px)' },
  { transform: 'translateX(-10px)' },
  { transform: 'translateX(10px)' },
  { transform: 'translateX(0)' }
]);

export const PULSE = createKeyframes([
  { transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(1.05)', opacity: 0.7 },
  { transform: 'scale(1)', opacity: 1 }
]);

export const FLIP_IN_X = createKeyframes([
  { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
  { transform: 'perspective(400px) rotateX(-20deg)' },
  { transform: 'perspective(400px) rotateX(10deg)' },
  { transform: 'perspective(400px) rotateX(-5deg)' },
  { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 }
]);

export const FLIP_IN_Y = createKeyframes([
  { transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
  { transform: 'perspective(400px) rotateY(-20deg)' },
  { transform: 'perspective(400px) rotateY(10deg)' },
  { transform: 'perspective(400px) rotateY(-5deg)' },
  { transform: 'perspective(400px) rotateY(0deg)', opacity: 1 }
]);

// Animation utilities
export function slideIn(
  element: HTMLElement,
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
  config?: AnimationConfig
): Animation {
  const keyframes = {
    left: SLIDE_IN_FROM_LEFT,
    right: SLIDE_IN_FROM_RIGHT,
    top: SLIDE_IN_FROM_TOP,
    bottom: SLIDE_IN_FROM_BOTTOM
  }[direction];

  return animate(element, keyframes, { easing: 'easeOut', ...config });
}

export function fadeIn(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, FADE_IN, { easing: 'easeOut', ...config });
}

export function fadeOut(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, FADE_OUT, { easing: 'easeIn', ...config });
}

export function scaleIn(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, SCALE_IN, { easing: 'bounce', ...config });
}

export function scaleOut(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, SCALE_OUT, { easing: 'easeIn', ...config });
}

export function bounceIn(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, BOUNCE_IN, {
    easing: 'spring',
    duration: 'slow',
    ...config
  });
}

export function shake(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, SHAKE, {
    duration: 'slow',
    ...config
  });
}

export function pulse(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, PULSE, {
    duration: 'slow',
    ...config
  });
}

export function flipInX(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, FLIP_IN_X, {
    easing: 'easeOut',
    duration: 'slow',
    ...config
  });
}

export function flipInY(element: HTMLElement, config?: AnimationConfig): Animation {
  return animate(element, FLIP_IN_Y, {
    easing: 'easeOut',
    duration: 'slow',
    ...config
  });
}

// Staggered animations
export function staggeredAnimation(
  elements: HTMLElement[],
  animationFn: (element: HTMLElement, index: number) => Animation,
  staggerDelay: number = 100
): Promise<void> {
  const animations = elements.map((element, index) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const animation = animationFn(element, index);
        animation.addEventListener('finish', () => resolve());
      }, index * staggerDelay);
    });
  });

  return Promise.all(animations).then(() => {});
}

// Page transitions
export function pageTransition(
  exitElement: HTMLElement,
  enterElement: HTMLElement,
  transition: 'slide' | 'fade' | 'scale' = 'fade'
): Promise<void> {
  return new Promise((resolve) => {
    const exitAnimation = (() => {
      switch (transition) {
        case 'slide':
          return animate(exitElement, SLIDE_IN_FROM_LEFT.reverse(), {
            easing: 'easeIn',
            fillMode: 'forwards'
          });
        case 'scale':
          return scaleOut(exitElement, { fillMode: 'forwards' });
        default:
          return fadeOut(exitElement, { fillMode: 'forwards' });
      }
    })();

    exitAnimation.addEventListener('finish', () => {
      const enterAnimation = (() => {
        switch (transition) {
          case 'slide':
            return slideIn(enterElement, 'right');
          case 'scale':
            return scaleIn(enterElement);
          default:
            return fadeIn(enterElement);
        }
      })();

      enterAnimation.addEventListener('finish', () => resolve());
    });
  });
}

// Loading animations
export function loadingSpinner(element: HTMLElement): Animation {
  return animate(element, [
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(360deg)' }
  ], {
    duration: 1000,
    easing: 'linear'
  });
}

export function loadingDots(elements: HTMLElement[]): Animation[] {
  return elements.map((element, index) => {
    return animate(element, [
      { opacity: 0.3, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0.3, transform: 'scale(0.8)' }
    ], {
      duration: 800,
      delay: index * 200,
      easing: 'easeInOut'
    });
  });
}

// Progress animations
export function animateProgress(
  element: HTMLElement,
  fromPercent: number,
  toPercent: number,
  config?: AnimationConfig
): Animation {
  return animate(element, [
    { width: `${fromPercent}%` },
    { width: `${toPercent}%` }
  ], {
    duration: 'normal',
    easing: 'easeOut',
    fillMode: 'forwards',
    ...config
  });
}

// Notification animations
export function slideInNotification(element: HTMLElement): Animation {
  return animate(element, [
    { transform: 'translateX(100%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ], {
    easing: 'spring',
    fillMode: 'forwards'
  });
}

export function slideOutNotification(element: HTMLElement): Animation {
  return animate(element, [
    { transform: 'translateX(0)', opacity: 1 },
    { transform: 'translateX(100%)', opacity: 0 }
  ], {
    easing: 'easeIn',
    fillMode: 'forwards'
  });
}