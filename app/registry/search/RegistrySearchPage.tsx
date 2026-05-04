"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowLeftRight,
  Loader2,
  Eye,
  Lock,
  ScanLine,
  Hash,
  ChevronRight,
  Zap,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ElementType;
    bg: string;
    gradient: string;
  }
> = {
  registered: {
    label: "Registered",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    gradient: "from-emerald-400 to-teal-500",
    icon: CheckCircle2,
  },
  missing: {
    label: "MISSING / STOLEN",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
    gradient: "from-rose-400 to-pink-500",
    icon: AlertTriangle,
  },
  found: {
    label: "Found",
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-200",
    gradient: "from-sky-400 to-red-500",
    icon: CheckCircle2,
  },
  transferred: {
    label: "Transferred",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
    gradient: "from-violet-400 to-purple-500",
    icon: ArrowLeftRight,
  },
};

const QUICK_SEARCHES = [
  { icon: ScanLine, label: "IMEI Lookup", placeholder: "359876054321234" },
  { icon: Hash, label: "Serial Number", placeholder: "FX8R92N41M" },
  { icon: Globe, label: "Chassis Number", placeholder: "WBA3A5C59DF123456" },
];

const maskVal = (val?: string) => {
  if (!val) return "";
  return val.length > 4 ? val.substring(0, 4) + "***" : val;
};

