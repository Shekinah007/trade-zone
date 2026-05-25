import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — FindMaster",
  description: "Create an account on FindMaster to buy, sell, and register your property securely.",
  alternates: {
    canonical: "/auth/signup",
  },
  openGraph: {
    title: "Sign Up — FindMaster",
    description: "Create an account on FindMaster to buy, sell, and register your property securely.",
    url: "/auth/signup",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
