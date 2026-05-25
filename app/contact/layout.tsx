import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — FindMaster",
  description: "Have a question, concern, or feedback? Reach out to the FindMaster team and we'll respond as soon as possible.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us — FindMaster",
    description: "Reach out to the FindMaster team.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
