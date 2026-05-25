import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FindMaster",
  description: "Understand how FindMaster collects, uses, and protects your personal information.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — FindMaster",
    description: "Understand how FindMaster collects, uses, and protects your personal information.",
    url: "/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
