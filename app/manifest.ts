import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FindMaster — Secure Your Property & Trade Safely",
    short_name: "FindMaster",
    description:
      "Register, track and verify ownership of devices, vehicles and gadgets. Buy and sell securely on FindMaster — Nigeria's #1 property security marketplace.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8a2be2",
    orientation: "portrait-primary",
    categories: ["business", "shopping", "productivity", "security"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse Listings",
        short_name: "Browse",
        description: "Browse the marketplace listings",
        url: "/browse",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Market Price Index",
        short_name: "Market",
        description: "View the market price index",
        url: "/market",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
