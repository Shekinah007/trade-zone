import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Featured Listings — FindMaster",
  description: "Browse handpicked and highlighted premium listings from verified sellers.",
  alternates: {
    canonical: "/featured",
  },
  openGraph: {
    title: "Featured Listings — FindMaster",
    description: "Browse handpicked and highlighted premium listings from verified sellers.",
    url: "/featured",
  },
};

export default function FeaturedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
