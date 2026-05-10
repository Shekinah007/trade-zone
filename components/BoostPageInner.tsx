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
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { usePaystackPayment } from "react-paystack";
import { useRouter, useSearchParams } from "next/navigation";

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

  // Filter logic
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

  useEffect(() => {
    if (initialListingId && !selectedListings.includes(initialListingId)) {
      const target = listings.find((l) => l._id === initialListingId);
      if (!target || !isBoostActive(target)) {
        setSelectedListings([initialListingId]);
      }
    }
  }, [initialListingId, listings]);

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
        toast.success(data.message || "Listings boosted successfully!");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to boost listings");
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

    const onSuccess = async (referenceInfo: any) => {
      try {
        const res = await fetch("/api/user/boost-listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingIds: selectedListings,
            boostTierId: selectedTier,
            paymentMethod: "paystack",
            reference: referenceInfo.reference,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Listings boosted successfully!");
          router.push("/dashboard");
        } else {
          toast.error(data.error || "Failed to boost listings");
        }
      } catch {
        toast.error("A network error occurred.");
      } finally {
        setBoosting(false);
        setPaymentMethod(null);
      }
    };

    const onClose = () => {
      toast.error("Payment cancelled");
      setBoosting(false);
      setPaymentMethod(null);
    };

    initializePayment({
      onSuccess: (val: any) => onSuccess(val),
      onClose,
      config: {
        ...paystackConfig,
        amount: totalNairaCost * 100,
      },
    } as any);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const selectedTierData = tiers.find((t) => t._id === selectedTier);
  const totalCost = selectedTierData
    ? selectedTierData.creditCost * selectedListings.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
          <ArrowUpCircle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Boost Your Listings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Get more visibility by pinning your listings to the top of search
            results.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold text-lg">
                1. Select Listings to Boost
              </h3>
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden max-h-[400px] overflow-y-auto">
              {listings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No active listings available to boost.
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="p-12 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No listings found for "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredListings.map((listing) => {
                    const boosted = isBoostActive(listing);
                    const expiry = listing.listing?.boostExpiry
                      ? new Date(listing.listing.boostExpiry)
                      : null;
                    const isSelected = selectedListings.includes(listing._id);

                    return (
                      <div
                        key={listing._id}
                        onClick={() => handleToggleListing(listing._id)}
                        className={`flex items-center p-4 transition-colors ${
                          boosted
                            ? "opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/20"
                            : isSelected
                              ? "cursor-pointer bg-amber-50/50 dark:bg-amber-950/20"
                              : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex-1 flex gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden relative border border-gray-200 dark:border-gray-700">
                            {listing.images?.[0] && (
                              <img
                                src={listing.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                            {boosted && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                                <Lock className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {listing.listing?.title || listing.model}
                              </p>
                              {boosted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700 shrink-0">
                                  <Zap className="w-2.5 h-2.5" />
                                  BOOSTED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ₦{(listing.listing?.price || 0).toLocaleString()}
                            </p>
                            {boosted && expiry && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                                Expires {timeUntil(expiry)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div
                          className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${
                            boosted
                              ? "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                              : isSelected
                                ? "bg-amber-500 border-amber-500 text-white"
                                : "border-gray-300"
                          }`}
                        >
                          {boosted ? (
                            <Lock className="w-3 h-3 text-gray-400" />
                          ) : isSelected ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">
              2. Choose a Boost Tier
            </h3>
            <div className="grid gap-3">
              {tiers.map((tier) => (
                <div
                  key={tier._id}
                  onClick={() => setSelectedTier(tier._id)}
                  className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${
                    selectedTier === tier._id
                      ? "border-amber-500 ring-1 ring-amber-500 bg-amber-50/30 dark:bg-amber-900/10"
                      : "hover:border-amber-300 bg-white dark:bg-gray-900"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-amber-700 dark:text-amber-500">
                      {tier.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {tier.durationInDays} days of top placement
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {tier.creditCost} Credits
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or ₦{tier.priceNGN}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Summary
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Listings Selected:
                </span>
                <span className="font-semibold">{selectedListings.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tier:</span>
                <span className="font-semibold text-amber-600">
                  {selectedTierData ? selectedTierData.name : "None selected"}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-bold">Total Cost:</span>
                <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {totalCost} Credits
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleBoost}
                disabled={
                  selectedListings.length === 0 || !selectedTier || boosting
                }
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center gap-2"
              >
                {boosting && paymentMethod === "credit" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Coins className="w-5 h-5" />
                )}
                Pay {totalCost} Credits
              </button>
              <button
                onClick={handleBoostPaystack}
                disabled={
                  selectedListings.length === 0 || !selectedTier || boosting
                }
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center gap-2"
              >
                {boosting && paymentMethod === "paystack" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                Pay ₦
                {selectedTierData
                  ? (
                      selectedTierData.priceNGN * selectedListings.length
                    ).toLocaleString()
                  : 0}{" "}
                directly
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
