"use client";

import { useState } from "react";
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
import { Check, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function TokenPurchaseModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<number | null>(null);

  const config = {
    reference: new Date().getTime().toString() + Math.floor(Math.random() * 1000),
    email: session?.user?.email || "anonymous@trade-zone.com",
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder123",
  };

  const initializePayment = usePaystackPayment({ ...config, amount: 0 }); // Base config

  const handleSuccess = async (reference: string) => {
    try {
      const res = await fetch(`/api/tokens/verify?reference=${reference}`);
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Payment verified!");
        // Update the session explicitly so the rest of the app knows limits are increased
        await update(); 
        onClose();
        router.refresh(); // Refresh dashboard stats
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
    
    // Override the amount when calling the initialize method
    initializePayment({
        onSuccess: (val: any) => handleSuccess(val.reference),
        onClose: handleClosePaystack,
        config: {
          ...config,
          amount: tierAmount
        }
    } as any);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Upgrade Registration Limits
          </DialogTitle>
          <DialogDescription>
            You have reached your free property registration limit. Purchase a token to secure more of your valuable assets.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Tier 1 */}
          <Card className="border-2 hover:border-blue-500 transition-colors bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="font-bold text-lg">Bundle Pack</h3>
              <div className="my-4">
                <span className="text-3xl font-black">₦1,000</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> +5 Property Registrations
                </li>
                {/* <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Ownership Certificates
                </li> */}
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Stackable tokens
                </li>
              </ul>
              <Button 
                onClick={() => handlePurchase(100000)} // 100,000 kobo = N1,000
                disabled={loadingTier !== null}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loadingTier === 100000 ? "Processing..." : "Select Bundle"}
              </Button>
            </CardContent>
          </Card>

          {/* Tier 2 */}
          <Card className="bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20 border-2 border-amber-500 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Best Value
            </div>
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400">Unlimited Plan</h3>
              <div className="my-4">
                <span className="text-3xl font-black">₦10,000</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" /> Infinite Property Registrations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Lifetime access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Premium support
                </li>
              </ul>
              <Button 
                onClick={() => handlePurchase(1000000)} // 1,000,000 kobo = N10,000
                disabled={loadingTier !== null}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {loadingTier === 1000000 ? "Processing..." : "Go Unlimited"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
