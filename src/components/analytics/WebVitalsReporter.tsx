"use client";

import { useReportWebVitals } from "next/web-vitals";

import { locales, type AppLocale } from "@/i18n";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

const DEFAULT_ENDPOINT = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT;

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const payload = {
      ...metric,
      path: window.location.pathname,
      timestamp: Date.now(),
    };

    if (DEFAULT_ENDPOINT) {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(DEFAULT_ENDPOINT, body);
      } else {
        fetch(DEFAULT_ENDPOINT, {
          method: "POST",
          body,
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
          },
        }).catch(() => {
          // 以免阻塞使用者操作，忽略傳輸錯誤
        });
      }
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn("[web-vitals]", payload);
    }

    const detectedLocale = document.documentElement.lang;
    const locale = (locales.includes(detectedLocale as AppLocale) ? detectedLocale : "zh") as AppLocale;
    trackEvent({
      eventName: ANALYTICS_EVENTS.web_vitals,
      eventType: "interaction",
      pageLocation: window.location.pathname,
      locale,
      properties: {
        metric: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
      },
    });
  });

  return null;
}
