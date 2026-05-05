"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowUpCircle, CheckCircle2, AlertCircle, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function BoostListingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialListingId = searchParams?.get('listingId');

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [boosting, setBoosting] = useState(false);

  useEffect(() => {
    if (initialListingId && !selectedListings.includes(initialListingId)) {
      setSelectedListings([initialListingId]);
    }
  }, [initialListingId]);

  const fetchData = async () => {
    try {
      const [listingsRes, tiersRes] = await Promise.all([
        fetch("/api/listings/my-active"), // We need an endpoint for this, or just fetch all items and filter. Wait, we can fetch from an existing API.
        fetch("/api/admin/boost-tiers")
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
    setSelectedListings(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBoost = async () => {
    if (selectedListings.length === 0 || !selectedTier) return;
    setBoosting(true);
    try {
      const res = await fetch("/api/user/boost-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingIds: selectedListings,
          boostTierId: selectedTier,
          paymentMethod: 'credit'
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Listings boosted successfully!");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to boost listings");
      }
    } catch (err) {
      toast.error("A network error occurred.");
    } finally {
      setBoosting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  const selectedTierData = tiers.find(t => t._id === selectedTier);
  const totalCost = selectedTierData ? selectedTierData.creditCost * selectedListings.length : 0;

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
            Get more visibility by pinning your listings to the top of search results.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">1. Select Listings to Boost</h3>
            <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden max-h-[400px] overflow-y-auto">
              {listings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No active listings available to boost.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {listings.map(listing => (
                    <div 
                      key={listing._id} 
                      onClick={() => handleToggleListing(listing._id)}
                      className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedListings.includes(listing._id) ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                    >
                      <div className="flex-1 flex gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                          {listing.images?.[0] && <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{listing.listing?.title || listing.model}</p>
                          <p className="text-xs text-muted-foreground">₦{(listing.listing?.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded border flex items-center justify-center ${selectedListings.includes(listing._id) ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300'}`}>
                        {selectedListings.includes(listing._id) && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">2. Choose a Boost Tier</h3>
            <div className="grid gap-3">
              {tiers.map(tier => (
                <div 
                  key={tier._id}
                  onClick={() => setSelectedTier(tier._id)}
                  className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedTier === tier._id ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/30 dark:bg-amber-900/10' : 'hover:border-amber-300'}`}
                >
                  <div>
                    <h4 className="font-bold text-amber-700 dark:text-amber-500">{tier.name}</h4>
                    <p className="text-sm text-muted-foreground">{tier.durationInDays} days of top placement</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{tier.creditCost} Credits</p>
                    <p className="text-xs text-muted-foreground">or ₦{tier.priceNGN}</p>
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
                <span className="text-muted-foreground">Listings Selected:</span>
                <span className="font-semibold">{selectedListings.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tier:</span>
                <span className="font-semibold text-amber-600">{selectedTierData ? selectedTierData.name : 'None selected'}</span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-bold">Total Cost:</span>
                <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {totalCost} Credits
                </span>
              </div>
            </div>

            <button
              onClick={handleBoost}
              disabled={selectedListings.length === 0 || !selectedTier || boosting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center gap-2"
            >
              {boosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpCircle className="w-5 h-5" />}
              Pay {totalCost} Credits
            </button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Credits will be deducted from your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
