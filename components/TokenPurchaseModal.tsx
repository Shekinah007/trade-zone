"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePaystackPayment } from "react-paystack";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export function TokenPurchaseModal({
  isOpen,
  onClose,
  initialCreditBalance = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialCreditBalance?: number;
}) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<number | null>(null);
  const [tokenCode, setTokenCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [buyingQuota, setBuyingQuota] = useState(false);

  const [settings, setSettings] = useState({
    registrationCreditCost: 10,
    unlimitedRegistrationPriceNGN: 10000,
  });

  const [creditBalance, setCreditBalance] = useState(initialCreditBalance);

  useEffect(() => {
    setCreditBalance(initialCreditBalance);
  }, [initialCreditBalance]);

  useEffect(() => {
    if (isOpen) {
      // Fetch settings
      fetch("/api/settings")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success) {
            setSettings({
              registrationCreditCost: data.registrationCreditCost || 10,
              unlimitedRegistrationPriceNGN:
                data.unlimitedRegistrationPriceNGN || 10000,
            });
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

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
        onClose();
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
    onClose();

    initializePayment({
      onSuccess: (val: any) => handleSuccess(val.reference),
      onClose: handleClosePaystack,
      config: {
        ...config,
        amount: tierAmount,
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
        onClose();
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
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Quota purchased successfully!");
        setCreditBalance(data.newCreditBalance);
        await update();
        onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-4xl rounded-2xl p-0 sm:p-6 gap-0 max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-5">
          <DialogHeader className="space-y-2 text-center sm:text-left">
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <span>Upgrade Registration Limits</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              You've reached your free property registration limit. Purchase
              credits or get unlimited access to secure more of your valuable
              assets.
            </DialogDescription>
          </DialogHeader>

          {/* Responsive Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {/* Buy Quota Card */}
            <Card className="border-2 hover:border-emerald-500 transition-all duration-200 bg-gradient-to-br from-emerald-50/60 to-transparent dark:from-emerald-950/20 overflow-hidden">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Single Quota</h3>
                  <Coins className="h-5 w-5 text-amber-500" />
                </div>
                <div className="my-3">
                  <span className="text-3xl font-black">
                    {settings.registrationCreditCost}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    Credits
                  </span>
                </div>
                <ul className="space-y-2 mb-5 flex-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span>+1 Property Registration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="font-medium">
                      Balance: {creditBalance} credits
                    </span>
                  </li>
                </ul>
                <Button
                  onClick={handleBuyQuota}
                  disabled={
                    buyingQuota ||
                    creditBalance < settings.registrationCreditCost
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all mt-2"
                >
                  {buyingQuota ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Buy 1 Quota"
                  )}
                </Button>
                {creditBalance < settings.registrationCreditCost && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Insufficient credits. Purchase a bundle below.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Credits Bundle Card */}
            <Card className="border-2 hover:border-blue-500 transition-all duration-200 bg-gradient-to-br from-blue-50/60 to-transparent dark:from-blue-950/20 overflow-hidden">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Credits Bundle</h3>
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </div>
                <div className="my-3">
                  <span className="text-3xl font-black">₦1,000</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    one-time
                  </span>
                </div>
                <ul className="space-y-2 mb-5 flex-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span>+50 Credits instantly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Stackable tokens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span>No expiry</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handlePurchase(100000)}
                  disabled={loadingTier !== null}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-all mt-2"
                >
                  {loadingTier === 100000 ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Buy Bundle →"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Unlimited Plan Card - Best Value */}
            <Card className="relative overflow-hidden border-2 border-amber-500/70 shadow-md bg-gradient-to-br from-amber-50/80 to-transparent dark:from-amber-950/30">
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wide">
                  <Sparkles className="h-3 w-3" />
                  Best Value
                </div>
              </div>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400">
                    Unlimited Plan
                  </h3>
                  <Infinity className="h-5 w-5 text-amber-500" />
                </div>
                <div className="my-3">
                  <span className="text-3xl font-black">₦10,000</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    lifetime
                  </span>
                </div>
                <ul className="space-y-2 mb-5 flex-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="font-medium">
                      Infinite property registrations
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Lifetime access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Premium support + certificates</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handlePurchase(1000000)}
                  disabled={loadingTier !== null}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white transition-all mt-2 shadow-sm"
                >
                  {loadingTier === 1000000 ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Go Unlimited →"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-2" />

          {/* Token Redemption Section - Responsive */}
          <div className="bg-gradient-to-br from-gray-50/80 to-white dark:from-gray-900/40 dark:to-gray-950/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <Label
              htmlFor="token-code"
              className="text-sm font-semibold flex items-center gap-2 mb-3"
            >
              <Ticket className="h-4 w-4 text-primary" />
              Have a Pre-purchased Token?
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  id="token-code"
                  placeholder="Enter token code (e.g., TKN-1234-ABCD)"
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                  disabled={redeeming || loadingTier !== null}
                  className="w-full transition-all"
                  autoCapitalize="characters"
                />
              </div>
              <Button
                onClick={handleRedeem}
                disabled={
                  !tokenCode.trim() || redeeming || loadingTier !== null
                }
                variant="secondary"
                className="sm:w-auto w-full"
              >
                {redeeming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Redeeming...
                  </>
                ) : (
                  "Redeem Token"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter a valid token code to claim credits or unlock unlimited
              access instantly.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
