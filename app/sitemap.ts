import type { MetadataRoute } from "next";
import { CONTENT_UPDATED_AT, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(CONTENT_UPDATED_AT);

  return [
    {
      url: SITE_URL,
      lastModified,
      images: [SITE_URL + "/images/samiyeel-profile.webp"],
    },
    {
      url: SITE_URL + "/about-me",
      lastModified,
      images: [SITE_URL + "/images/samiyeel-profile.webp"],
    },
    {
      url: SITE_URL + "/loadout",
      lastModified,
    },
  ];
}