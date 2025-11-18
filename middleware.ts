import createMiddleware from "next-intl/middleware";

import { defaultLocale, localePrefix, locales } from "./src/i18n";

export default createMiddleware({
  defaultLocale,
  localePrefix,
  locales,
});

export const config = {
  matcher: ["/", "/(zh|ko|ja|en)/:path*"],
};
