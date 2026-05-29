"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Star,
  Clock,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Coins,
  CheckCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
// import PaystackPop from "@paystack/inline-js";

export default function UserFeaturedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [selectedListing, setSelectedListing] = useState("");
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/featured-status");
      if (res.ok) {
        setData(await res.json());
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

  const isFull = data
    ? data.totalActiveFeatured >= data.maxFeaturedSlots
    : false;

  const handlePurchase = async (method: "credit" | "paystack") => {
    if (!selectedListing || !selectedTier) return;

    setProcessing(true);

    if (method === "paystack") {
      // const paystack = new PaystackPop();
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: session?.user?.email!,
        amount: selectedTier.priceNGN * 100,
        currency: "NGN",
        onSuccess: async (transaction: any) => {
          await completePurchase("naira", transaction.reference);
          toast.success("Success");
          window.location.reload();
        },
        onCancel: () => {
          setProcessing(false);
        },
      });
    } else {
      await completePurchase("credit");
    }
  };

  const completePurchase = async (
    method: "credit" | "naira",
    reference?: string,
  ) => {
    try {
      const res = await fetch("/api/user/featured-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedListing,
          featuredTierId: selectedTier._id,
          paymentMethod: method,
          reference,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to purchase");

      toast(
        result.waitlistEntry
          ? "Added to waitlist successfully! You will be notified when a slot opens."
          : "Listing featured successfully!",
      );

      setSelectedListing("");
      window.location.reload();
      setSelectedTier(null);
      fetchData();
    } catch (err: any) {
      console.log("Error", err);
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnfeature = async (itemId: string) => {
    if (!confirm("Are you sure you want to unfeature this item? You will not be refunded for any remaining time.")) return;

    try {
      const res = await fetch("/api/user/featured-status/unfeature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to unfeature");
      toast.success("Item unfeatured successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20">
          <Star className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Featured Listings
          </h1>
          <p className="text-muted-foreground mt-1">
            Get your items on the homepage to maximize visibility
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-purple-200 dark:border-purple-900 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Feature a Listing</h2>
                {isFull ? (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> Slots Full (Waitlist
                    Only)
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Slots Available
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">
                    Select Listing
                  </label>

                  <div className="relative">
                    <div
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl flex items-center justify-between cursor-pointer transition-colors hover:border-purple-300"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <span
                        className={
                          selectedListing
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {selectedListing
                          ? data?.userListings.find(
                            (l: any) => l._id === selectedListing,
                          )
                            ? `${data.userListings.find((l: any) => l._id === selectedListing).listing?.title || data.userListings.find((l: any) => l._id === selectedListing).model}`
                            : "-- Choose a listing --"
                          : "-- Choose a listing --"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`}
                      />
                    </div>

                    {showDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute z-20 w-full mt-2 bg-card border rounded-xl shadow-xl max-h-[300px] flex flex-col overflow-hidden">
                          <div className="p-2 border-b flex items-center gap-2 bg-muted/20">
                            <Search className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
                            <input
                              type="text"
                              placeholder="Search by title or model..."
                              className="w-full bg-transparent outline-none text-sm py-1"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto p-1">
                            {data?.userListings.filter((l: any) => {
                              const term = searchQuery.toLowerCase();
                              return (
                                l.listing?.title
                                  ?.toLowerCase()
                                  .includes(term) ||
                                l.model?.toLowerCase().includes(term)
                              );
                            }).length === 0 ? (
                              <div className="p-4 text-sm text-muted-foreground text-center">
                                No listings found matching "{searchQuery}"
                              </div>
                            ) : (
                              data?.userListings
                                .filter((l: any) => {
                                  const term = searchQuery.toLowerCase();
                                  return (
                                    l.listing?.title
                                      ?.toLowerCase()
                                      .includes(term) ||
                                    l.model?.toLowerCase().includes(term)
                                  );
                                })
                                .map((l: any) => (
                                  <div
                                    key={l._id}
                                    className={`p-3 text-sm rounded-lg hover:bg-muted cursor-pointer flex justify-between items-center transition-colors ${selectedListing === l._id ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" : ""}`}
                                    onClick={() => {
                                      setSelectedListing(l._id);
                                      setShowDropdown(false);
                                      setSearchQuery("");
                                    }}
                                  >
                                    <span className="font-medium truncate mr-2">
                                      {l.listing?.title || l.model}
                                    </span>
                                    <span className="text-muted-foreground font-semibold shrink-0">
                                      ₦{l.listing?.price?.toLocaleString() || 0}
                                    </span>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {data?.userListings.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      You have no active unfeatured listings to select.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Tier
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data?.featuredTiers.map((tier: any) => (
                      <div
                        key={tier._id}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedTier?._id === tier._id
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md ring-1 ring-purple-500"
                            : "hover:border-purple-300"
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                            {tier.name}
                          </h3>
                          <Badge variant="outline">
                            {tier.durationInDays} Days
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="w-4 h-4" /> ₦
                            {tier.priceNGN.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Coins className="w-4 h-4" /> {tier.creditCost}{" "}
                            Credits
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedListing && selectedTier && (
                  <div className="pt-6 border-t mt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        disabled={processing}
                        onClick={() => handlePurchase("credit")}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-6"
                      >
                        {processing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Coins className="w-5 h-5 mr-2" />
                            Pay {selectedTier.creditCost} Credits{" "}
                            {isFull && "(Waitlist)"}
                          </>
                        )}
                      </Button>
                      <Button
                        disabled={processing}
                        onClick={() => handlePurchase("paystack")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6"
                      >
                        {processing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Pay ₦{selectedTier.priceNGN.toLocaleString()}{" "}
                            {isFull && "(Waitlist)"}
                          </>
                        )}
                      </Button>
                    </div>
                    {isFull && (
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        Since slots are full, payment secures your place in the
                        waitlist. If you pay via Paystack, you'll enter the
                        waitlist and complete payment only when your slot is
                        ready. If you use credits, they are deducted immediately.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Your Active Features</h3>
              </div>
              <div className="p-4 space-y-4">
                {data?.userActiveFeatured.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active features.
                  </p>
                ) : (
                  data?.userActiveFeatured.map((item: any) => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 m-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.listing?.title || item.model}
                        </p>
                        <p className="text-xs text-purple-600">
                          Expires:{" "}
                          {new Date(
                            item.listing?.featuredExpiry,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnfeature(item._id)}
                      >
                        Unfeature
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">Your Waitlist</h3>
              </div>
              <div className="p-4 space-y-4">
                {data?.userWaitlist.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Not on any waitlist.
                  </p>
                ) : (
                  data?.userWaitlist.map((entry: any) => (
                    <div key={entry._id} className="border rounded-lg p-3">
                      <p className="text-sm font-medium truncate mb-1">
                        {entry.item?.listing?.title || entry.item?.model}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge
                          variant="outline"
                          className={
                            entry.status === "notified"
                              ? "border-blue-500 text-blue-600"
                              : entry.status === "waiting"
                                ? "border-amber-500 text-amber-600"
                                : "border-gray-500"
                          }
                        >
                          {entry.status.toUpperCase()}
                        </Badge>

                        {entry.status === "notified" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/featured/checkout?id=${entry._id}`,
                              )
                            }
                          >
                            Claim Slot
                          </Button>
                        )}
                      </div>
                      {entry.notifiedAt && entry.status === "notified" && (
                        <p className="text-xs text-red-500 mt-2">
                          Please claim within 24h of{" "}
                          {new Date(entry.notifiedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
