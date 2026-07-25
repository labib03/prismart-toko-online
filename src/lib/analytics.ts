import LogRocket from 'logrocket';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-E4TRBE0D34';
export const LOGROCKET_APP_ID = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || 'djek8v/prismart';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

let isInitialized = false;

export const initAnalytics = () => {
  if (typeof window === 'undefined') return;

  if (isInitialized) return;
  isInitialized = true;

  if (LOGROCKET_APP_ID) {
    try {
      LogRocket.init(LOGROCKET_APP_ID);
      console.log('[Analytics] LogRocket initialized with App ID:', LOGROCKET_APP_ID);
    } catch (err) {
      console.error('[Analytics] Failed to initialize LogRocket:', err);
    }
  } else {
    console.info('[Analytics] NEXT_PUBLIC_LOGROCKET_APP_ID is not configured. LogRocket tracking is operating in fallback/log mode.');
  }

  if (GA_MEASUREMENT_ID) {
    console.log('[Analytics] Google Analytics 4 initialized with Measurement ID:', GA_MEASUREMENT_ID);
  } else {
    console.info('[Analytics] NEXT_PUBLIC_GA_MEASUREMENT_ID is not configured. GA4 tracking is operating in fallback/log mode.');
  }
};

export const trackPageView = (url: string) => {
  if (typeof window === 'undefined') return;

  if (GA_MEASUREMENT_ID && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }

  if (LOGROCKET_APP_ID) {
    try {
      LogRocket.track(`Viewed Page: ${url}`);
    } catch {
      // ignore
    }
  }

  console.log(`[Analytics Event] page_view -> ${url}`);
};

export const trackEcommerceEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window === 'undefined') return;

  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, params);
  }

  if (LOGROCKET_APP_ID) {
    try {
      LogRocket.track(`E-Commerce Event: ${eventName}`, params);
    } catch {
      // ignore
    }
  }

  console.log(`[Analytics Event] ${eventName}`, params);
};

export const identifyUser = (user: { id: string; email?: string; name?: string; role?: string }) => {
  if (typeof window === 'undefined') return;

  if (LOGROCKET_APP_ID) {
    try {
      const traits: Record<string, string | number | boolean> = {};
      if (user.name) traits.name = user.name;
      if (user.email) traits.email = user.email;
      if (user.role) traits.role = user.role;
      LogRocket.identify(user.id, traits);
    } catch {
      // ignore
    }
  }

  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('set', 'user_properties', {
      user_id: user.id,
      user_role: user.role,
    });
  }

  console.log('[Analytics User Identified]', user);
};
