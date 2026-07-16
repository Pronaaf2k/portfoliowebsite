import type { Metadata } from "next";
import { LoadoutView } from "@/components/loadout-view";
import { StructuredData } from "@/components/structured-data";
import { loadoutStructuredData } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Pronaaf2k Esports Achievements | Samiyeel Alim Binaaf",
  },
  description:
    "The developer loadout and esports archive of Samiyeel Alim Binaaf, known as Pronaaf2k: tournament wins, teams, peak ranks, tools, desk, and PC.",
  alternates: { canonical: "/loadout" },
  keywords: [
    "Pronaaf2k",
    "Prxnaaf2k",
    "Samiyeel Alim Binaaf esports",
    "Pronaaf2k Valorant",
    "Pronaaf2k Counter-Strike",
    "Pronaaf2k Rainbow Six Siege",
    "FACEIT Level 10 Bangladesh",
  ],
  openGraph: {
    type: "website",
    url: "/loadout",
    title: "Pronaaf2k Esports Achievements and Developer Loadout",
    description:
      "Tournament results, competitive peaks, teams, tools, and the off-hours archive of Samiyeel Alim Binaaf.",
    siteName: "Samiyeel Alim Binaaf",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Samiyeel Alim Binaaf, known online as Pronaaf2k",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pronaaf2k Esports Achievements | Samiyeel Alim Binaaf",
    description:
      "Competitive peaks, tournament results, teams, and the developer loadout behind Pronaaf2k.",
    images: [
      {
        url: "/opengraph-image",
        alt: "Samiyeel Alim Binaaf, known online as Pronaaf2k",
      },
    ],
  },
};

export default function LoadoutPage() {
  return (
    <>
      <StructuredData id="loadout-structured-data" data={loadoutStructuredData} />
      <LoadoutView />
    </>
  );
}