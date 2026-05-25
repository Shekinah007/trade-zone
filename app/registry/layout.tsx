import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Registry — FindMaster",
  description: "Search the national property registry for stolen devices or register your own property.",
  alternates: {
    canonical: "/registry",
  },
  openGraph: {
    title: "Property Registry — FindMaster",
    description: "Search the national property registry for stolen devices or register your own property.",
    url: "/registry",
  },
};

export default function RegistryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
