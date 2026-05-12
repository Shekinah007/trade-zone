"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  SlidersHorizontal,
  MapPin,
  Tag,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedItem {
  _id: string;
  brand: string;
  model: string;
  images: string[];
  listing: {
    title?: string;
    price?: number;
    condition?: string;
    featuredExpiry?: string;
    boostStatus?: string;
    location?: { city: string; state?: string; country: string };
    category?: { _id: string; name: string; slug: string; icon?: string };
    views?: number;
  };
  seller?: { _id: string; name: string; image?: string };
}

interface Category {
  _id: string;
  name: string;
  icon?: string;
  slug: string;
}

function timeLeft(expiry: string): string {
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff <= 0) return "Expiring soon";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

function ItemCard({ item }: { item: FeaturedItem }) {
  const isBoosted = item.listing.boostStatus === "active";
  const image = item.images?.[0];
  const location = item.listing.location;

  return (
    <Link
      href={`/listings/${item._id}`}
      className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
        {image ? (
          <Image
            src={image}
            alt={item.listing.title ?? item.model}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <PackageSearch className="w-10 h-10" />
          </div>
        )}

        {/* Featured badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400 text-amber-900 text-[11px] font-semibold shadow-sm">
          <Star className="w-3 h-3 fill-current" />
          Featured
        </div>

        {/* Boosted badge */}
        {isBoosted && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-semibold shadow-sm">
            <Zap className="w-3 h-3 fill-current" />
            Boosted
          </div>
        )}

        {/* Expiry pill */}
        {/* {item.listing.featuredExpiry && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm">
            {timeLeft(item.listing.featuredExpiry)}
          </div>
        )} */}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {item.listing.title ?? `${item.brand} ${item.model}`}
          </h3>
        </div>

        <p className="text-lg font-bold text-emerald-600 mt-auto">
          {item.listing.price != null
            ? `₦${item.listing.price.toLocaleString()}`
            : "Price on request"}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {item.listing.condition && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {item.listing.condition}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {[location.city, location.state].filter(Boolean).join(", ")}
            </span>
          )}
        </div>

        {item.seller && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            {item.seller.image ? (
              <Image
                src={item.seller.image}
                alt={item.seller.name}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                {item.seller.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">
              {item.seller.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function FeaturedListingsPage() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/listings/featured?${params}`);
      const data = await res.json();

      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.pages ?? 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory]);

  console.log("Items", items);

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const filtered = search.trim()
    ? items.filter((item) =>
        [item.listing.title, item.brand, item.model]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : items;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-3">
              <Star className="w-3.5 h-3.5 fill-current" />
              Handpicked &amp; highlighted
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Featured Listings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {total > 0
                ? `${total} featured item${total !== 1 ? "s" : ""} available right now`
                : "Browse items sellers have chosen to spotlight"}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search featured..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            />
          </div>
        </div>

        {/* ── Category filters ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setSelectedCategory("")}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
              selectedCategory === ""
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-muted-foreground",
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
                selectedCategory === cat._id
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-muted-foreground",
              )}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm">Loading featured listings…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Star className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-base">
                No featured listings yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {search
                  ? "No results match your search. Try a different term."
                  : selectedCategory
                    ? "No featured items in this category right now."
                    : "Check back soon — sellers can feature their listings from their dashboard."}
              </p>
            </div>
            {(search || selectedCategory) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                }}
                className="text-sm text-emerald-600 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {filtered.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-1 text-muted-foreground text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={cn(
                          "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                          page === p
                            ? "bg-emerald-600 text-white"
                            : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
