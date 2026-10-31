import type { Metadata, Viewport } from "next";
import { siteUrl, siteRobots } from "@/lib/site";
import localFont from "next/font/local";
import Navigation, { TopLink } from "@/components/Navigation";
import { Arrow, Monogram } from "@/components/Icons";
import Motion from "@/components/Motion";
import MotionControl from "@/components/MotionControl";
import "./globals.css";
import "./experience.css";
const serif = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/gelasio/files/gelasio-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/gelasio/files/gelasio-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia"],
  preload: true,
});
const sans = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["Arial"],
});
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Alder House | Interior Design Concept by JBX Web Studio",
    template: "%s | Alder House",
  },
  description:
    "Explore three imagined interiors, the decisions behind their rooms, and a sample project-brief tool. A fictional studio concept by JBX Web Studio.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Alder House",
    images: [
      {
        url: "/images/social-home.jpg",
        width: 1200,
        height: 630,
        alt: "A shaded doorway and courtyard, an Alder House concept by JBX Web Studio",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  robots: siteRobots,
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#f8f6f1",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <div id="top" tabIndex={-1} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation />
        {children}
        <footer className="site-footer">
          <div className="shell">
            <div className="footer-top">
              <p>Make room<br /><em>for living.</em></p>
              <TopLink className="text-link">Back to top <Arrow direction="up" /></TopLink>
            </div>
            <div className="footer-directory">
              <div className="footer-about">
                <Monogram />
                <p>A fictional interiors studio.<br />A real exploration of thoughtful design.</p>
                <a className="underlined" href="/about-this-project">About this concept</a>
              </div>
              <nav aria-label="Explore the rooms"><p className="footer-label">The rooms</p><a href="/projects/palm-court">Palm Court</a><a href="/projects/bay-window">Bay Window</a><a href="/projects/tide-house">Tide House</a></nav>
              <nav aria-label="Footer navigation"><p className="footer-label">The studio</p><a href="/#studio">Point of view</a><a href="/#approach">Our approach</a><a href="/#project-brief">Build a brief</a></nav>
            </div>
            <div className="footer-signature" aria-hidden="true">Alder House</div>
            <div className="footer-colophon">
              <p>Concept studies · AI-generated interior imagery</p>
              <MotionControl />
              <p>Designed & built by <a className="underlined" href="https://www.jbxwebstudio.com">JBX Web Studio</a></p>
            </div>
          </div>
        </footer>
        <Motion />
      </body>
    </html>
  );
}

