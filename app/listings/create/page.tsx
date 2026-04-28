"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Clock, Loader2, PlusCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ListingForm } from "@/components/ListingForm";
import { Button } from "@/components/ui/button";
import { ReapplyButton } from "@/components/Reapply";

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/listings/create");
    return null;
  }

  if (session?.user?.status === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative mx-auto w-fit mb-6">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl" />
            <div className="relative p-5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-3">Account Pending Approval</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Your account is currently under review by our team. You will be
            notified once approved and can start posting listings. Please note
            that you will have to login again for the changes to take effect.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border hover:bg-muted transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Listings
          </Link>
        </div>
      </div>
    );
  }
  if (session?.user?.status === "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50/50 to-background dark:from-red-950/10 dark:to-background flex items-center justify-center px-4">
        <div className="text-center max-w-lg w-full">
          {/* Status Icon */}
          <div className="relative mx-auto w-fit mb-8">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-2 border-red-200 dark:border-red-800">
              <svg
                className="h-14 w-14 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
          </div>

          {/* Title & Description */}
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Account Activation Rejected
          </h1>

          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 leading-relaxed">
              Your account activation request has been reviewed and rejected by
              our verification team. Please review the possible reasons below
              before reapplying.
            </p>
          </div>

          {/* Possible Issues Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm text-left">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <svg
                className="h-5 w-5 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              Common Issues to Rectify Before Reapplying
            </h3>

            <div className="space-y-3">
              {[
                {
                  icon: (
                    <svg
                      className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ),
                  text: "Incomplete or inaccurate profile information",
                },
                {
                  icon: (
                    <svg
                      className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ),
                  text: "Invalid or unclear identification documents",
                },
                {
                  icon: (
                    <svg
                      className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ),
                  text: "Business documentation doesn't meet requirements",
                },
                {
                  icon: (
                    <svg
                      className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ),
                  text: "Mismatch between provided information and documents",
                },
                {
                  icon: (
                    <svg
                      className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ),
                  text: "Potential duplicate or multiple accounts detected",
                },
              ].map((issue, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  {issue.icon}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {issue.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Steps */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Recommended Steps
            </h4>
            <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5 list-decimal list-inside">
              <li>
                Review your profile and ensure all information is accurate
              </li>
              <li>Upload clear, valid identification documents</li>
              <li>Make sure your business details match your documents</li>
              <li>Contact our support team if you need clarification</li>
              <li>Only reapply after addressing the issues above</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ReapplyButton />
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
              onClick={() => router.push("/contact")}
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
              Contact Support
            </Button>
          </div>

          {/* Browse Link */}
          <div className="mt-6">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Continue browsing listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Link
            href="/browse"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Browse
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Post a New Ad
              </h1>
              <p className="text-muted-foreground text-sm">
                Fill in the details below to list your item for sale
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-1 md:px-4 py-4 max-w-3xl">
        {/* Progress hint */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Item Details", desc: "Title, category, condition" },
            { label: "Photos & Price", desc: "Images and pricing" },
            { label: "Location", desc: "Where you're selling from" },
          ].map((step, i) => (
            <div
              key={i}
              className="rounded-xl border bg-background p-3 text-center"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mx-auto mb-1">
                {i + 1}
              </div>
              <p className="text-xs font-semibold">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-background shadow-sm p-6 md:p-8">
          <ListingForm categories={categories} />
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          By posting, you agree to our{" "}
          <Link
            href="/terms"
            className="hover:text-primary underline underline-offset-2"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="hover:text-primary underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
