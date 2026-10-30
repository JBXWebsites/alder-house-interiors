import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { absoluteUrl, isIndexableSite } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexableSite) return [];

  return [
    "/",
    ...projects.map(({ slug }) => `/projects/${slug}`),
    "/about-this-project",
  ].map((path) => ({ url: absoluteUrl(path) }));
}
