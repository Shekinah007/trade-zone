// "use client";

// import { Suspense, useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useSession } from "next-auth/react";
// import {
//   Clock,
//   Loader2,
//   PlusCircle,
//   ArrowLeft,
//   PackageX,
//   Zap,
// } from "lucide-react";
// import { toast } from "sonner";
// import Link from "next/link";
// import { ListingForm } from "@/components/ListingForm";
// import { Button } from "@/components/ui/button";
// import { ReapplyButton } from "@/components/Reapply";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface UserDetails {
//   listingQuota: number;
//   status: "pending" | "active" | "rejected" | string;
//   unlimitedRegistrations?: boolean;
// }

// interface PageData {
//   userDetails: UserDetails | null;
//   userListings: any[];
//   registryItem: any | null;
//   categories: any[];
// }

// // ─── Safe fetch helper ────────────────────────────────────────────────────────
// // Returns null instead of throwing so callers can handle missing data gracefully.

// async function safeFetch<T>(url: string): Promise<T | null> {
//   try {
//     const res = await fetch(url);
//     if (!res.ok) return null;

//     const contentType = res.headers.get("content-type") ?? "";
//     if (!contentType.includes("application/json")) return null;

//     const text = await res.text();
//     if (!text) return null;

//     return JSON.parse(text) as T;
//   } catch {
//     return null;
//   }
// }

// function CreateListingContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { data: session, status: authStatus } = useSession();

//   const registryIdParam = searchParams?.get("registryId") ?? null;

//   const [pageData, setPageData] = useState<PageData>({
//     userDetails: null,
//     userListings: [],
//     registryItem: null,
//     categories: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Wait until session is resolved before fetching user-specific data
//   const userId = session?.user?.id;
//   const sessionReady = authStatus !== "loading";

//   useEffect(() => {
//     // Don't fetch until next-auth has resolved
//     if (!sessionReady) return;

//     // Redirect unauthenticated users before any fetches
//     if (authStatus === "unauthenticated") {
//       router.push("/auth/signin?callbackUrl=/listings/create");
//       return;
//     }

//     if (!userId) return;

//     let cancelled = false;

//     async function loadAll() {
//       setLoading(true);
//       setError(null);

//       try {
//         // Always-needed fetches — run in parallel
//         const [categories, userDetails, userListings] = await Promise.all([
//           safeFetch<any[]>("/api/categories"),
//           safeFetch<UserDetails>(`/api/user/${userId}`),
//           safeFetch<any[]>(`/api/user/${userId}/listings`),
//         ]);

//         if (cancelled) return;

//         if (!categories) {
//           toast.error("Failed to load categories");
//         }

//         // Optional: only fetch registry item if the param exists
//         let registryItem: any | null = null;
//         if (registryIdParam) {
//           const data = await safeFetch<{ property: any }>(
//             `/api/registry/${registryIdParam}`,
//           );
//           if (!cancelled && data?.property?._id) {
//             registryItem = data.property;
//           }
//         }

//         if (cancelled) return;

//         setPageData({
//           categories: categories ?? [],
//           userDetails: userDetails ?? null,
//           userListings: Array.isArray(userListings) ? userListings : [],
//           registryItem,
//         });
//       } catch (err: any) {
//         if (!cancelled) {
//           setError("Something went wrong loading this page. Please refresh.");
//           console.error("CreateListingPage load error:", err);
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     loadAll();

//     return () => {
//       cancelled = true;
//     };
//   }, [sessionReady, authStatus, userId, registryIdParam, router]);

//   // ── Loading ──────────────────────────────────────────────────────────────
//   if (!sessionReady || loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
//       </div>
//     );
//   }

//   // ── Hard error ───────────────────────────────────────────────────────────
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
//         <p className="text-sm text-muted-foreground">{error}</p>
//         <Button variant="outline" onClick={() => window.location.reload()}>
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   const { userDetails, userListings, registryItem, categories } = pageData;

//   // ── Quota exceeded ───────────────────────────────────────────────────────
//   // Only show when we have confirmed both values — prevents a flash of this
//   // state while data is still loading.
//   if (
//     userListings.length > 0 &&
//     userDetails?.listingQuota != null &&
//     userListings.length >= userDetails.listingQuota
//   ) {
//     return (
//       <div className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden">
//         <div className="absolute inset-0 bg-white dark:bg-background" />
//         <div
//           className="absolute inset-0 pointer-events-none"
//           style={{
//             backgroundImage:
//               "radial-gradient(circle, rgba(217,119,6,0.12) 1.5px, transparent 1.5px)",
//             backgroundSize: "32px 32px",
//           }}
//         />
//         <div className="absolute -top-16 -left-20 w-[340px] h-[280px] rounded-full bg-amber-100/60 blur-[60px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" />
//         <div className="absolute -bottom-10 -right-16 w-[300px] h-[260px] rounded-full bg-emerald-100/55 blur-[60px] pointer-events-none animate-[pulse_12s_ease-in-out_infinite_1s]" />
//         <div className="absolute top-1/2 left-[55%] w-[200px] h-[180px] rounded-full bg-yellow-200/35 blur-[50px] pointer-events-none animate-[pulse_14s_ease-in-out_infinite_2s]" />
//         <div
//           className="absolute inset-0 pointer-events-none"
//           style={{
//             background:
//               "radial-gradient(ellipse at center, transparent 40%, var(--background) 100%)",
//           }}
//         />

