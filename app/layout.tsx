export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import NextTopLoader from "nextjs-toploader";

import GlobalLoading from "@/components/GlobalLoading";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FindMaster — Secure Your Property & Trade Safely",
  description:
    "Register, track and verify ownership of devices, vehicles and gadgets. Buy and sell securely on FindMaster — Nigeria's #1 property security marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}
      >
        <NextTopLoader color="#8a2be2" showSpinner={false} />
        <Providers>
          <TooltipProvider>
            <GlobalLoading>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </GlobalLoading>
          </TooltipProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

// export const revalidate = 0;
// export const dynamic = "force-dynamic";

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { Providers } from "@/components/providers";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { Analytics } from "@vercel/analytics/next";
// import NextTopLoader from "nextjs-toploader";
// import LoadingScreen from "@/components/LoadingScreen";
// import PageTransition from "@/components/PageTransition";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "FindMaster — Secure Your Property & Trade Safely",
//   description:
//     "Register, track and verify ownership of devices, vehicles and gadgets. Buy and sell securely on FindMaster — Nigeria's #1 property security marketplace.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body
//         className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}
//       >
//         <LoadingScreen />
//         <NextTopLoader color="#8a2be2" showSpinner={false} />
//         <Providers>
//           <TooltipProvider>
//             <Navbar />
//             <PageTransition>
//               <main className="flex-1">{children}</main>
//             </PageTransition>
//             <Footer />
//           </TooltipProvider>
//         </Providers>
//         <Analytics />
//       </body>
//     </html>
//   );
// }
