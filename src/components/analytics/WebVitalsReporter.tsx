"use client";

import { useReportWebVitals } from "next/web-vitals";

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
  });

  return null;
}
