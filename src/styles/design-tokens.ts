// Central design system tokens for consistent usage across components.
// Prefer these over hard-coded values inside new components.

export const DS = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '18px',
    pill: '999px',
  },
  shadow: {
    subtle: '0 1px 2px rgba(0,0,0,0.12)',
    soft: '0 2px 6px rgba(0,0,0,0.16)',
    medium: '0 4px 16px rgba(2,6,23,0.22)',
    elevation: '0 8px 28px rgba(2,6,23,0.28)',
    inset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  transition: {
    fast: '120ms cubic-bezier(0.4,0.0,0.2,1)',
    base: '200ms cubic-bezier(0.4,0.0,0.2,1)',
    slow: '320ms cubic-bezier(0.4,0.0,0.2,1)',
  },
  layout: {
    maxWidth: '1280px',
    contentWidth: '960px',
  },
};

export type DesignTokens = typeof DS;