//         <div className="relative z-10 max-w-sm w-full text-center">
//           <div className="w-[68px] h-[68px] rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-6">
//             <PackageX className="w-8 h-8 text-amber-500" />
//           </div>
//           <h2 className="text-lg font-semibold mb-2">Listing quota reached</h2>
//           <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
//             You've used all your available listing slots. Get a listing pack to
//             keep selling.
//           </p>
//           <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-5 text-left">
//             <div className="flex justify-between text-xs font-medium mb-2">
//               <span className="text-muted-foreground">Slots used</span>
//               <span>
//                 {userListings.length} / {userDetails.listingQuota}
//               </span>
//             </div>
//             <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
//               <div className="h-full bg-amber-400 rounded-full w-full" />
//             </div>
//             <p className="text-xs text-amber-500 mt-2">All slots are in use</p>
//           </div>
//           <Button
//             asChild
//             className="w-full gap-2 bg-green-500 hover:bg-green-600"
//           >
//             <Link href="/dashboard/tokens">
//               <Zap className="w-4 h-4" />
//               Get more listing slots
//             </Link>
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // ── Account pending ──────────────────────────────────────────────────────
//   if (userDetails?.status === "pending") {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center px-4">
//         <div className="text-center max-w-md">
//           <div className="relative mx-auto w-fit mb-6">
//             <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl" />
//             <div className="relative p-5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
//               <Clock className="h-10 w-10 text-yellow-500" />
//             </div>
//           </div>
//           <h1 className="text-2xl font-bold mb-3">Account Pending Approval</h1>
//           <p className="text-muted-foreground leading-relaxed mb-6">
//             Your account is currently under review by our team. You will be
//             notified once approved and can start posting listings.
//           </p>
//           <Link
//             href="/browse"
//             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border hover:bg-muted transition-colors text-sm font-medium"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Browse Listings
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // ── Account rejected ─────────────────────────────────────────────────────
//   if (userDetails?.status === "rejected") {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-red-50/50 to-background dark:from-red-950/10 dark:to-background flex items-center justify-center px-4">
//         <div className="text-center max-w-lg w-full">
//           <div className="relative mx-auto w-fit mb-8">
//             <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
//             <div className="relative p-6 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-2 border-red-200 dark:border-red-800">
//               <svg
//                 className="h-14 w-14 text-red-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={1.5}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
//                 />
//               </svg>
//             </div>
//           </div>

//           <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
//             Account Activation Rejected
//           </h1>

//           <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
//             <p className="text-red-800 dark:text-red-200 leading-relaxed">
//               Your account activation request has been reviewed and rejected by
//               our verification team. Please review the possible reasons below
//               before reapplying.
//             </p>
//           </div>

//           <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm text-left">
//             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
//               <svg
//                 className="h-5 w-5 text-amber-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0Zm-9 3.75h.008v.008H12v-.008Z"
//                 />
//               </svg>
//               Common Issues to Rectify Before Reapplying
//             </h3>
//             <div className="space-y-3">
//               {[
//                 "Incomplete or inaccurate profile information",
//                 "Invalid or unclear identification documents",
//                 "Business documentation doesn't meet requirements",
//                 "Mismatch between provided information and documents",
//                 "Potential duplicate or multiple accounts detected",
//               ].map((text, index) => (
//                 <div
//                   key={index}
//                   className="flex items-start gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
//                 >
//                   <svg
//                     className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                   <span className="text-sm text-gray-600 dark:text-gray-400">
//                     {text}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8">
//             <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
//               <svg
//                 className="h-4 w-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
//                 />
//               </svg>
//               Recommended Steps
//             </h4>
//             <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5 list-decimal list-inside">
//               <li>
//                 Review your profile and ensure all information is accurate
//               </li>
//               <li>Upload clear, valid identification documents</li>
//               <li>Make sure your business details match your documents</li>
//               <li>Contact our support team if you need clarification</li>
//               <li>Only reapply after addressing the issues above</li>
//             </ol>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3 justify-center">
//             <ReapplyButton />
//             <Button
//               variant="outline"
//               size="lg"
//               className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
//               onClick={() => router.push("/contact")}
//             >
//               <svg
//                 className="h-4 w-4 mr-2"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
//                 />
//               </svg>
//               Contact Support
//             </Button>
//           </div>

