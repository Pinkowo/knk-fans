import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Noto_Sans_TC, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "@/styles/globals.css";

const notoSans = Noto_Sans_TC({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-pretendard",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KNK Fansite",
  description: "A multilingual KNK fan guide built with Next.js",
  icons: {
    icon: "/logo-round.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${spaceGrotesk.variable} bg-surface text-white antialiased`}
      >
        {children}
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        ) : null}
      </body>
    </html>
  );
}
