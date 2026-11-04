/**
 * THREADLY DESIGN TOKENS
 * Single Source of Truth for Brand Gradients, Accents, Colors, and Surfaces
 * Conforms to WCAG AA contrast standards and prefers-reduced-motion accessibility.
 */

export const themeTokens = {
  gradients: {
    // Brand Gradient: Hero, Authentication Brand Panel, Navbar/Header
    brand: 'linear-gradient(135deg, #0F172A 0%, #272560 50%, #5B4BDB 100%)',
    // Accent Gradient: Primary buttons, active sidebar item, key chart elements
    accent: 'linear-gradient(135deg, #6D5BE8 0%, #A78BFA 100%)',
    // Accent Hover: Subtle gradient shift with smooth transition
    accentHover: 'linear-gradient(135deg, #5B4BDB 0%, #906DF7 100%)',
    // Secondary Champagne Accent: Subtle gold badge and borders
    champagne: 'linear-gradient(135deg, #C9A96E 0%, #EBD9B4 100%)',
    // Light Mode Soft Gradient Wash (low-intensity radial lavender at top)
    lightWash: 'radial-gradient(circle at 50% 0%, rgba(167, 139, 250, 0.08) 0%, rgba(250, 249, 246, 0) 55%), #FAF9F6',
    // Key Card Highlight for Dark Mode
    darkCardHighlight: 'linear-gradient(135deg, rgba(109, 91, 232, 0.12) 0%, rgba(201, 169, 110, 0.06) 100%)',
  },
  colors: {
    // Brand Navy & Indigo Tones
    navyDark: '#0F172A',
    navyMid: '#272560',
    indigoBrand: '#5B4BDB',
    // Accent Violet Tones
    accentStart: '#6D5BE8',
    accentEnd: '#A78BFA',
    // Champagne Secondary Accent
    champagne: {
      DEFAULT: '#C9A96E',
      light: '#EBD9B4',
      dark: '#9A7840',
      muted: 'rgba(201, 169, 110, 0.15)',
      border: 'rgba(201, 169, 110, 0.35)',
    },
    // Mode Surfaces
    light: {
      bg: '#FAF9F6',
      card: '#FFFFFF',
      border: 'rgba(226, 232, 240, 0.8)',
    },
    dark: {
      bg: '#0B1020',
      surface: '#111833',
      border: 'rgba(255, 255, 255, 0.08)',
    },
  },
} as const;

export default themeTokens;
