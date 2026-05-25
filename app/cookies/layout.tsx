import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — FindMaster",
  description: "Learn how FindMaster uses cookies to improve your experience.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Cookie Policy — FindMaster",
    description: "Learn how FindMaster uses cookies to improve your experience.",
    url: "/cookies",
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
