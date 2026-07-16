import { profile } from "@/lib/data";

export const SITE_URL = "https://samiyeelalim.com";
export const SITE_NAME = "Samiyeel Alim Binaaf";
export const PRIMARY_ALIAS = "Pronaaf2k";
export const CONTENT_UPDATED_AT = "2026-07-17";

export const identityLinks = [profile.github, profile.linkedin, profile.steam];

export const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": SITE_URL + "/#person",
      name: SITE_NAME,
      alternateName: [PRIMARY_ALIAS, "Prxnaaf2k"],
      url: SITE_URL,
      mainEntityOfPage: { "@id": SITE_URL + "/#profile-page" },
      image: {
        "@type": "ImageObject",
        "@id": SITE_URL + "/#portrait",
        url: SITE_URL + "/images/samiyeel-profile.webp",
        contentUrl: SITE_URL + "/images/samiyeel-profile.webp",
        caption: "Samiyeel Alim Binaaf, also known online as Pronaaf2k",
      },
      identifier: [
        {
          "@type": "PropertyValue",
          propertyID: "onlineAlias",
          value: PRIMARY_ALIAS,
        },
        {
          "@type": "PropertyValue",
          propertyID: "gamingAlias",
          value: "Prxnaaf2k",
        },
      ],
      description:
        "Samiyeel Alim Binaaf, known online as Pronaaf2k, is a full-stack and AI/ML developer in Dhaka who builds production web systems, accessible products, music-data tools, and machine-learning projects.",
      jobTitle: "Full-stack and AI/ML Developer",
      email: "mailto:" + profile.email,
      homeLocation: {
        "@type": "Place",
        name: "Dhaka, Bangladesh",
      },
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: "North South University",
        url: "https://www.northsouth.edu/",
      },
      knowsAbout: [
        "Full-stack web development",
        "Artificial intelligence",
        "Machine learning",
        "React",
        "Next.js",
        "Node.js",
        "PostgreSQL",
        "Stripe integrations",
        "Spotify Web API",
        "Accessible software",
        "Competitive esports",
      ],
      award: "Top 20 finalist, SOLVIO AI Hackathon 2025",
      subjectOf: { "@id": SITE_URL + "/loadout/#page" },
      sameAs: identityLinks,
    },
    {
      "@type": "ProfilePage",
      "@id": SITE_URL + "/#profile-page",
      url: SITE_URL,
      name: "Samiyeel Alim Binaaf (Pronaaf2k) - Developer Portfolio",
      headline: "Full-stack and AI/ML developer with a competitive side",
      description:
        "The official portfolio of Samiyeel Alim Binaaf, also known as Pronaaf2k: selected work, live development signals, experience, music projects, and esports achievements.",
      inLanguage: "en",
      dateModified: CONTENT_UPDATED_AT,
      mainEntity: { "@id": SITE_URL + "/#person" },
      primaryImageOfPage: { "@id": SITE_URL + "/#portrait" },
      isPartOf: { "@id": SITE_URL + "/#website" },
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: [PRIMARY_ALIAS, "Samiyeel"],
      description:
        "The official developer portfolio and personal site of Samiyeel Alim Binaaf, known online as Pronaaf2k.",
      inLanguage: "en",
      publisher: { "@id": SITE_URL + "/#person" },
    },
  ],
};

export const loadoutStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": SITE_URL + "/loadout/#page",
      url: SITE_URL + "/loadout",
      name: "Pronaaf2k Esports Achievements and Developer Loadout",
      description:
        "The tools, systems, competitive ranks, teams, tournament finishes, and esports presence of Samiyeel Alim Binaaf (Pronaaf2k).",
      inLanguage: "en",
      dateModified: CONTENT_UPDATED_AT,
      about: { "@id": SITE_URL + "/#person" },
      isPartOf: { "@id": SITE_URL + "/#website" },
      breadcrumb: { "@id": SITE_URL + "/loadout/#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": SITE_URL + "/loadout/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Samiyeel Alim Binaaf",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Loadout and esports",
          item: SITE_URL + "/loadout",
        },
      ],
    },
  ],
};
