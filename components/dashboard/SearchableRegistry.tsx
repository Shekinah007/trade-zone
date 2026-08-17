"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
  Tag,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RegistryItem {
  _id: string;
  brand: string;
  model: string;
  itemType?: string;
  color?: string;
  images: string[];
  ownershipStatus?: string;
  isListed?: boolean;
  yearOfPurchase?: number;
  registry?: {
    serialNumber?: string;
    imei?: string;
    chassisNumber?: string;
    yearOfPurchase?: number;
    color?: string;
  };
}

interface SearchableRegistryProps {
  properties: RegistryItem[];
}

export function SearchableRegistry({ properties }: SearchableRegistryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalize = (str: string | undefined) =>
    str?.toLowerCase().trim() ?? "";

  const matchesQuery = (p: RegistryItem) => {
    const q = normalize(searchQuery);
    if (!q) return true;

    const brand = normalize(p.brand);
    const model = normalize(p.model);
    const itemType = normalize(p.itemType);
    const color = normalize(p.color || p.registry?.color);
    const year = normalize(String(p.yearOfPurchase || p.registry?.yearOfPurchase || ""));
    const serial = normalize(p.registry?.serialNumber);
    const imei = normalize(p.registry?.imei);
    const chassis = normalize(p.registry?.chassisNumber);
    const status = normalize(p.ownershipStatus);

    return (
      brand.includes(q) ||
      model.includes(q) ||
      itemType.includes(q) ||
      color.includes(q) ||
      year.includes(q) ||
      serial.includes(q) ||
      imei.includes(q) ||
      chassis.includes(q) ||
      status.includes(q)
    );
  };

  const filteredProperties = useMemo(
    () => properties.filter(matchesQuery),
    [properties, searchQuery],
  );

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600 dark:text-red-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your registry by brand, model, IMEI, serial number..."
          className="w-full h-11 pl-11 pr-10 text-sm rounded-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40 outline-none transition-all shadow-sm placeholder:text-muted-foreground"
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
          {filteredProperties.length} result
          {filteredProperties.length !== 1 ? "s" : ""} found for{" "}
          <span className="font-semibold text-foreground">"{searchQuery}"</span>
        </p>
      )}

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredProperties.map((p: any) => {
            const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
              owned: { label: "Owned", className: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle },
              missing: { label: "Missing", className: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle },
              found: { label: "Found", className: "bg-red-500/10 text-red-600 border-red-500/20", icon: Shield },
              transferred: { label: "Transferred", className: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: ArrowRight },
              transfer_pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20", icon: ArrowLeftRight },
            };
            const cfg = statusConfig[p.ownershipStatus] ?? statusConfig.owned;
            const StatusIcon = cfg.icon;
            const identifier = p.registry?.imei || p.registry?.serialNumber || p.registry?.chassisNumber;

            return (
              <Link key={p._id} href={`/registry/${p._id}`}>
                <div className={`group rounded-xl border bg-card overflow-hidden hover:-translate-y-0.5 hover:border-border/60 transition-all duration-150 cursor-pointer ${p.ownershipStatus === "missing" ? "border-red-200" : "border-border/40"}`}>
                  {/* Image */}
                  <div className="relative h-[88px] w-full bg-muted/50">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={`${p.brand} ${p.model}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Shield className="h-7 w-7 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className="absolute top-1.5 right-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.className}`}>
                        <StatusIcon className="h-2.5 w-2.5" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-2.5 space-y-1.5">
                    <div>
                      <p className="text-xs font-medium leading-tight capitalize">{p.brand} {p.model}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{p.itemType}</p>
                    </div>

                    {(p.color || p.yearOfPurchase) && (
                      <div className="flex flex-wrap gap-1">
                        {p.color && (
                          <span className="text-[10px] text-muted-foreground bg-muted border border-border/40 px-1.5 py-px rounded-full">
                            {p.color}
                          </span>
                        )}
                        {p.yearOfPurchase && (
                          <span className="text-[10px] text-muted-foreground bg-muted border border-border/40 px-1.5 py-px rounded-full">
                            {p.yearOfPurchase}
                          </span>
                        )}
                      </div>
                    )}

                    {identifier && (
                      <div className="text-[10px] font-mono bg-muted/50 border border-border/30 px-1.5 py-1 rounded truncate text-muted-foreground">
                        {identifier}
                      </div>
                    )}

                    {p.ownershipStatus === "missing" && (
                      <div className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-500/10 border border-red-500/20 px-1.5 py-1 rounded">
                        <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                        Do not purchase
                      </div>
                    )}

                    {p.isListed ? (
                      <div className="flex items-center justify-center gap-1 text-[10px] text-blue-600 bg-blue-500/10 border border-blue-500/20 px-1.5 py-1 rounded">
                        <Tag className="h-2.5 w-2.5" /> Listed for sale
                      </div>
                    ) : p.ownershipStatus === "owned" ? (
                      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground bg-muted/50 border border-border/30 px-1.5 py-1 rounded hover:bg-muted transition-colors">
                        <Tag className="h-2.5 w-2.5" /> List for sale
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
            <Shield className="h-8 w-8 opacity-30" />
            {hasQuery ? (
              <>
                <p className="font-medium text-sm">
                  No registered properties match your search.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search →
                </Button>
              </>
            ) : (
              <>
                <p className="font-medium text-sm">
                  No registered properties yet
                </p>
                <p className="text-xs max-w-xs">
                  Register your phones, laptops, cars, and more to
                  protect your ownership.
                </p>
                <Button
                  size="sm"
                  asChild
                  className="rounded-full mt-1 bg-linear-to-r from-red-600 to-red-700 border-0 text-xs h-8"
                >
                  <Link href="/registry/register">
                    Register Your First Property
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}