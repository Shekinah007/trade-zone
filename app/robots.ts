import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findmaster.org";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/settings/",
        "/messages/",
        "/saved/",
        "/auth/",
        "/profile/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
