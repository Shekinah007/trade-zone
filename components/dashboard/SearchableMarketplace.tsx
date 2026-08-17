"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Star,
  ArrowUpCircle,
  Edit,
  X,
} from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ListingData {
  _id: string;
  brand: string;
  model: string;
  images: string[];
  createdAt: string;
  listing?: {
    title?: string;
    price?: number;
    category?: string;
    condition?: string;
    location?: { city: string; state?: string; country: string };
    status?: string;
    featuredStatus?: string;
    boostStatus?: string;
  };
}

interface SearchableMarketplaceProps {
  activeListings: ListingData[];
  soldListings: ListingData[];
}

export function SearchableMarketplace({
  activeListings,
  soldListings,
}: SearchableMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalize = (str: string | undefined) =>
    str?.toLowerCase().trim() ?? "";

  const matchesQuery = (listing: ListingData) => {
    const q = normalize(searchQuery);
    if (!q) return true;

    const title = normalize(listing.listing?.title || listing.model);
    const brand = normalize(listing.brand);
    const model = normalize(listing.model);
    const category = normalize(listing.listing?.category as string);
    const city = normalize(listing.listing?.location?.city);
    const state = normalize(listing.listing?.location?.state);
    const country = normalize(listing.listing?.location?.country);
    const condition = normalize(listing.listing?.condition);

    return (
      title.includes(q) ||
      brand.includes(q) ||
      model.includes(q) ||
      category.includes(q) ||
      city.includes(q) ||
      state.includes(q) ||
      country.includes(q) ||
      condition.includes(q)
    );
  };

  const filteredActive = useMemo(
    () => activeListings.filter(matchesQuery),
    [activeListings, searchQuery],
  );

  const filteredSold = useMemo(
    () => soldListings.filter(matchesQuery),
    [soldListings, searchQuery],
  );

  const hasQuery = searchQuery.trim().length > 0;
  const totalResults = filteredActive.length + filteredSold.length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your listings by title, brand, model, location..."
          className="w-full h-11 pl-11 pr-10 text-sm rounded-full bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 outline-none transition-all shadow-sm placeholder:text-muted-foreground"
        />
        {hasQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search result indicator */}
      {hasQuery && (
        <p className="text-xs text-muted-foreground">
          {totalResults} result{totalResults !== 1 ? "s" : ""} found for{" "}
          <span className="font-semibold text-foreground">"{searchQuery}"</span>
        </p>
      )}

      {/* Listings Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-emerald-500/10 h-8">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs h-7"
          >
            Active ({filteredActive.length})
          </TabsTrigger>
          <TabsTrigger
            value="sold"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs h-7"
          >
            Sold ({filteredSold.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {filteredActive.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActive.map((listing: any) => (
                <div key={listing._id} className="relative group">
                  <ListingCard
                    id={listing._id}
                    title={listing.listing?.title || listing.model}
                    price={listing.listing?.price}
                    image={listing.images[0]}
                    category={listing.listing?.category}
                    condition={listing.listing?.condition}
                    location={listing.listing?.location}
                    createdAt={listing.createdAt}
                    boostStatus={listing.listing?.boostStatus}
                  />
                  {listing.listing?.featuredStatus === "active" && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-linear-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-lg px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                      title="Boost Listing"
                      asChild
                    >
                      <Link href={`/dashboard/boosts?listingId=${listing._id}`}>
                        <ArrowUpCircle className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      asChild
                    >
                      <Link href={`/listings/${listing._id}/edit`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Package className="h-8 w-8 mb-2 opacity-50" />
                {hasQuery ? (
                  <>
                    <p className="text-sm">
                      No active listings match your search.
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 text-xs"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search →
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm">
                      You don't have any active listings.
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="mt-1 text-xs"
                    >
                      <Link href="/listings/create">
                        Create your first listing →
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sold" className="mt-4">
          {filteredSold.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSold.map((listing: any) => (
                <ListingCard
                  key={listing._id}
                  id={listing._id}
                  title={listing.listing?.title || listing.model}
                  price={listing.listing?.price}
                  image={listing.images[0]}
                  category={listing.listing?.category}
                  condition={listing.listing?.condition}
                  location={listing.listing?.location}
                  createdAt={listing.createdAt}
                  boostStatus={listing.listing?.boostStatus}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                {hasQuery ? (
                  <>
                    <p className="text-sm">
                      No sold items match your search.
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 text-xs"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search →
                    </Button>
                  </>
                ) : (
                  <p className="text-sm">No sold items yet.</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}