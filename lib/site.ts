import type { Metadata } from "next";

type SiteEnvironment = Record<string, string | undefined>;

function isLoopback(hostname: string): boolean {
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  );
}

/** Use configured canonical identity, never an incoming Host header. */
export function getSiteUrl(environment: SiteEnvironment = process.env): URL {
  const deployed =
    environment.VERCEL === "1" ||
    environment.VERCEL_ENV === "production" ||
    environment.VERCEL_ENV === "preview";
  const configured = environment.SITE_URL?.trim();

  if (!configured) {
    if (deployed)
      throw new Error(
        "SITE_URL must be set to the verified HTTPS site origin before deployment.",
      );
    return new URL("http://localhost:3000");
  }

  if (
    !/^https?:\/\//i.test(configured) ||
    /[\u0000-\u0020\u007f]/.test(configured)
  ) {
    throw new Error(
      "SITE_URL must be an absolute HTTP or HTTPS origin without whitespace.",
    );
  }

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("SITE_URL must be an absolute HTTP or HTTPS origin.");
  }

  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "SITE_URL must contain only an origin, without credentials, a path, a query or a fragment.",
    );
  }

  const local = isLoopback(url.hostname);
  if (
    url.protocol !== "https:" &&
    !(url.protocol === "http:" && local && !deployed)
  ) {
    throw new Error(
      "SITE_URL must use HTTPS; HTTP is allowed only for local loopback development.",
    );
  }
  if (local && deployed)
    throw new Error("A deployed SITE_URL cannot point to localhost.");

  return new URL(url.origin);
}

export const siteUrl = getSiteUrl();
export const isPreview = process.env.VERCEL_ENV === "preview";
export const isIndexableSite = !isPreview && !isLoopback(siteUrl.hostname);
export const siteRobots: Metadata["robots"] = {
  index: isIndexableSite,
  follow: isIndexableSite,
};

export function absoluteUrl(path: string): string {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\u0000-\u0020\u007f]/.test(path)
  ) {
    throw new Error(
      "Site paths must be root-relative paths on the configured origin.",
    );
  }
  const url = new URL(path, siteUrl);
  if (url.origin !== siteUrl.origin)
    throw new Error("Site paths cannot change the configured origin.");
  return url.href;
}
