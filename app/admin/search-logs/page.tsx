"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Search, 
  History, 
  Globe, 
  User, 
  MapPin, 
  Clock, 
  ShieldAlert 
} from "lucide-react";
import { format } from "date-fns";

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
              const geoRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${log.location.lat}&longitude=${log.location.lng}&localityLanguage=en`
              );
              const geoData = await geoRes.json();
              if (geoData.locality || geoData.city || geoData.principalSubdivision) {
                const address = [geoData.locality, geoData.city, geoData.principalSubdivision, geoData.countryCode]
                                .filter(Boolean)
                                .join(", ");
                setLogAddresses((prev) => ({ ...prev, [log._id]: address }));
              }
            } catch (err) {
              console.error("Reverse geocoding failed", err);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Audit Logs</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor all public registry searches across the platform in real-time.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4 border-b">
          <div className="flex items-center justify-between">
             <CardTitle className="flex items-center gap-2 text-primary">
                <History className="h-5 w-5" />
                Global Search Feed
             </CardTitle>
             <Badge variant="outline" className="bg-background text-sm">
               {logs.length} Recorded Queries
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-24 text-destructive flex flex-col items-center gap-2">
              <ShieldAlert className="h-10 w-10 text-destructive/50" />
              <p>{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p>No search logs have been recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div 
                  key={log._id} 
                  className="p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                      {log.user ? (
                        <User className="h-5 w-5 text-primary" />
                      ) : (
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-semibold">
                        {log.user ? log.user.name : "Anonymous Trace"}
                        {!log.user && (
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            Guest
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                          <Globe className="h-3 w-3" />
                          {log.ipAddress}
                        </span>
                        
                        {log.location?.lat && (
                          <span className="flex items-center gap-1.5 text-primary/80 bg-primary/5 px-2 py-1 rounded-md">
                            <MapPin className="h-3 w-3" />
                             {logAddresses[log._id] ? (
                              logAddresses[log._id]
                            ) : (
                              `${log.location.lat.toFixed(2)}, ${log.location.lng.toFixed(2)}`
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <div className="flex flex-col sm:items-end gap-1 font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                         <Search className="h-3 w-3" /> Matched Property Target:
                      </span>
                      <Badge variant="default" className="text-xs bg-slate-900 text-white">
                        {log.query}
                      </Badge>
                      {log.propertyId && (
                         <div className="text-xs text-muted-foreground max-w-[200px] truncate text-right">
                           {log.propertyId.brand} {log.propertyId.model}
                         </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(log.createdAt), "MMM d, yyyy \u2022 p")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
