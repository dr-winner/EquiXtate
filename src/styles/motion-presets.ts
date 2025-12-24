/**
 * Shared Motion Presets for Framer Motion
 * 
 * Centralized animation variants for consistent micro-interactions across the app.
 * Use these presets to maintain uniform timing, easing, and behavior.
 */

import { Variants } from 'framer-motion';

/**
 * Fade + slide up effect for content appearing
 */
export const fadeSlideUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] // Custom ease-out curve
    }
  }
};

/**
 * Fade + slide down effect
 */
export const fadeSlideDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Scale in with fade for modals/dialogs
 */
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

/**
 * Subtle hover effect for interactive elements
 */
export const subtleHover = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: 'easeOut'
  }
};

/**
 * Card hover effect with lift
 */
export const cardHover = {
  y: -4,
  transition: {
    duration: 0.2,
    ease: 'easeOut'
  }
};

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

/**
 * Child item for stagger container
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Fade in/out
 */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide from left
 */
export const slideFromLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Slide from right
 */
export const slideFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
