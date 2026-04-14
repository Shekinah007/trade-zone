"use client";

import { useEffect, useState } from "react";
import { SearchLog } from "./OwnerSearchLogs";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { format } from "date-fns";
import { User, Clock, MapPin, Globe } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { mapProviders } from "@/lib/utils";

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Create a component to adjust map bounds automatically
function MapBounds({ logs }: { logs: SearchLog[] }) {
  const map = useMap();

  useEffect(() => {
    const locations = logs
      .filter((log) => log.location?.lat && log.location?.lng)
      .map((log) => [log.location!.lat, log.location!.lng] as [number, number]);

    if (locations.length > 0) {
      if (locations.length === 1) {
        map.setView(locations[0], 12);
      } else {
        const bounds = L.latLngBounds(locations);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [logs, map]);

  return null;
}

export default function SearchLogsMap({ logs }: { logs: SearchLog[] }) {
  const [mounted, setMounted] = useState(false);
  const [provider, setProvider] = useState<keyof typeof mapProviders>("google");


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />;

  const defaultCenter: [number, number] = [9.0820, 8.6753]; // Nigeria coordinates as default

  const validLogs = logs.filter((log) => log.location?.lat && log.location?.lng);

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-inner border">
      <MapContainer
        center={validLogs.length > 0 ? [validLogs[0].location!.lat, validLogs[0].location!.lng] : defaultCenter}
        zoom={validLogs.length > 0 ? 10 : 5}
        className="h-full w-full object-cover"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapBounds logs={validLogs} />
        {validLogs.map((log) => (
          <Marker
            key={log._id}
            position={[log.location!.lat, log.location!.lng]}
            icon={customIcon}
          >
            <Popup className="rounded-xl overflow-hidden shadow-lg">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    {log.user ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {log.user?.name || "Anonymous User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      IP: {log.ipAddress}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{format(new Date(log.createdAt), "PPp")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{log.location!.lat.toFixed(4)}, {log.location!.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

       
      </MapContainer>

       
    </div>
  );
}
