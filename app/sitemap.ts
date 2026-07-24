import { MetadataRoute } from "next";

const SITE_URL = "https://ahmadfaridfitness.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/dashboard",
    "/journal",
    "/analytics",
    "/goals",
    "/achievements",
    "/body",
    "/shoes",
    "/maps",
    "/weather",
    "/reports",
    "/ai-coach",
    "/settings",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/dashboard" ? "daily" : "weekly",
    priority: route === "" || route === "/dashboard" ? 1 : 0.8,
  }));
}
