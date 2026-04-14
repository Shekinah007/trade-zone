"use client";

import { useEffect, useState } from "react";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Loader2, 
  Search, 
  History, 
  Globe, 
  User, 
  MapPin, 
  Clock, 
  ShieldAlert,
  Eye,
  Fingerprint,
  Activity,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Flag,
  Lock,
  Shield,
  Database,
  Calendar,
  Filter,
  Navigation
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { MapDropdownButton } from "@/components/MapDropDownButton";

interface SearchLog {
  _id: string;
  query: string;
  propertyId: any;
  ipAddress: string;
  location?: { lat: number; lng: number };
  user?: { _id: string; name: string; email: string; image?: string };
  createdAt: string;
}

export default function AdminSearchLogsPage() {
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [logAddresses, setLogAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<"all" | "guest" | "authenticated">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/admin/search-logs`);
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
              const response = await fetch(`/api/reverse-geocode?lat=${log.location.lat}&lng=${log.location.lng}`);
              const geoData = await response.json();
              
              if (geoData && geoData.display) {
                // Determine a short version of the address like city, state
                const shortAddress = [geoData.city, geoData.state]
                  .filter(Boolean)[0] || geoData.display.split(",")[0];
                setLogAddresses((prev) => ({ ...prev, [log._id]: shortAddress }));
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
  }, []);

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (filterType === "guest" && log.user) return false;
    if (filterType === "authenticated" && !log.user) return false;
    if (searchTerm && !log.query.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.ipAddress.includes(searchTerm) &&
        !(log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

  // Calculate statistics
  const totalSearches = logs.length;
  const uniqueIPs = new Set(logs.map(l => l.ipAddress)).size;
  const anonymousSearches = logs.filter(l => !l.user).length;
  const authenticatedSearches = logs.filter(l => l.user).length;
  const searchesWithLocation = logs.filter(l => l.location?.lat).length;
  const todaySearches = logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-red-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-500/10 rounded-xl">
              <ShieldAlert className="h-7 w-7 text-red-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Search Audit Logs</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Loading global search data...</p>
            </div>
          </div>
          <div className="flex justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Analyzing search patterns...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-red-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-500/10 rounded-xl">
              <ShieldAlert className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Search Audit Logs</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Monitor platform searches</p>
            </div>
          </div>
          <div className="text-center py-16 border-2 border-dashed border-red-500/20 rounded-xl bg-red-500/5">
            <ShieldAlert className="h-12 w-12 text-red-600/50 mx-auto mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-red-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/15 rounded-2xl shadow-lg shadow-red-500/10">
              <Shield className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Search Audit Logs</h1>
                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Feed
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor all public registry searches across the platform in real-time
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-sm py-1.5 px-3">
              <Database className="h-3.5 w-3.5 mr-1.5" />
              {totalSearches} Total Searches
            </Badge>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-3 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center justify-between mb-1">
              <Eye className="h-4 w-4 text-red-600" />
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold text-red-600">{totalSearches}</p>
            <p className="text-[10px] text-muted-foreground">Total Searches</p>
          </div>
          
          <div className="p-3 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center justify-between mb-1">
              <Fingerprint className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">{uniqueIPs}</p>
            <p className="text-[10px] text-muted-foreground">Unique IPs</p>
          </div>
          
          <div className="p-3 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center justify-between mb-1">
              <Globe className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">{anonymousSearches}</p>
            <p className="text-[10px] text-muted-foreground">Anonymous</p>
          </div>
          
          <div className="p-3 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center justify-between mb-1">
              <User className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">{authenticatedSearches}</p>
            <p className="text-[10px] text-muted-foreground">Authenticated</p>
          </div>
          
          <div className="p-3 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center justify-between mb-1">
              <MapPin className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">{searchesWithLocation}</p>
            <p className="text-[10px] text-muted-foreground">With Location</p>
          </div>
          
          <div className="p-3 rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center justify-between mb-1">
              <Calendar className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">{todaySearches}</p>
            <p className="text-[10px] text-muted-foreground">Today</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 pb-4 border-b border-red-500/20">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5",
                filterType === "all" 
                  ? "bg-red-600 text-white shadow-sm" 
                  : "bg-muted/50 hover:bg-red-500/10 text-muted-foreground"
              )}
            >
              <BarChart3 className="h-3 w-3" />
              All
            </button>
            <button
              onClick={() => setFilterType("authenticated")}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5",
                filterType === "authenticated" 
                  ? "bg-red-600 text-white shadow-sm" 
                  : "bg-muted/50 hover:bg-red-500/10 text-muted-foreground"
              )}
            >
              <User className="h-3 w-3" />
              Authenticated
            </button>
            <button
              onClick={() => setFilterType("guest")}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5",
                filterType === "guest" 
                  ? "bg-red-600 text-white shadow-sm" 
                  : "bg-muted/50 hover:bg-red-500/10 text-muted-foreground"
              )}
            >
              <Globe className="h-3 w-3" />
              Guest
            </button>
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by query, IP, or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-red-500/20 bg-background focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40"
            />
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-red-500/10 rounded-lg">
              <History className="h-4 w-4 text-red-600" />
            </div>
            <h2 className="text-base font-semibold">Search Activity Feed</h2>
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {filteredLogs.length} {filteredLogs.length === 1 ? "Result" : "Results"}
            </Badge>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-red-500/20 rounded-xl bg-red-500/5">
              <Search className="h-10 w-10 text-red-600/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No search logs match your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const isAnonymous = !log.user;
                const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });
                
                return (
                  <div 
                    key={log._id} 
                    className={cn(
                      "group rounded-xl transition-all duration-200 hover:bg-red-500/5",
                      "border border-red-500/10"
                    )}
                  >
                    {/* Left accent border */}
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                        {/* User Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "p-2 rounded-full shrink-0",
                            isAnonymous ? "bg-muted" : "bg-red-500/10"
                          )}>
                            {isAnonymous ? (
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">
                                {log.user ? log.user.name : "Anonymous User"}
                              </p>
                              {isAnonymous && (
                                <Badge variant="secondary" className="text-[9px] uppercase bg-muted/50 px-1.5">
                                  <Lock className="h-2 w-2 mr-0.5" />
                                  Guest
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Fingerprint className="h-3 w-3" />
                                {log.ipAddress}
                              </span>
                              
                              {log.location?.lat && logAddresses[log._id] && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-red-500" />
                                  {logAddresses[log._id]}
                                </span>
                              )}
                              
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {timeAgo}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Search Query */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="bg-red-500/5 border-red-500/20 font-mono text-xs py-1.5 px-3">
                            <Search className="h-3 w-3 mr-1.5 text-red-600" />
                            Searched: "{log.query}"
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
                              <span className="text-muted-foreground block mb-0.5">Property Details</span>
                              <div className="space-y-0.5">
                                {log.propertyId && (
                                  <>
                                    <p className="font-mono text-foreground/70">
                                      {log.propertyId.brand} {log.propertyId.model}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      ID: {log.propertyId._id}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="p-2 rounded bg-muted/30">
                              <span className="text-muted-foreground block mb-0.5">Timestamp</span>
                              <code className="text-xs font-mono break-all text-foreground/70">
                                {format(new Date(log.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm:ss a")}
                              </code>
                            </div>
                            {log.location?.lat && (
                              <div className="p-3 rounded bg-muted/30 sm:col-span-2 flex flex-col gap-3 border border-red-500/10">
                                <div>
                                    <span className="text-muted-foreground block mb-0.5">Location Data</span>
                                    <code className="text-xs font-mono break-all text-foreground/80">
                                      {logAddresses[log._id] ? logAddresses[log._id] : `Coordinates: ${log.location.lat.toFixed(6)}, ${log.location.lng.toFixed(6)}`}
                                    </code>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-1">
                    <MapDropdownButton lat={log?.location?.lat} lng={log?.location?.lng} />
                                  {/* <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${log.location.lat},${log.location.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open in Map view"
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                  >
                                    <MapPin className="h-3.5 w-3.5" />
                                    Map
                                  </a>
                                  <a 
                                    href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${log.location.lat},${log.location.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open Street View"
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Street View
                                  </a>
                                  <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${log.location.lat},${log.location.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Get Directions"
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                  >
                                    <Navigation className="h-3.5 w-3.5" />
                                    Directions
                                  </a> */}
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
          )}
        </div>
      </div>
    </div>
  );
}