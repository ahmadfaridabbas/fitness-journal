import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/import/"],
      },
    ],
    sitemap: "https://ahmadfaridfitness.netlify.app/sitemap.xml",
  };
}
