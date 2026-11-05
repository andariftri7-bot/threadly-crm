/**
 * THREADLY RESPONSIVE BREAKPOINT CONFIGURATION
 * Single source of truth for all layout breakpoints across the application.
 *
 * - Mobile: < 640px (Small screens, phones)
 * - Tablet: 640px - 1023px (Portrait & landscape tablets, small laptops)
 * - Desktop: >= 1024px (Large screens, desktops)
 */

export const BREAKPOINTS = {
  mobile: {
    max: 639,
    label: 'Ponsel (< 640px)',
  },
  tablet: {
    min: 640,
    max: 1023,
    label: 'Tablet (640px - 1023px)',
  },
  desktop: {
    min: 1024,
    label: 'Desktop (>= 1024px)',
  },
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.tablet.min) {
    return 'mobile';
  }
  if (width <= BREAKPOINTS.tablet.max) {
    return 'tablet';
  }
  return 'desktop';
}
