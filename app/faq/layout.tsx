import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — FindMaster",
  description: "Find answers to common questions about buying, selling, and property registration on FindMaster.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions — FindMaster",
    description: "Find answers to common questions about buying, selling, and property registration on FindMaster.",
    url: "/faq",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
