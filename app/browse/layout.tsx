import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Listings — FindMaster",
  description: "Search and browse thousands of verified listings on FindMaster.",
  alternates: {
    canonical: "/browse",
  },
  openGraph: {
    title: "Browse Listings — FindMaster",
    description: "Search and browse thousands of verified listings on FindMaster.",
    url: "/browse",
  },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
