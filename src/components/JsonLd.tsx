import { faqs, plans, seo, site } from "@/lib/site";

export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.legalName,
        inLanguage: "es-ES",
        description: seo.description,
        publisher: { "@id": `${site.url}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${site.url}/#org`,
        name: site.legalName,
        url: site.url,
        email: site.email,
        sameAs: [site.instagram],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${site.url}/#app`,
        name: site.name,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        description: seo.description,
        offers: plans.map((plan) => ({
          "@type": "Offer",
          name: plan.name,
          price: plan.price,
          priceCurrency: "EUR",
          description: plan.description,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
