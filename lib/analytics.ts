/**
 * Analytics helper for Vercel Analytics
 *
 * Provides a type-safe trackEvent function that works on the client side
 * with safe fallbacks for server-side and non-Vercel environments
 */

// Define valid event names for type safety
export type AnalyticsEventName =
  | 'discovery_started'
  | 'discovery_completed'
  | 'context_generated'
  | 'compare_question_asked'
  | 'signup_completed';

// Event properties type - can be extended per event
export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track an analytics event
 *
 * Uses Vercel Analytics track() on the client side.
 * Safe fallback for server-side and non-Vercel environments.
 *
 * @param eventName - The name of the event to track
 * @param properties - Optional properties to include with the event
 */
export async function trackEvent(
  eventName: AnalyticsEventName,
  properties?: AnalyticsEventProperties
): Promise<void> {
  // Skip on server side
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Dynamic import to avoid issues in non-Vercel environments
    const { track } = await import('@vercel/analytics');
    track(eventName, properties);
  } catch (error) {
    // Silently fail in non-Vercel environments or if analytics is unavailable
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Analytics] Failed to track event:', eventName, error);
    }
  }
}
