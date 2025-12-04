import { track } from "@vercel/analytics";

import type { AnalyticsEvent, AnalyticsEventName } from "@/types/ui-ux";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const ANALYTICS_EVENTS: Record<AnalyticsEventName, AnalyticsEventName> = {
  page_view: "page_view",
  language_switch: "language_switch",
  guide_card_expand: "guide_card_expand",
  variety_card_click: "variety_card_click",
  form_submit: "form_submit",
  web_vitals: "web_vitals",
};

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", event.eventName, {
      event_category: event.eventType,
      page_location: event.pageLocation,
      locale: event.locale,
      timestamp: event.timestamp ?? Date.now(),
      ...event.properties,
    });
  }

  track(event.eventName, {
    page: event.pageLocation,
    locale: event.locale,
    ...(event.properties ?? {}),
  });

  if (process.env.NODE_ENV !== "production" && typeof window.gtag !== "function") {
    console.warn("[analytics]", event.eventName, event);
  }
}
