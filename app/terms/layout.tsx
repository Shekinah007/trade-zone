import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions — FindMaster",
  description: "Read the rules and guidelines for using the FindMaster platform.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms and Conditions — FindMaster",
    description: "Read the rules and guidelines for using the FindMaster platform.",
    url: "/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