//           <div className="mt-6">
//             <Link
//               href="/browse"
//               className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
//             >
//               <svg
//                 className="h-4 w-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10 19l-7-7m0 0l7-7m-7 7h18"
//                 />
//               </svg>
//               Continue browsing listings
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── Main form ────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-muted/20">
//       <div className="border-b bg-background">
//         <div className="container mx-auto px-4 py-6 max-w-3xl">
//           <Link
//             href="/browse"
//             className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
//           >
//             <ArrowLeft className="h-4 w-4 mr-1" />
//             Back to Browse
//           </Link>
//           <div className="flex items-center gap-3">
//             <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
//               <PlusCircle className="h-6 w-6" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold tracking-tight">
//                 Post a New Ad
//               </h1>
//               <p className="text-muted-foreground text-sm">
//                 Fill in the details below to list your item for sale
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-1 md:px-4 py-4 max-w-3xl">
//         <div className="grid grid-cols-3 gap-3 mb-4">
//           {[
//             { label: "Item Details", desc: "Title, category, condition" },
//             { label: "Photos & Price", desc: "Images and pricing" },
//             { label: "Location", desc: "Where you're selling from" },
//           ].map((step, i) => (
//             <div
//               key={i}
//               className="rounded-xl border bg-background p-3 text-center"
//             >
//               <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mx-auto mb-1">
//                 {i + 1}
//               </div>
//               <p className="text-xs font-semibold">{step.label}</p>
//               <p className="text-xs text-muted-foreground">{step.desc}</p>
//             </div>
//           ))}
//         </div>

//         <div className="rounded-2xl border bg-background shadow-sm p-6 md:p-8">
//           <ListingForm categories={categories} initialData={registryItem} />
//         </div>

//         <p className="text-xs text-center text-muted-foreground mt-6">
//           By posting, you agree to our{" "}
//           <Link
//             href="/terms"
//             className="hover:text-primary underline underline-offset-2"
//           >
//             Terms of Service
//           </Link>{" "}
//           and{" "}
//           <Link
//             href="/privacy"
//             className="hover:text-primary underline underline-offset-2"
//           >
//             Privacy Policy
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// // ─── Page export ──────────────────────────────────────────────────────────────

// export default function CreateListingPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex items-center justify-center min-h-[60vh]">
//           <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
//         </div>
//       }
//     >
//       <CreateListingContent />
//     </Suspense>
//   );
// }


"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Clock,
  Loader2,
  PlusCircle,
  ArrowLeft,
  PackageX,
  Zap,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ListingForm } from "@/components/ListingForm";
import { Button } from "@/components/ui/button";
import { ReapplyButton } from "@/components/Reapply";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserDetails {
  listingQuota: number;
  status: "pending" | "active" | "rejected" | string;
  unlimitedRegistrations?: boolean;
}

interface PageData {
  userDetails: UserDetails | null;
  userListings: any[];
  registryItem: any | null;
  categories: any[];
}

// ─── Safe fetch helper ────────────────────────────────────────────────────────

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ─── Shared full-page shell ───────────────────────────────────────────────────

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-16">
      {children}
    </div>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <CenteredShell>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    </CenteredShell>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <CenteredShell>
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{message}</p>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </div>
    </CenteredShell>
  );
}

// ─── Quota exceeded ───────────────────────────────────────────────────────────

function QuotaExceededState({
  used,
  quota,
}: {
  used: number;
  quota: number;
}) {
  return (
    <CenteredShell>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-amber-100/50 dark:bg-amber-900/20 blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-green-100/50 dark:bg-green-900/20 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <PackageX className="w-7 h-7 text-amber-500" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-50 tracking-tight mb-2">
            Listing quota reached
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            You've used all your available listing slots. Upgrade to keep
            selling.
          </p>
        </div>

        {/* Quota card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Slots used
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {used} / {quota}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" />
          </div>
          <p className="text-[11px] text-amber-500 mt-2 font-medium">
            All slots are in use
          </p>
        </div>

        <Button
          asChild
          className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-500/20 gap-2"
        >
          <Link href="/dashboard/tokens">
            <Zap className="w-4 h-4" />
            Get more listing slots
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Link>
        </Button>

        <div className="mt-4 text-center">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-500 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Browse
          </Link>
        </div>
      </div>
    </CenteredShell>
  );
}

// ─── Pending state ────────────────────────────────────────────────────────────

function PendingState() {
  return (
    <CenteredShell>
      <div className="w-full max-w-sm text-center">
        {/* Icon with glow */}
        <div className="relative w-fit mx-auto mb-6">
          <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl" />
          <div className="relative w-16 h-16 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 flex items-center justify-center shadow-sm">
            <Clock className="h-7 w-7 text-yellow-500" />
          </div>
        </div>

        <h1 className="text-xl font-black text-gray-900 dark:text-gray-50 tracking-tight mb-2">
          Account Pending Approval
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          Your account is under review. You'll be notified once approved and
          can start posting listings right away.
        </p>

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-8">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
            Under review
          </span>
        </div>

        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-semibold text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse Listings
        </Link>
      </div>
    </CenteredShell>
  );
}

