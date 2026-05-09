"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  Zap,
  X,
  ChevronDown,
} from "lucide-react";
import { ListingCard } from "@/components/ListingCard";

type SortKey =
  | "default"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "oldest"
  | "views";

const SORT_OPTIONS: {
  value: SortKey;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "default", label: "Relevance", icon: ArrowUpDown },
  { value: "newest", label: "Newest first", icon: Clock },
  { value: "oldest", label: "Oldest first", icon: Clock },
  { value: "price-asc", label: "Price: Low → High", icon: TrendingUp },
  { value: "price-desc", label: "Price: High → Low", icon: TrendingDown },
  { value: "views", label: "Most viewed", icon: Eye },
];

const CONDITIONS = [
  "New",
  "Like New",
  "Used - Good",
  "Used - Fair",
  "Refurbished",
];

function isBoosted(listing: any) {
  return (
    listing.listing?.boostStatus === "active"
    //  &&
    // listing.listing?.boostExpiry &&
    // new Date(listing.listing.boostExpiry) > new Date()
  );
}

function sortListings(listings: any[], sort: SortKey): any[] {
  return [...listings].sort((a, b) => {
    // Boosted items ALWAYS float to the top, regardless of user sort choice.
    const aBoosted = isBoosted(a) ? 1 : 0;
    const bBoosted = isBoosted(b) ? 1 : 0;
    if (bBoosted !== aBoosted) return bBoosted - aBoosted;

    // Among boosted items, sort by most recently boosted so the newest boost wins.
    if (aBoosted && bBoosted) {
      return (
        new Date(b.listing?.boostedAt ?? 0).getTime() -
        new Date(a.listing?.boostedAt ?? 0).getTime()
      );
    }

    // User-chosen sort for non-boosted items.
    switch (sort) {
      case "price-asc":
        return (a.listing?.price ?? 0) - (b.listing?.price ?? 0);
      case "price-desc":
        return (b.listing?.price ?? 0) - (a.listing?.price ?? 0);
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "views":
        return (b.listing?.views ?? 0) - (a.listing?.views ?? 0);
      default:
        // Default: featured first, then newest.
        const aFeat = a.listing?.featuredStatus === "active" ? 1 : 0;
        const bFeat = b.listing?.featuredStatus === "active" ? 1 : 0;
        if (bFeat !== aFeat) return bFeat - aFeat;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
}

interface Props {
  listings: any[];
  categoryName: string;
  hasSubcategories: boolean;
}

export function CategoryPageClient({
  listings,
  categoryName,
  hasSubcategories,
}: Props) {
  const [sort, setSort] = useState<SortKey>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const activeSort = SORT_OPTIONS.find((o) => o.value === sort)!;

  // ── Filter ──
  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const price = l.listing?.price ?? 0;
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;
      if (
        selectedConditions.length > 0 &&
        !selectedConditions.includes(l.listing?.condition)
      )
        return false;
      return true;
    });
  }, [listings, minPrice, maxPrice, selectedConditions]);

  // ── Sort ──
  const sorted = useMemo(() => sortListings(filtered, sort), [filtered, sort]);

  // ── Paginate ──
  const paginated = sorted.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < sorted.length;

  const boostedCount = sorted.filter(isBoosted).length;
  const filtersActive = !!(minPrice || maxPrice || selectedConditions.length);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedConditions([]);
    setPage(1);
  };

  const toggleCondition = (c: string) => {
    setSelectedConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
    setPage(1);
  };

  return (
    <section>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">
            {hasSubcategories ? "Listings" : "All Listings"}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({sorted.length.toLocaleString()})
          </span>
          {boostedCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Zap className="h-3 w-3" /> {boostedCount} boosted
            </span>
          )}
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full hover:bg-red-100 transition-colors"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              showFilters || filtersActive
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {filtersActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((p) => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-border/80 transition-all"
            >
              <activeSort.icon className="h-3.5 w-3.5 text-muted-foreground" />
              {activeSort.label}
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortOpen(false)}
                />
                <div className="absolute top-full mt-1.5 right-0 z-20 w-52 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
                  {SORT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSort(opt.value);
                          setSortOpen(false);
                          setPage(1);
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-muted ${
                          sort === opt.value
                            ? "bg-muted font-semibold text-primary"
                            : "text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="mb-6 p-4 rounded-2xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Price range */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Price Range (₦)
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                />
                <span className="text-muted-foreground text-sm shrink-0">
                  –
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="sm:col-span-1 lg:col-span-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Condition
              </p>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCondition(c)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedConditions.includes(c)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Listings grid ── */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-3xl">
          {filtersActive ? (
            <>
              <p className="text-lg font-medium">
                No listings match your filters
              </p>
              <p className="text-muted-foreground mb-4 text-sm">
                Try adjusting your price range or condition.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No listings yet</p>
              <p className="text-muted-foreground mb-6 text-sm">
                Be the first to post in {categoryName}!
              </p>
              <Link
                href="/listings/create"
                className="inline-flex items-center px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
              >
                Post an Ad
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {paginated.map((listing: any) => (
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
                boostStatus={listing.listing?.boostStatus}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-border bg-card hover:bg-muted text-sm font-semibold text-foreground transition-all hover:shadow-sm"
              >
                Load more
                <span className="text-muted-foreground text-xs">
                  ({sorted.length - paginated.length} remaining)
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
