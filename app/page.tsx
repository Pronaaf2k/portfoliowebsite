import type { Metadata } from "next";
import { PortfolioHome } from "@/components/portfolio-home";
import { StructuredData } from "@/components/structured-data";
import { homeStructuredData } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Samiyeel Alim Binaaf (Pronaaf2k) | Full-Stack Developer",
  },
  description:
    "Official portfolio of Samiyeel Alim Binaaf, known online as Pronaaf2k: full-stack systems, AI/ML projects, music tools, and esports achievements.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: "Samiyeel Alim Binaaf",
    title: "Samiyeel Alim Binaaf (Pronaaf2k) | Developer Portfolio",
    description:
      "Full-stack systems, AI/ML projects, music-data tools, and the competitive archive behind Pronaaf2k.",
    locale: "en_US",
    firstName: "Samiyeel",
    lastName: "Alim Binaaf",
    username: "Pronaaf2k",
    images: [
      {
        url: "/images/imagedefault.webp",
        width: 1200,
        height: 630,
        alt: "Portfolio of Samiyeel Alim Binaaf, full-stack and AI/ML developer known as Pronaaf2k",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Samiyeel Alim Binaaf (Pronaaf2k) | Full-Stack Developer",
    description:
      "Production web systems, AI/ML projects, music tools, and esports achievements from Dhaka.",
    images: [
      {
        url: "/images/imagedefault.webp",
        alt: "Portfolio of Samiyeel Alim Binaaf, full-stack and AI/ML developer known as Pronaaf2k",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <StructuredData id="identity-structured-data" data={homeStructuredData} />
      <PortfolioHome />
    </>
  );
}