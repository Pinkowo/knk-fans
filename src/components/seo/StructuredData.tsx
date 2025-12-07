import type { AppLocale } from "@/i18n";

interface StructuredDataProps {
  locale: AppLocale;
}

export default function StructuredData({ locale }: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knkfans.site";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KNK Fansite",
    description: "KNK 克나큰 粉絲網站 - 推坑指南、成員介紹、唱片資訊",
    url: siteUrl,
    inLanguage:
      locale === "zh" ? "zh-TW" : locale === "en" ? "en-US" : locale === "ja" ? "ja-JP" : "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/${locale}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
