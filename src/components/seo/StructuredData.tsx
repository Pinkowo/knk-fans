import type { AppLocale } from "@/i18n";

interface StructuredDataProps {
  locale: AppLocale;
}

export default function StructuredData({ locale }: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.knk-fans.com";
  const websiteId = `${siteUrl}/#website`;
  const organizationId = `${siteUrl}/#organization`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: "KNK Fansite",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo-round.png`,
    },
    sameAs: ["https://www.instagram.com/knkfansite"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: "KNK Fansite",
    description: "KNK 克나큰 粉絲網站 - 推坑指南、成員介紹、唱片資訊",
    url: siteUrl,
    inLanguage:
      locale === "zh" ? "zh-TW" : locale === "en" ? "en-US" : locale === "ja" ? "ja-JP" : "ko-KR",
    publisher: {
      "@id": organizationId,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/${locale}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
