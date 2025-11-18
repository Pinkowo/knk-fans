import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { defaultLocale, localePrefix, locales } from "./src/i18n";

function detectLocaleFromRequest(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as typeof locales[number])) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const parsed = acceptLanguage
      .split(",")
      .map((item) => {
        const [localeValue, qValue] = item.trim().split(";q=");
        return {
          locale: localeValue.toLowerCase(),
          quality: qValue ? Number(qValue) : 1,
        };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const candidate of parsed) {
      const base = candidate.locale.split("-")[0];
      const match = locales.find((locale) => locale === candidate.locale || locale === base);
      if (match) {
        return match;
      }
    }
  }

  return defaultLocale;
}

const intlMiddleware = createMiddleware({
  defaultLocale,
  localePrefix,
  locales,
});

function pathnameHasLocale(pathname: string): boolean {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

export default function middleware(request: NextRequest) {
  const detectedLocale = detectLocaleFromRequest(request);
  const { pathname } = request.nextUrl;

  if (!pathnameHasLocale(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${detectedLocale}` : `/${detectedLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const response = intlMiddleware(request);
  response.headers.set("X-Detected-Locale", detectedLocale);
  return response;
}

export const config = {
  matcher: ["/", "/(zh|ko|ja|en)/:path*"],
};
