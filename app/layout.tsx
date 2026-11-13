import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/eb-garamond";
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

const mono = localFont({
  src: [
    { path: "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
    { path: "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2", weight: "600" },
    { path: "../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-plex-mono",
  display: "optional",
  preload: false,
  adjustFontFallback: false,
});

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
    icon: [{ url: "/sab-mark.svg", sizes: "any", type: "image/svg+xml" }],
    shortcut: "/sab-mark.svg",
    apple: [
      { url: "/sab-apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
    <html lang="en" className={mono.variable}>
      <head>
        {identityLinks.map((href) => (
          <link rel="me" href={href} key={href} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