// ─── Rejected state ───────────────────────────────────────────────────────────

const REJECTION_REASONS = [
  "Incomplete or inaccurate profile information",
  "Invalid or unclear identification documents",
  "Business documentation doesn't meet requirements",
  "Mismatch between provided information and documents",
  "Potential duplicate or multiple accounts detected",
];

const RECOMMENDED_STEPS = [
  "Review your profile and ensure all information is accurate",
  "Upload clear, valid identification documents",
  "Make sure your business details match your documents",
  "Contact our support team if you need clarification",
  "Only reapply after addressing the issues above",
];

function RejectedState({ onContact }: { onContact: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-12 overflow-auto">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-red-100/40 dark:bg-red-900/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-fit mx-auto mb-5">
            <div className="absolute inset-0 bg-red-400/25 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-50 mb-2">
            Account Activation Rejected
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
            Your activation request was reviewed and rejected. Please address
            the issues below before reapplying.
          </p>
        </div>

        {/* Common issues */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50">
              Common Issues to Address
            </h3>
          </div>
          <div className="space-y-2">
            {REJECTION_REASONS.map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60"
              >
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-red-500">✕</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended steps */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
              Recommended Steps
            </h4>
          </div>
          <ol className="space-y-2">
            {RECOMMENDED_STEPS.map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {text}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <ReapplyButton />
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-gray-200 dark:border-gray-700 gap-2 h-11"
            onClick={onContact}
          >
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main form page ───────────────────────────────────────────────────────────

function MainFormPage({
  categories,
  registryItem,
}: {
  categories: any[];
  registryItem: any | null;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Top nav bar */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/browse"
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-green-500" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-50 truncate">
              Post a New Listing
            </span>
          </div>
          {/* Quota hint — optional, shown if you want */}
          <span className="text-[11px] text-gray-400 font-medium shrink-0 hidden sm:block">
            Fill all 4 sections
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ListingForm categories={categories} initialData={registryItem} />
      </div>
    </div>
  );
}

// ─── Inner content ────────────────────────────────────────────────────────────

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: authStatus } = useSession();

  const registryIdParam = searchParams?.get("registryId") ?? null;

  const [pageData, setPageData] = useState<PageData>({
    userDetails: null,
    userListings: [],
    registryItem: null,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;
  const sessionReady = authStatus !== "loading";

  useEffect(() => {
    if (!sessionReady) return;

    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/listings/create");
      return;
    }

    if (!userId) return;

    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError(null);

      try {
        const [categories, userDetails, userListings] = await Promise.all([
          safeFetch<any[]>("/api/categories"),
          safeFetch<UserDetails>(`/api/user/${userId}`),
          safeFetch<any[]>(`/api/user/${userId}/listings`),
        ]);

        if (cancelled) return;
        if (!categories) toast.error("Failed to load categories");

        let registryItem: any | null = null;
        if (registryIdParam) {
          const data = await safeFetch<{ property: any }>(
            `/api/registry/${registryIdParam}`
          );
          if (!cancelled && data?.property?._id) {
            registryItem = data.property;
          }
        }

        if (cancelled) return;

        setPageData({
          categories: categories ?? [],
          userDetails: userDetails ?? null,
          userListings: Array.isArray(userListings) ? userListings : [],
          registryItem,
        });
      } catch (err: any) {
        if (!cancelled) {
          setError("Something went wrong loading this page. Please refresh.");
          console.error("CreateListingPage load error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, [sessionReady, authStatus, userId, registryIdParam, router]);

  if (!sessionReady || loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const { userDetails, userListings, registryItem, categories } = pageData;

  if (
    userListings.length > 0 &&
    userDetails?.listingQuota != null &&
    !userDetails?.unlimitedRegistrations &&
    userListings.length >= userDetails.listingQuota
  ) {
    return (
      <QuotaExceededState
        used={userListings.length}
        quota={userDetails.listingQuota}
      />
    );
  }

  if (userDetails?.status === "pending") return <PendingState />;

  if (userDetails?.status === "rejected") {
    return <RejectedState onContact={() => router.push("/contact")} />;
  }

  return <MainFormPage categories={categories} registryItem={registryItem} />;
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function CreateListingPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CreateListingContent />
    </Suspense>
  );
}