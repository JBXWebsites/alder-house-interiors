import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexableSite } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Crawlers must be able to fetch preview pages to read their noindex metadata.
    // Deployment protection, not this file, controls access to a preview.
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(isIndexableSite ? { sitemap: absoluteUrl("/sitemap.xml") } : {}),
  };
}
