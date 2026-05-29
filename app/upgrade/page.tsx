"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Shield,
  Zap,
  Ticket,
  Loader2,
  Coins,
  Sparkles,
  Infinity,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function UpgradePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<number | null>(null);
  const [tokenCode, setTokenCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [buyingQuota, setBuyingQuota] = useState(false);
  const [quotaQuantity, setQuotaQuantity] = useState(1);
  const [creditBalance, setCreditBalance] = useState(0);
  const [hasUnlimited, setHasUnlimited] = useState(false);

  const [settings, setSettings] = useState({
    registrationCreditCost: 10,
    registrationPriceNGN: 1000,
    unlimitedRegistrationPriceNGN: 10000,
  });

  useEffect(() => {
    // Fetch initial credit balance if we don't have it
    if (session) {
      fetch("/api/tokens/my-tokens")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.limitInfo) {
            setCreditBalance(data.limitInfo.creditBalance || 0);
            setHasUnlimited(data.limitInfo.unlimitedRegistrations || false);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  useEffect(() => {
    // Fetch settings
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setSettings({
            registrationCreditCost: data.registrationCreditCost ?? 10,
            registrationPriceNGN: data.registrationPriceNGN ?? 1000,
            unlimitedRegistrationPriceNGN: data.unlimitedRegistrationPriceNGN ?? 10000,
          });
        }
      })
      .catch(console.error);
  }, []);

  const config = {
    reference:
      new Date().getTime().toString() + Math.floor(Math.random() * 1000),
    email: session?.user?.email || "anonymous@trade-zone.com",
    publicKey:
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder123",
  };

  const initializePayment = usePaystackPayment({ ...config, amount: 0 }); // Base config

  const handleSuccess = async (reference: string) => {
    try {
      const res = await fetch(`/api/tokens/verify?reference=${reference}`);
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Payment verified!");
        await update();
        router.refresh();
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (err) {
      toast.error("An error occurred during verification.");
    } finally {
      setLoadingTier(null);
    }
  };

  const handleClosePaystack = () => {
    toast.error("Payment cancelled");
    setLoadingTier(null);
  };

  const handlePurchase = (tierAmount: number) => {
    setLoadingTier(tierAmount);

    initializePayment({
      onSuccess: (val: any) => handleSuccess(val.reference),
      onClose: handleClosePaystack,
      config: {
        ...config,
        amount: tierAmount,
        metadata: {
          custom_fields: [
            {
              display_name: "Purchase Type",
              variable_name: "purchase_type",
              value: "unlimited",
            },
          ],
        },
      },
    } as any);
  };

  const handlePurchaseQuotaNaira = (quantity: number, amountNGN: number) => {
    setLoadingTier(-1);

    initializePayment({
      onSuccess: (val: any) => handleSuccess(val.reference),
      onClose: handleClosePaystack,
      config: {
        ...config,
        amount: amountNGN * 100, // in kobo
        metadata: {
          custom_fields: [
            {
              display_name: "Purchase Type",
              variable_name: "purchase_type",
              value: "quota",
            },
            {
              display_name: "Quantity",
              variable_name: "quantity",
              value: quantity.toString(),
            },
          ],
        },
      },
    } as any);
  };

  const handleRedeem = async () => {
    if (!tokenCode.trim()) {
      toast.error("Please enter a token code");
      return;
    }

    setRedeeming(true);
    try {
      const res = await fetch("/api/tokens/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: tokenCode }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Token redeemed successfully!");
        await update();
        router.refresh();
      } else {
        toast.error(data.error || "Failed to redeem token");
      }
    } catch (err) {
      toast.error("An error occurred during redemption.");
    } finally {
      setRedeeming(false);
    }
  };

  const handleBuyQuota = async () => {
    setBuyingQuota(true);
    try {
      const res = await fetch("/api/user/buy-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: quotaQuantity }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Quota purchased successfully!");
        setCreditBalance(data.newCreditBalance);
        await update();
        router.refresh();
      } else {
        toast.error(data.error || "Failed to purchase quota");
      }
    } catch (err) {
      toast.error("An error occurred during purchase.");
    } finally {
      setBuyingQuota(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-4">
          <Button variant="ghost" asChild className="gap-2 text-gray-500 hover:text-gray-900">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Link>
          </Button>
        </div>
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Upgrade Registration Limits
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            You've reached your free property registration limit. Purchase credits or get unlimited access to secure more of your valuable assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Buy Quota Card */}
          <Card className="border-2 hover:border-emerald-500 transition-all duration-200 bg-linear-to-br from-emerald-50/60 to-transparent dark:from-emerald-950/20 overflow-hidden shadow-sm hover:shadow-md">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Purchase Quotas</h3>
                <div className="p-2 bg-emerald-100 rounded-full">
                  <Coins className="h-6 w-6 text-emerald-600" />
                </div>
              </div>

              <div className="my-4 flex items-center justify-between bg-white dark:bg-gray-800/50 rounded-xl border border-emerald-500/20 p-1 shadow-inner">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-emerald-600 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900"
                  onClick={() => setQuotaQuantity(Math.max(1, quotaQuantity - 1))}
                >
                  -
                </Button>
                <span className="font-bold text-2xl text-center min-w-[3ch]">
                  {quotaQuantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-emerald-600 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900"
                  onClick={() => setQuotaQuantity(quotaQuantity + 1)}
                >
                  +
                </Button>
              </div>

              <div className="flex items-center justify-between mb-6 mt-2">
                <div className="text-base">
                  <div className="font-semibold text-gray-900">
                    {quotaQuantity * settings.registrationCreditCost} Credits
                  </div>
                </div>
                <div className="text-sm text-right text-muted-foreground flex flex-col items-end">
                  <div className="flex items-center gap-1 font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                    <Coins className="w-4 h-4" />
                    Balance: {creditBalance}
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <Button
                  onClick={handleBuyQuota}
                  disabled={
                    hasUnlimited ||
                    buyingQuota ||
                    creditBalance < quotaQuantity * settings.registrationCreditCost ||
                    loadingTier !== null
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all py-6 h-auto text-base"
                >
                  {hasUnlimited ? "Already Unlimited" : buyingQuota ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>Pay with Credits</>
                  )}
                </Button>

                <Button
                  onClick={() =>
                    handlePurchaseQuotaNaira(
                      quotaQuantity,
                      quotaQuantity * settings.registrationPriceNGN,
                    )
                  }
                  disabled={hasUnlimited || loadingTier !== null || buyingQuota}
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all py-6 h-auto text-base"
                >
                  {hasUnlimited ? "Already Unlimited" : loadingTier === -1 ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay with Naira (₦{quotaQuantity * settings.registrationPriceNGN})
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Unlimited Plan Card - Best Value */}
          <Card className="relative overflow-hidden border-2 border-amber-500/70 shadow-sm hover:shadow-md bg-linear-to-br from-amber-50/80 to-transparent dark:from-amber-950/30 transition-all duration-200 hover:border-amber-500">
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="h-4 w-4" />
                Best Value
              </div>
            </div>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-amber-700 dark:text-amber-400">
                  Unlimited Plan
                </h3>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Infinity className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="my-4">
                <span className="text-4xl font-black text-gray-900">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    minimumFractionDigits: 0,
                  }).format(settings.unlimitedRegistrationPriceNGN)}
                </span>
                <span className="text-sm font-medium text-muted-foreground ml-2">
                  lifetime
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-base text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="p-1 bg-amber-100 rounded-full">
                    <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                  </div>
                  <span className="font-medium text-gray-900">
                    Infinite property registrations
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                  </div>
                  <span>Lifetime access</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                  </div>
                  <span>Premium support + certificates</span>
                </li>
              </ul>
              <Button
                onClick={() =>
                  handlePurchase(settings.unlimitedRegistrationPriceNGN * 100)
                }
                disabled={hasUnlimited || loadingTier !== null}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white transition-all py-6 h-auto text-lg font-bold shadow-md hover:shadow-lg mt-auto"
              >
                {hasUnlimited ? "Already Unlimited" : loadingTier === settings.unlimitedRegistrationPriceNGN ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Go Unlimited →"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Token Redemption Section */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <Label
            htmlFor="token-code"
            className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900"
          >
            <div className="p-1.5 bg-blue-50 rounded-md">
              <Ticket className="h-5 w-5 text-blue-600" />
            </div>
            Have a Pre-purchased Token?
          </Label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                id="token-code"
                placeholder="Enter token code (e.g., TKN-1234-ABCD)"
                value={tokenCode}
                onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                disabled={redeeming || loadingTier !== null}
                className="w-full transition-all h-12 text-base uppercase"
                autoCapitalize="characters"
              />
            </div>
            <Button
              onClick={handleRedeem}
              disabled={!tokenCode.trim() || redeeming || loadingTier !== null}
              variant="secondary"
              className="sm:w-auto w-full h-12 px-8 text-base font-medium"
            >
              {redeeming ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Redeeming...
                </>
              ) : (
                "Redeem Token"
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Enter a valid token code to claim credits or unlock unlimited
            access instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
