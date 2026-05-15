"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  ArrowUpCircle,
  CheckCircle2,
  ShoppingCart,
  CreditCard,
  Coins,
  Lock,
  Zap,
  Search,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { usePaystackPayment } from "react-paystack";
import { useRouter, useSearchParams } from "next/navigation";

// Utility for formatting relative time
function timeUntil(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  return rtf.format(diffDays, "day");
}

export default function BoostPageInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialListingId = searchParams?.get("listingId");

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [boosting, setBoosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "credit" | "paystack" | null
  >(null);

  const paystackConfig = {
    reference:
      new Date().getTime().toString() + Math.floor(Math.random() * 1000),
    email: session?.user?.email || "anonymous@trade-zone.com",
    publicKey:
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder123",
  };

  const initializePayment = usePaystackPayment({
    ...paystackConfig,
    amount: 0,
  });

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const title = (item.listing?.title || item.model || "").toLowerCase();
      return title.includes(searchQuery.toLowerCase());
    });
  }, [listings, searchQuery]);

  const isBoostActive = (listing: any) => {
    return (
      listing.listing?.boostStatus === "active" &&
      listing.listing?.boostExpiry &&
      new Date(listing.listing.boostExpiry) > new Date()
    );
  };

  const fetchData = async () => {
    try {
      const [listingsRes, tiersRes] = await Promise.all([
        fetch("/api/listings/my-active"),
        fetch("/api/admin/boost-tiers"),
      ]);
      if (tiersRes.ok) setTiers(await tiersRes.json());
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialListingId && !selectedListings.includes(initialListingId)) {
      const target = listings.find((l) => l._id === initialListingId);
      if (!target || !isBoostActive(target)) {
        setSelectedListings([initialListingId]);
      }
    }
  }, [initialListingId, listings]);

  const handleToggleListing = (id: string) => {
    const listing = listings.find((l) => l._id === id);
    if (listing && isBoostActive(listing)) return;
    setSelectedListings((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBoost = async () => {
    if (selectedListings.length === 0 || !selectedTier) return;
    setBoosting(true);
    setPaymentMethod("credit");
    try {
      const res = await fetch("/api/user/boost-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingIds: selectedListings,
          boostTierId: selectedTier,
          paymentMethod: "credit",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Boost activated!");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to boost");
      }
    } catch {
      toast.error("A network error occurred.");
    } finally {
      setBoosting(false);
      setPaymentMethod(null);
    }
  };

  const handleBoostPaystack = () => {
    if (selectedListings.length === 0 || !selectedTier) return;
    const tierData = tiers.find((t) => t._id === selectedTier);
    if (!tierData) return;
    setBoosting(true);
    setPaymentMethod("paystack");
    const totalNairaCost = tierData.priceNGN * selectedListings.length;

    initializePayment({
      onSuccess: async (ref: any) => {
        const res = await fetch("/api/user/boost-listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingIds: selectedListings,
            boostTierId: selectedTier,
            paymentMethod: "paystack",
            reference: ref.reference,
          }),
        });
        const d = await res.json();
        if (d.success) router.push("/dashboard");
        setBoosting(false);
      },
      onClose: () => {
        toast.error("Payment cancelled");
        setBoosting(false);
        setPaymentMethod(null);
      },
      config: { ...paystackConfig, amount: totalNairaCost * 100 },
    } as any);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
          <p className="text-muted-foreground animate-pulse">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const selectedTierData = tiers.find((t) => t._id === selectedTier);
  const totalCredits = selectedTierData
    ? selectedTierData.creditCost * selectedListings.length
    : 0;
  const totalNaira = selectedTierData
    ? selectedTierData.priceNGN * selectedListings.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-32 md:pb-12">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/5 pt-12 pb-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <Zap className="h-7 w-7 text-amber-500 fill-amber-500" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight dark:text-white">
              Supercharge Visibility
            </h1>
            <p className="text-muted-foreground text-sm">
              Reach more buyers by promoting your listings.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-8">
        {/* Left Column: Listings & Tiers */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Selection */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-[12px]">
                  1
                </span>
                Choose Listings
              </h2>
              <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded-lg">
                {selectedListings.length} selected
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-4 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by title or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white dark:bg-[#161616] border-none rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredListings.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                  <p className="text-muted-foreground">No listings found.</p>
                </div>
              ) : (
                filteredListings.map((listing) => {
                  const active = isBoostActive(listing);
                  const isSelected = selectedListings.includes(listing._id);
                  return (
                    <div
                      key={listing._id}
                      onClick={() => handleToggleListing(listing._id)}
                      className={`relative flex items-center p-3 gap-4 rounded-2xl transition-all border-2 cursor-pointer
                        ${
                          active
                            ? "opacity-60 cursor-not-allowed border-transparent bg-gray-100 dark:bg-white/5"
                            : isSelected
                              ? "border-amber-500 bg-amber-500/[0.03] shadow-md"
                              : "border-transparent bg-white dark:bg-[#111] hover:border-gray-200 dark:hover:border-white/10 shadow-sm"
                        }
                      `}
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {listing.images?.[0] && (
                          <img
                            src={listing.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        {active && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate pr-6">
                          {listing.listing?.title || listing.model}
                        </h4>
                        <p className="text-xs text-amber-600 font-semibold">
                          ₦{(listing.listing?.price || 0).toLocaleString()}
                        </p>
                        {active && (
                          <span className="mt-1 inline-block text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                            Already Boosted
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${isSelected ? "bg-amber-500 border-amber-500 scale-110" : "border-gray-300 dark:border-white/20"}
                      `}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Step 2: Tiers */}
          <section>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 px-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-[12px]">
                2
              </span>
              Select Plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier._id}
                  onClick={() => setSelectedTier(tier._id)}
                  className={`
    relative p-4 rounded-2xl cursor-pointer transition-all duration-200
    ${
      selectedTier === tier._id
        ? "bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-500 shadow-lg shadow-amber-500/10"
        : "bg-white dark:bg-gray-900/80 border-gray-200/70 dark:border-gray-800 hover:border-amber-300/50 hover:shadow-md"
    }
    border-2 backdrop-blur-sm
  `}
                >
                  {/* Selected indicator dot (top right) */}
                  {selectedTier === tier._id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse" />
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h4 className="font-black text-lg tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        {tier.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {tier.durationInDays} days visibility
                      </p>
                    </div>
                    <Zap
                      className={`
        w-5 h-5 transition-all duration-200
        ${
          selectedTier === tier._id
            ? "text-amber-500 fill-amber-500 drop-shadow-sm"
            : "text-gray-400 dark:text-gray-600"
        }
      `}
                    />
                  </div>

                  {/* Price row – Naira prominently displayed */}
                  <div className="mb-3 pb-2 border-b border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                      Naira price
                    </p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      ₦{tier.priceNGN.toLocaleString()}
                    </p>
                  </div>

                  {/* Credit cost – clear and punchy */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                      {tier.creditCost}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Credits
                    </span>
                  </div>

                  {/* Optional: per day cost highlight (adds value) */}
                  <div className="mt-3 text-[11px] text-muted-foreground/70">
                    ≈ {(tier.creditCost / tier.durationInDays).toFixed(1)}{" "}
                    credits/day
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Checkout Summary (Desktop Only Sidebar) */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="bg-white dark:bg-[#111] rounded-[32px] p-8 sticky top-8 shadow-xl shadow-amber-500/5 border border-gray-100 dark:border-white/5">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              Order Summary
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <span className="text-sm text-muted-foreground">
                  Items to boost
                </span>
                <span className="font-bold">{selectedListings.length}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <span className="text-sm text-muted-foreground">
                  Active Plan
                </span>
                <span className="font-bold text-amber-600">
                  {selectedTierData?.name || "---"}
                </span>
              </div>
            </div>

            <div className="py-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-end mb-8">
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  Grand Total
                </p>
                <p className="text-3xl font-black text-amber-500">
                  {totalCredits} Credits
                </p>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                ≈ ₦{totalNaira.toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              <button
                disabled={
                  !selectedTier || selectedListings.length === 0 || boosting
                }
                onClick={handleBoost}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {boosting && paymentMethod === "credit" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Coins className="w-5 h-5" />
                )}
                Pay with Credits
              </button>
              <button
                disabled={
                  !selectedTier || selectedListings.length === 0 || boosting
                }
                onClick={handleBoostPaystack}
                className="w-full py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold transition-all flex items-center justify-center gap-2"
              >
                {boosting && paymentMethod === "paystack" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                Pay ₦{totalNaira.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:col-span-5 md:hidden fixed bottom-0 left-0 right-0 z-20">
        <div className="bg-white/95 dark:bg-[#111]/95 backdrop-blur-md rounded-t-2xl shadow-xl border-t border-gray-200 dark:border-white/10 px-4 pt-3 pb-5">
          {/* Header with close indicator (optional) */}
          <div className="flex justify-center mb-2">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>

          <h3 className="text-base font-bold mb-2 flex items-center gap-1">
            Order Summary
          </h3>

          {/* Two-column summary for compactness */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2">
              <p className="text-[11px] text-muted-foreground">
                Items to boost
              </p>
              <p className="font-bold text-lg">{selectedListings.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2">
              <p className="text-[11px] text-muted-foreground">Active Plan</p>
              <p className="font-bold text-amber-600 text-sm truncate">
                {selectedTierData?.name || "---"}
              </p>
            </div>
          </div>

          {/* Total row - more compact */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-2 mb-3">
            <div>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                Grand Total
              </p>
              <p className="text-2xl font-black text-amber-500 leading-tight">
                {totalCredits} Credits
              </p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              ≈ ₦{totalNaira.toLocaleString()}
            </p>
          </div>

          {/* Buttons row - horizontal stacking on mobile for compactness */}
          <div className="flex gap-2">
            <button
              disabled={
                !selectedTier || selectedListings.length === 0 || boosting
              }
              onClick={handleBoost}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all active:scale-[0.97] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-1.5 text-sm shadow-md"
            >
              {boosting && paymentMethod === "credit" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Coins className="w-4 h-4" />
              )}
              Credits
            </button>
            <button
              disabled={
                !selectedTier || selectedListings.length === 0 || boosting
              }
              onClick={handleBoostPaystack}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold transition-all flex items-center justify-center gap-1.5 text-sm"
            >
              {boosting && paymentMethod === "paystack" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              ₦{totalNaira.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