export default function RegistrySearchPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.warn("Geolocation permission denied/failed", err),
        { timeout: 10000, maximumAge: 60000 },
      );
    }
  }, []);

  const doSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 3) return;
    setLoading(true);
    setSearched(true);
    try {
      let url = `/api/registry?q=${encodeURIComponent(q.trim())}`;
      if (coords) {
        url += `&lat=${coords.lat}&lng=${coords.lng}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchedQuery = useRef<string | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && searchedQuery.current !== q) {
      searchedQuery.current = q;
      setQuery(q);
      doSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchedQuery.current = query;
    doSearch(query);
  };

  const handleQuickSearch = (placeholder: string) => {
    setQuery(placeholder);
    searchedQuery.current = placeholder;
    doSearch(placeholder);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      {/* Decorative background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTIxMjEiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PHBhdGggZD0iTTM2IDE4YzAgMS0xIDItMiAyczItMSAyLTJ6TTE4IDM2YzAgMS0xIDItMiAyczItMSAyLTJ6TTAgMGg2MHY2MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-bl from-red-100/40 to-purple-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-linear-to-tr from-emerald-100/30 to-teal-100/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <section className="relative pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Top badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-red-500 to-purple-600 text-white text-xs font-bold">
                <Zap className="h-3 w-3" />
                LIVE
              </div>
              <span className="text-sm font-medium text-slate-600">
                Global Property Registry Network
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6">
              <span className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Property Registry
              </span>
              <br />
              <span className="bg-linear-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                Search & Verification
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Instantly verify ownership and check status of any registered item
              using IMEI, serial numbers, or chassis identifiers. Join millions
              protecting their property.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
              <div
                className={`
                relative bg-white rounded-3xl shadow-lg transition-all duration-300
                ${focused ? "shadow-xl ring-4 ring-red-500/10 scale-[1.02]" : "hover:shadow-xl hover:scale-[1.01]"}
                border border-slate-200
              `}
              >
                {/* Glow effect on focus */}
                <div
                  className={`
                  absolute inset-0 rounded-3xl bg-linear-to-r from-red-500 to-purple-600 opacity-0 transition-opacity duration-300 blur-xl
                  ${focused ? "opacity-20" : ""}
                `}
                />

                <div className="relative flex items-center gap-2 p-2">
                  <div className="flex-shrink-0 pl-4">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                    ) : (
                      <Search className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  <Input
                    id="search-registry-field"
                    type="search"
                    placeholder="Enter IMEI, serial number, or chassis number..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="flex-1 h-14 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-2xl px-8 h-14 bg-linear-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Search
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick search suggestions */}
              {!searched && !loading && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {QUICK_SEARCHES.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleQuickSearch(item.placeholder)}
                      className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-red-300 hover:bg-white hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-50 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-700">
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate max-w-[150px]">
                          {item.placeholder}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {!searched && (
        <section className="relative pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  value: "500K+",
                  label: "Registered Items",
                  color: "from-red-500 to-cyan-500",
                },
                {
                  value: "99.9%",
                  label: "Recovery Rate",
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  value: "150+",
                  label: "Countries",
                  color: "from-violet-500 to-purple-500",
                },
              ].map((stat, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300" />
                  <div className="relative px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200 text-center">
                    <div
                      className={`text-3xl font-black bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-slate-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <div className="container mx-auto px-4 pb-24 max-w-4xl relative">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-linear-to-r from-red-500 to-purple-600 animate-pulse" />
              <Loader2 className="absolute inset-0 m-auto h-12 w-12 animate-spin text-white" />
            </div>
            <p className="mt-6 text-lg font-medium text-slate-600">
              Searching global registry...
            </p>
            <p className="text-sm text-slate-500 mt-1">
              This may take a few moments
            </p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <Shield className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Not Found in Registry
            </h3>
            <p className="text-slate-600 text-center max-w-md mb-8 leading-relaxed">
              This identifier isn't registered yet. Be proactive and register
              your property to protect it against theft and simplify recovery.
            </p>
            <div className="flex gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-2xl bg-linear-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white shadow-lg shadow-red-500/25"
              >
                <Link href="/registry/register">
                  <Shield className="mr-2 h-5 w-5" />
                  Register This Item
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-2xl"
              >
                <Link href="/">
                  Learn More
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {results.length} Result{results.length !== 1 ? "s" : ""} Found
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Matching records from the global registry
                </p>
              </div>
              {!session && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    <Link
                      href="/auth/signin"
                      className="font-semibold underline hover:no-underline"
                    >
                      Sign in
                    </Link>{" "}
                    to view owner details
                  </span>
                </div>
              )}
            </div>

            {results.map((item: any, index: number) => {
              const cfg =
                STATUS_CONFIG[item.status] || STATUS_CONFIG.registered;
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={item._id || index}
                  className="group relative rounded-3xl bg-white border border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                >
                  {/* Status indicator bar */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-1 rounded-full bg-linear-to-r ${cfg.gradient}`}
                  />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      {/* Title & Status */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}
                        >
                          <StatusIcon className={`h-6 w-6 ${cfg.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-900 capitalize">
                              {item.brand} {item.model}
                            </h3>
                            <Badge
                              className={`${cfg.bg} ${cfg.color} border-transparent font-semibold px-3 py-1`}
                            >
                              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 capitalize">
                            {item.itemType}
                            {item.itemType && item.color ? " • " : ""}
                            {item.color && (
                              <span className="capitalize">{item.color}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Identifier details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.imei && (
                          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-medium text-slate-500 mb-1">
                              IMEI
                            </div>
                            <div className="font-mono text-sm font-semibold text-slate-900">
                              {maskVal(item.imei)}
                            </div>
                          </div>
                        )}
                        {item.serialNumber && (
                          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-medium text-slate-500 mb-1">
                              Serial Number
                            </div>
                            <div className="font-mono text-sm font-semibold text-slate-900">
                              {maskVal(item.serialNumber)}
                            </div>
                          </div>
                        )}
                        {item.chassisNumber && (
                          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-medium text-slate-500 mb-1">
                              Chassis Number
                            </div>
                            <div className="font-mono text-sm font-semibold text-slate-900">
                              {maskVal(item.chassisNumber)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Owner info */}
                      {session && item.owner ? (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-red-50 to-purple-50 border border-red-100">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {item.owner.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {maskVal(item.owner.name)}
                            </div>
                            <div className="text-sm text-slate-600">
                              {maskVal(item.owner.email)}
                            </div>
                          </div>
                        </div>
                      ) : !session ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Lock className="h-3.5 w-3.5" />
                          Owner details hidden — sign in to view
                        </div>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:self-start">
                      {item.status === "missing" && (
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-linear-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25">
                          <AlertTriangle className="h-5 w-5" />
                          <div>
                            <div className="font-bold text-sm">STOLEN ITEM</div>
                            <div className="text-xs opacity-90">
                              Do not purchase
                            </div>
                          </div>
                        </div>
                      )}
                      {session && (
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-2xl border-slate-200 hover:border-red-300 hover:bg-red-50"
                        >
                          <Link href={`/registry/${item._id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Details
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!searched && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-red-100 to-purple-100 flex items-center justify-center">
                <Search className="h-12 w-12 text-red-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Ready to Search
            </h3>
            <p className="text-slate-600 text-center max-w-md leading-relaxed">
              Enter an identifier above to search the global registry. Results
              appear here instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
