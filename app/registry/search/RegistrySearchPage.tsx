"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType; bg: string }
> = {
  registered: {
    label: "Registered",
    color: "text-green-600",
    bg: "bg-green-500/10 border-green-500/20",
    icon: CheckCircle2,
  },
  missing: {
    label: "MISSING / STOLEN",
    color: "text-red-600",
    bg: "bg-red-500/10 border-red-500/20",
    icon: AlertTriangle,
  },
  found: {
    label: "Found",
    color: "text-blue-600",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: CheckCircle2,
  },
  transferred: {
    label: "Transferred",
    color: "text-purple-600",
    bg: "bg-purple-500/10 border-purple-500/20",
    icon: ArrowLeftRight,
  },
};

export default function RegistrySearchPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 3) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/registry?q=${encodeURIComponent(q.trim())}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background text-xs font-medium text-primary mb-4">
            <Shield className="h-3.5 w-3.5" />
            FindMaster Registry
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Search the Property Registry
          </h1>
          <p className="text-muted-foreground mb-8">
            Enter a device&apos;s IMEI, serial number, or vehicle chassis number
            to check its registration status.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-registry-field"
                type="search"
                placeholder="e.g. 359876054321234 or ABC123XYZ"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-11 rounded-full bg-background border-border focus:border-primary/50"
              />
            </div>
            <Button
              type="submit"
              className="rounded-full px-6 bg-gradient-to-r from-primary to-blue-600 border-0"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Results */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Searching registry...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted rounded-3xl">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Not Found in Registry</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              This identifier is not currently registered on FindMaster. If you
              own this item, register it now to protect your ownership.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/registry/register">
                <Shield className="mr-2 h-4 w-4" />
                Register This Item
              </Link>
            </Button>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </h2>
              {!session && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  <Link
                    href="/auth/signin"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>{" "}
                  to view owner details
                </div>
              )}
            </div>

            {results.map((item: any) => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.registered;
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={item._id}
                  className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg capitalize">
                          {item.brand} {item.model}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${cfg.bg} ${cfg.color} border`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                        <span className="capitalize">
                          Type:{" "}
                          <span className="text-foreground font-medium">
                            {item.itemType}
                          </span>
                        </span>
                        {item.color && (
                          <span>
                            Color:{" "}
                            <span className="text-foreground font-medium capitalize">
                              {item.color}
                            </span>
                          </span>
                        )}
                        {item.serialNumber && (
                          <span>
                            S/N:{" "}
                            <span className="text-foreground font-medium font-mono">
                              {item.serialNumber}
                            </span>
                          </span>
                        )}
                        {item.imei && (
                          <span>
                            IMEI:{" "}
                            <span className="text-foreground font-medium font-mono">
                              {item.imei}
                            </span>
                          </span>
                        )}
                        {item.chassisNumber && (
                          <span>
                            Chassis:{" "}
                            <span className="text-foreground font-medium font-mono">
                              {item.chassisNumber}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Owner info — members only */}
                      {session && item.owner ? (
                        <div className="pt-1 text-sm">
                          <span className="text-muted-foreground">Owner: </span>
                          <span className="font-semibold text-foreground">
                            {item.owner.name}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            ({item.owner.email})
                          </span>
                        </div>
                      ) : !session ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                          <Lock className="h-3 w-3" />
                          Sign in to view owner details
                        </p>
                      ) : null}
                    </div>

                    {/* Status alert for missing items */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {item.status === "missing" && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold">
                          <AlertTriangle className="h-4 w-4" />
                          DO NOT PURCHASE
                        </div>
                      )}
                      {session && (
                        <Button asChild size="sm" variant="outline" className="rounded-full">
                          <Link href={`/registry/${item._id}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Full Details
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Enter an Identifier to Search
            </h3>
            <p className="text-muted-foreground max-w-md">
              Type an IMEI number, serial number, or chassis number above to
              check whether a property is registered, missing, or clean.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
