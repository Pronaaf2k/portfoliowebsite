import type { Metadata } from "next";

import { AboutPage } from "@/components/about-page";
import { StructuredData } from "@/components/structured-data";

const title = "About Samiyeel Alim Binaaf (Pronaaf2k)";
const description =
  "The story behind Samiyeel Alim Binaaf: a full-stack and AI/ML developer in Dhaka shaped by games, product work, teaching, and a refusal to leave useful things unfinished.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/about-me",
  },
  openGraph: {
    title,
    description,
    url: "/about-me",
    type: "profile",
    images: [
      {
        url: "/images/imagedefault.webp",
        width: 1200,
        height: 630,
        alt: "Samiyeel Alim Binaaf, full-stack and AI/ML developer known online as Pronaaf2k",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/imagedefault.webp"],
  },
};

const aboutStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://samiyeelalim.com/about-me/#page",
      url: "https://samiyeelalim.com/about-me",
      name: title,
      description,
      isPartOf: {
        "@id": "https://samiyeelalim.com/#website",
      },
      about: {
        "@id": "https://samiyeelalim.com/#person",
      },
      mainEntity: {
        "@id": "https://samiyeelalim.com/#person",
      },
    },
    {
      "@type": "Person",
      "@id": "https://samiyeelalim.com/#person",
      name: "Samiyeel Alim Binaaf",
      alternateName: ["Samiyeel", "Pronaaf2k", "Prxnaaf2k"],
      url: "https://samiyeelalim.com/",
      image: "https://samiyeelalim.com/images/samiyeel-profile.webp",
      jobTitle: "Full-stack and AI/ML Developer",
      homeLocation: {
        "@type": "Place",
        name: "Dhaka, Bangladesh",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "North South University",
      },
      sameAs: [
        "https://github.com/Pronaaf2k",
        "https://www.linkedin.com/in/samiyeelalimbinaaf/",
        "https://steamcommunity.com/id/Samiyeel/",
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://samiyeelalim.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About",
          item: "https://samiyeelalim.com/about-me",
        },
      ],
    },
  ],
};

export default function AboutMePage() {
  return (
    <>
      <StructuredData id="about-page-structured-data" data={aboutStructuredData} />
      <AboutPage />
    </>
  );
}
