import { MetadataRoute } from "next";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";
import Category from "@/models/Category";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findmaster.org";

  // Connect to DB
  await dbConnect();

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/browse",
    "/registry",
    "/categories",
    "/featured",
    "/faq",
    "/contact",
    "/safety",
    "/privacy",
    "/terms",
    "/cookies",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Dynamic Listings (Active only)
  const listings = await Item.find({ isListed: true, "listing.status": "active" })
    .select("_id updatedAt")
    .lean();

  const listingRoutes = listings.map((item) => ({
    url: `${baseUrl}/listings/${item._id}`,
    lastModified: item.updatedAt || new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // 3. Dynamic Registry Items (Public tracking)
  const registryItems = await Item.find({ "ownershipStatus": { $in: ["missing", "registered", "owned", "found"] } })
    .select("_id updatedAt")
    .lean();

  const registryRoutes = registryItems.map((item) => ({
    url: `${baseUrl}/registry/${item._id}`,
    lastModified: item.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 4. Categories
  const categories = await Category.find({})
    .select("slug updatedAt")
    .lean();

  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: cat.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes, ...registryRoutes];
}
