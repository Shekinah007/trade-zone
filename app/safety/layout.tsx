import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety Tips — FindMaster",
  description: "Learn how to protect yourself and trade with confidence on FindMaster.",
  alternates: {
    canonical: "/safety",
  },
  openGraph: {
    title: "Safety Tips — FindMaster",
    description: "Learn how to protect yourself and trade with confidence on FindMaster.",
    url: "/safety",
  },
};

export default function SafetyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
