"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Share2,
  Copy,
  Check,
  ArrowUpDown,
  X,
  ChevronDown,
} from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface StoreItem {
  _id: string;
  listing?: {
    title?: string;
    price?: number;
    category?: string;
    condition?: string;
    location?: { city?: string; country?: string };
  };
  model?: string;
  images?: string[];
  createdAt: string;
}

interface StoreListingsControlsProps {
  listings: StoreItem[];
  storeName: string;
}

type SortOption = "newest" | "oldest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

export function StoreListingsControls({ listings, storeName }: StoreListingsControlsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract unique categories and conditions from listings
  const { categories, conditions } = useMemo(() => {
    const cats = new Set<string>();
    const conds = new Set<string>();
    listings.forEach((item) => {
      const cat = item.listing?.category;
      const cond = item.listing?.condition;
      if (cat) cats.add(cat);
      if (cond) conds.add(cond);
    });
    return {
      categories: Array.from(cats).sort(),
      conditions: Array.from(conds).sort(),
    };
  }, [listings]);

  // Filtered and sorted listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const title = (item.listing?.title || item.model || "").toLowerCase();
        const category = (item.listing?.category || "").toLowerCase();
        const condition = (item.listing?.condition || "").toLowerCase();
        return (
          title.includes(query) ||
          category.includes(query) ||
          condition.includes(query)
        );
      });
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((item) => item.listing?.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition) {
      result = result.filter((item) => item.listing?.condition === selectedCondition);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price-asc":
        result.sort((a, b) => (a.listing?.price ?? Infinity) - (b.listing?.price ?? Infinity));
        break;
      case "price-desc":
        result.sort((a, b) => (b.listing?.price ?? 0) - (a.listing?.price ?? 0));
        break;
      case "name-asc":
        result.sort((a, b) => {
          const nameA = (a.listing?.title || a.model || "").toLowerCase();
          const nameB = (b.listing?.title || b.model || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case "name-desc":
        result.sort((a, b) => {
          const nameA = (a.listing?.title || a.model || "").toLowerCase();
          const nameB = (b.listing?.title || b.model || "").toLowerCase();
          return nameB.localeCompare(nameA);
        });
        break;
    }

    return result;
  }, [listings, searchQuery, selectedCategory, selectedCondition, sortBy]);

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (selectedCondition ? 1 : 0);

  const clearAllFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedCondition(null);
    setSearchQuery("");
  }, []);

  const copyStoreLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Store link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out ${storeName}'s store on FindMaster\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}`,
      "_blank"
    );
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(
      `Check out ${storeName}'s store on FindMaster`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
        window.location.href
      )}`,
      "_blank"
    );
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${storeName}'s Store — FindMaster`,
        text: `Check out ${storeName}'s store on FindMaster`,
        url: window.location.href,
      });
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest First",
    oldest: "Oldest First",
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
    "name-asc": "Name: A to Z",
    "name-desc": "Name: Z to A",
  };

  return (
    <div className="space-y-4">
      {/* Search, sort, share bar */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter button */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full relative"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Sort by
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => setSortBy(option)}
                className={`flex items-center gap-2 cursor-pointer ${
                  sortBy === option ? "bg-accent font-medium" : ""
                }`}
              >
                {sortBy === option && (
                  <ChevronDown className="h-3 w-3 rotate-180 text-primary" />
                )}
                <span className={sortBy === option ? "ml-5" : "ml-7"}>
                  {sortLabels[option]}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Share button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Share this store
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={copyStoreLink}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{copied ? "Copied!" : "Copy Link"}</p>
                <p className="text-xs text-muted-foreground">Copy store link</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={shareWhatsApp}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.847L0 24l6.335-1.502A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.031-1.388l-.361-.214-3.762.892.952-3.67-.235-.376A9.808 9.808 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Share via WhatsApp</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={shareFacebook}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Facebook</p>
                <p className="text-xs text-muted-foreground">Share to Facebook</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={shareTwitter}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Twitter / X</p>
                <p className="text-xs text-muted-foreground">Share to X</p>
              </div>
            </DropdownMenuItem>

            {hasNativeShare && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={nativeShare}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Share2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">More options</p>
                    <p className="text-xs text-muted-foreground">Use device share sheet</p>
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="rounded-2xl border bg-card p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Filters</p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Category filter */}
            {categories.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={
                        selectedCategory === cat ? "default" : "outline"
                      }
                      className="text-xs cursor-pointer capitalize hover:opacity-80 transition-opacity"
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === cat ? null : cat
                        )
                      }
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Condition filter */}
            {conditions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Condition
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {conditions.map((cond) => (
                    <Badge
                      key={cond}
                      variant={
                        selectedCondition === cond ? "default" : "outline"
                      }
                      className="text-xs cursor-pointer capitalize hover:opacity-80 transition-opacity"
                      onClick={() =>
                        setSelectedCondition(
                          selectedCondition === cond ? null : cond
                        )
                      }
                    >
                      {cond}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filteredListings.length === 0
            ? "No listings found"
            : filteredListings.length === 1
            ? "1 listing found"
            : `${filteredListings.length} listings found`}
        </p>
        {searchQuery && (
          <p className="text-xs text-muted-foreground">
            Searching: &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>

      {/* Listings grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredListings.map((listing: any) => (
            <ListingCard
              key={listing._id}
              id={listing._id}
              title={listing.listing?.title || listing.model}
              price={listing.listing?.price}
              image={listing.images?.[0]}
              category={listing.listing?.category}
              condition={listing.listing?.condition}
              location={listing.listing?.location}
              createdAt={listing.createdAt}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-2xl text-center">
          <Search className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="font-medium text-sm">No listings match your search</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search terms or filters.
          </p>
          {activeFilterCount > 0 || searchQuery ? (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:underline mt-3"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}