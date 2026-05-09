// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Star, CreditCard, Coins, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PaystackPop from "@paystack/inline-js";

export default function WaitlistCheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const waitlistId = searchParams?.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!waitlistId) {
      router.push("/dashboard/featured");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/featured-status");
        if (res.ok) {
          const statusData = await res.json();
          const entry = statusData.userWaitlist.find(
            (w: any) => w._id === waitlistId,
          );
          if (entry) {
            setData({
              entry,
              creditBalance: statusData.creditBalance || 0, // (not fetched in user status, but assuming user handles it or we pass it)
            });
          } else {
            alert("Waitlist entry not found.");
            router.push("/dashboard/featured");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [waitlistId, router]);

  const handleCheckout = async (method: "credits" | "paystack") => {
    setProcessing(true);

    if (method === "paystack") {
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: session?.user?.email!,
        amount: data.entry.tier.priceNGN * 100,
        currency: "NGN",
        onSuccess: async (transaction: any) => {
          await completeCheckout("paystack", transaction.reference);
        },
        onCancel: () => {
          setProcessing(false);
        },
      });
    } else {
      await completeCheckout("credits");
    }
  };

  const completeCheckout = async (
    method: "credits" | "paystack",
    reference?: string,
  ) => {
    try {
      const res = await fetch("/api/user/featured-listings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlistId,
          paymentMethod: method,
          reference,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to checkout");

      alert("Featured slot claimed successfully!");
      router.push("/dashboard/featured");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const { entry } = data;

  if (entry.status !== "notified") {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Slot Not Available Yet</h2>
        <p className="text-muted-foreground mb-6">
          Your status is currently "{entry.status}". You can only claim a slot
          when you have been notified.
        </p>
        <Button onClick={() => router.push("/dashboard/featured")}>
          Back to Featured
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <div className="mb-6 flex items-center justify-center gap-3 text-center">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20">
          <Star className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Claim Your Featured Slot
        </h1>
      </div>

      <Card className="border-purple-200 shadow-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold">
              {entry.item?.listing?.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              A featured slot has opened up! Complete your payment to activate
              your {entry.tier?.durationInDays}-day feature.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6 border border-purple-100 dark:border-purple-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Tier</span>
              <span className="font-medium">{entry.tier?.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="font-medium">
                {entry.tier?.durationInDays} Days
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Price (NGN)</span>
              <span className="font-bold">
                ₦{entry.tier?.priceNGN.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Price (Credits)
              </span>
              <span className="font-bold text-amber-600">
                {entry.tier?.creditCost} Credits
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              disabled={processing}
              onClick={() => handleCheckout("credits")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-6"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  Pay {entry.tier?.creditCost} Credits
                </>
              )}
            </Button>
            <Button
              disabled={processing}
              onClick={() => handleCheckout("paystack")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₦{entry.tier?.priceNGN.toLocaleString()}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            If you do not complete payment within 24 hours of notification, your
            slot will be passed to the next person.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
