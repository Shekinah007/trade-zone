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