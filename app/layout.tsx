import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import {
  identityLinks,
  PRIMARY_ALIAS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.BING_SITE_VERIFICATION;
const isPreview = process.env.VERCEL_ENV === "preview";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Samiyeel Alim Binaaf (Pronaaf2k) | Full-Stack Developer",
    template: "%s | Samiyeel Alim Binaaf / Pronaaf2k",
  },
  description:
    "Official portfolio of Samiyeel Alim Binaaf, known online as Pronaaf2k: full-stack systems, AI/ML projects, music tools, and esports achievements.",
  applicationName: "Samiyeel Alim Binaaf / Pronaaf2k",
  manifest: "/site.webmanifest",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  keywords: [
    SITE_NAME,
    PRIMARY_ALIAS,
    "Prxnaaf2k",
    "Samiyeel Alim",
    "Samiyeel Binaaf",
    "Pronaaf2k portfolio",
    "Pronaaf2k esports",
    "full-stack developer",
    "AI/ML developer",
    "Dhaka developer",
    "Bangladesh software engineer",
    "Stripe developer",
    "Spotify developer",
  ],
  robots: {
    index: !isPreview,
    follow: !isPreview,
    nocache: false,
    googleBot: {
      index: !isPreview,
      follow: !isPreview,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#090b0d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {identityLinks.map((href) => (
          <link rel="me" href={href} key={href} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}