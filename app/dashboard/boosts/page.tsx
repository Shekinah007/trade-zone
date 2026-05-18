"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  ArrowUpCircle,
  CheckCircle2,
  ShoppingCart,
  CreditCard,
  Coins,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

// Dynamically import the actual page content so it only renders on the client,
// preventing usePaystackPayment from running during SSR where window is undefined.
const BoostPageInner = dynamic(() => import("@/components/BoostPageInner"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  ),
});

export default function BoostListingsPage() {
  return <BoostPageInner />;
}
