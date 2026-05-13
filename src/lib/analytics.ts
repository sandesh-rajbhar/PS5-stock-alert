import { track } from '@vercel/analytics';

/**
 * Tracks a custom event using Vercel Analytics.
 * @param action - Name of the event (e.g., 'check_stock', 'subscribe')
 * @param params - Optional properties to attach to the event
 */
export function trackEvent(action: string, params?: Record<string, unknown>) {
  try {
    track(action, params || {});
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
}
