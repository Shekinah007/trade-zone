"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  History,
  Globe,
  User,
  MapPin,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Eye,
  Fingerprint,
  Activity,
  Flag,
  Lock,
  Shield,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
  Navigation,
} from "lucide-react";
import { format } from "date-fns";
import { cn, mapProviders } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { MapDropdownButton } from "./MapDropDownButton";

// Dynamically import the map so it doesn't break SSR
const SearchLogsMap = dynamic(() => import("./SearchLogsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10 animate-pulse rounded-xl flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
    </div>
  ),
});

export interface SearchLog {
  _id: string;
  query: string;
  propertyId: string;
  ipAddress: string;
  location?: { lat: number; lng: number };
  user?: { _id: string; name: string; email: string; image?: string };
  createdAt: string;
}

export default function OwnerSearchLogs({
  propertyId,
}: {
  propertyId: string;
}) {
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [logAddresses, setLogAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "week" | "month" | "all"
  >("all");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/registry/${propertyId}/search-logs`);
        if (!res.ok) {
          throw new Error("Failed to fetch search logs");
        }
        const data = await res.json();
        setLogs(data.logs || []);

        // Reverse geocoding for logs with location
        const logsArray: SearchLog[] = data.logs || [];
        logsArray.forEach(async (log) => {
          if (log.location?.lat && log.location?.lng) {
            try {
              const response = await fetch(
                `/api/reverse-geocode?lat=${log.location.lat}&lng=${log.location.lng}`,
              );
              const geoData = await response.json();

              if (geoData && geoData.display) {
                setLogAddresses((prev) => ({
                  ...prev,
                  [log._id]: geoData.display,
                }));
              }
            } catch (err) {
              console.error("Reverse geocoding error:", err);
            }
          }
        });
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [propertyId]);

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // Calculate statistics
  const uniqueIPs = new Set(logs.map((l) => l.ipAddress)).size;
  const anonymousSearches = logs.filter((l) => !l.user).length;
  const authenticatedSearches = logs.filter((l) => l.user).length;
  const searchesWithLocation = logs.filter((l) => l.location?.lat).length;
  const suspiciousCount = logs.filter(
    (l) =>
      l.ipAddress.startsWith("192.168") ||
      l.user?.name?.toLowerCase().includes("test"),
  ).length;
  const [provider, setProvider] = useState<keyof typeof mapProviders>("google");

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <ShieldAlert className="h-6 w-6 text-red-600 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Security Audit Logs</h2>
            <p className="text-sm text-muted-foreground">
              Loading search history...
            </p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Analyzing security data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (logs.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Security Audit Logs</h2>
            <p className="text-sm text-muted-foreground">
              Monitor property searches and access
            </p>
          </div>
        </div>
        <div className="py-12 text-center border-2 border-dashed border-red-500/20 rounded-xl bg-red-500/5">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Eye className="h-10 w-10 text-red-600" />
          </div>
          <p className="font-medium text-muted-foreground">
            No searches recorded yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            When someone searches for this property, it will appear here
          </p>
        </div>
      </div>
    );
  }

  const logsWithLocation = logs.filter(
    (l) => l.location?.lat && l.location?.lng,
  );

  return (
    <div className="mt-8 shadow shadow-gray-300 rounded-md md:m-5 p-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/15 rounded-xl shadow-lg shadow-red-500/10">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Security Audit Logs</h2>
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-600 border-red-500/20"
              >
                <Activity className="h-3 w-3 mr-1" />
                Live Monitoring
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete history of all searches and access attempts for this
              property
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/20 text-sm py-1.5 px-3"
          >
            <Search className="h-3.5 w-3.5 mr-1.5" />
            {logs.length} Total Searches
          </Badge>
        </div>
      </div>

      {/* Statistics Dashboard - No Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-5 w-5 text-red-600" />
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-red-600">{logs.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Views</p>
        </div>

        <div className="p-4 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <Fingerprint className="h-5 w-5 text-red-600" />
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-red-600">{uniqueIPs}</p>
          <p className="text-xs text-muted-foreground mt-1">Unique IPs</p>
        </div>

        <div className="p-4 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <Globe className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{anonymousSearches}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Anonymous Searches
          </p>
        </div>

        <div className="p-4 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {searchesWithLocation}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            With Location Data
          </p>
        </div>
      </div>

      {/* Map View Toggle */}
      {logsWithLocation.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <h3 className="text-sm font-semibold">Geographic Distribution</h3>
            </div>
            <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-all",
                  viewMode === "list"
                    ? "bg-red-600 text-white shadow-sm"
                    : "hover:bg-red-500/10",
                )}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-all",
                  viewMode === "map"
                    ? "bg-red-600 text-white shadow-sm"
                    : "hover:bg-red-500/10",
                )}
              >
                Map View
              </button>
            </div>
          </div>

          {viewMode === "map" && (
            <div className="rounded-xl overflow-hidden border border-red-500/20 shadow-lg">
              <SearchLogsMap logs={logsWithLocation} />
            </div>
          )}
        </div>
      )}

      {/* Suspicious Activity Alert */}
      {suspiciousCount > 0 && (
        <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border-l-4 border-l-amber-500">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Security Notice:
              </span>
              <span className="text-muted-foreground ml-1">
                {suspiciousCount} suspicious{" "}
                {suspiciousCount === 1 ? "activity" : "activities"} detected.
                Please review the flagged entries below.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Activity Feed - Clean List View */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-500/20">
          <History className="h-4 w-4 text-red-600" />
          <h3 className="text-sm font-semibold">Recent Activity Feed</h3>
          <Badge variant="secondary" className="text-[10px] ml-auto">
            Real-time
          </Badge>
        </div>

        <div className="space-y-3">
          {logs.map((log, index) => {
            const isSuspicious =
              log.user?.name?.toLowerCase().includes("test") ||
              log.ipAddress.startsWith("192.168") ||
              log.ipAddress.startsWith("10.");

            return (
              <div
                key={log._id}
                className={cn(
                  "group relative rounded-xl transition-all duration-200 hover:bg-red-500/5",
                  isSuspicious && "bg-amber-500/5",
                )}
              >
                {/* Left accent border */}
                <div
                  className={cn(
                    "absolute left-0 top-3 bottom-3 w-0.5 rounded-full",
                    isSuspicious ? "bg-amber-500" : "bg-red-500",
                  )}
                />

                <div className="p-4 pl-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    {/* User Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "p-2 rounded-full shrink-0",
                          log.user ? "bg-red-500/10" : "bg-muted",
                        )}
                      >
                        {log.user ? (
                          <User className="h-4 w-4 text-red-600" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">
                            {log.user ? log.user.name : "Anonymous User"}
                          </p>
                          {!log.user && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] uppercase bg-muted/50 px-1.5"
                            >
                              <Lock className="h-2 w-2 mr-0.5" />
                              Guest
                            </Badge>
                          )}
                          {isSuspicious && (
                            <Badge
                              variant="outline"
                              className="text-[9px] border-amber-500/50 text-amber-600 px-1.5"
                            >
                              <Flag className="h-2 w-2 mr-0.5" />
                              Review
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Fingerprint className="h-3 w-3" />
                            {log.ipAddress}
                          </span>

                          {log.location?.lat && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-red-500" />
                              {logAddresses[log._id] ? (
                                <span className="truncate max-w-[200px]">
                                  {logAddresses[log._id].split(",")[0]}
                                </span>
                              ) : (
                                `${log.location.lat.toFixed(2)}, ${log.location.lng.toFixed(2)}`
                              )}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <MapDropdownButton
                      lat={log?.location!.lat}
                      lng={log?.location!.lng}
                    />

                    {/* Search Query and Expand Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="bg-red-500/5 border-red-500/20 font-mono text-xs py-1 px-2"
                      >
                        <Search className="h-2.5 w-2.5 mr-1 text-red-600" />"
                        {log.query}"
                      </Badge>

                      <button
                        onClick={() => toggleExpand(log._id)}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors"
                      >
                        {expandedLogs.has(log._id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedLogs.has(log._id) && (
                    <div className="mt-3 pt-3 border-t border-red-500/10 animate-in slide-in-from-top-1 duration-200">
                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground block mb-0.5">
                            User Agent
                          </span>
                          <code className="text-xs font-mono break-all text-foreground/70">
                            Mozilla/5.0 (Windows NT 10.0; Win64; x64)
                            AppleWebKit/537.36
                          </code>
                        </div>
                        <div className="p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground block mb-0.5">
                            Session ID
                          </span>
                          <code className="text-xs font-mono break-all text-foreground/70">
                            {log._id.slice(-16)}
                          </code>
                        </div>
                        {log.location?.lat && (
                          <div className="p-3 rounded bg-muted/30 sm:col-span-2 flex flex-col gap-3 border border-red-500/10">
                            <div>
                              <span className="text-muted-foreground block mb-0.5">
                                Location Data
                              </span>
                              <code className="text-xs font-mono break-all text-foreground/80">
                                {logAddresses[log._id]
                                  ? logAddresses[log._id]
                                  : `${log.location.lat}, ${log.location.lng}`}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
