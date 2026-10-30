import type { Metadata, Viewport } from "next";
import { siteUrl, siteRobots } from "@/lib/site";
import localFont from "next/font/local";
import Navigation, { TopLink } from "@/components/Navigation";
import { Arrow, Monogram } from "@/components/Icons";
import Motion from "@/components/Motion";
import "./globals.css";
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
        alt: "Palm Court, an Alder House concept by JBX Web Studio",
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
              <p>
                Room for the things
                <br />
                that make a life.
              </p>
              <TopLink className="text-link">
                Back to top <Arrow direction="up" />
              </TopLink>
            </div>
            <div className="footer-wordmark">
              Alder House
              <span>
                <Monogram />
              </span>
            </div>
            <div className="footer-bottom">
              <p>
                A fictional interiors studio.
                <br />
                Concept studies, not client projects.
                <br />
                Interior imagery is AI-generated.
              </p>
              <nav aria-label="Footer navigation">
                <a href="/#work">Work</a>
                <a href="/#approach">Approach</a>
                <a href="/#studio">Studio</a>
                <a href="/#project-brief">Build a brief</a>
              </nav>
              <div>
                <a href="/about-this-project" className="underlined">
                  About this concept
                </a>
                <p className="jbx-credit">
                  Concept, design & development
                  <br />
                  by{" "}
                  <a className="underlined" href="https://www.jbxwebstudio.com">
                    JBX Web Studio
                  </a>
                </p>
              </div>
            </div>
          </div>
        </footer>
        <Motion />
      </body>
    </html>
  );
}
