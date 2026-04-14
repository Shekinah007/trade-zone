"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, ChevronDown, Globe, Navigation, Camera, Apple, EarthIcon } from "lucide-react";
import { openMap } from "@/lib/utils";
// import { mapProviders, openMap } from "@/lib/maps";

interface MapDropdownButtonProps {
  lat: number;
  lng: number;
}

export function MapDropdownButton({ lat, lng }: MapDropdownButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="h-3.5 w-3.5" />
          Open Map
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => openMap(lat, lng, "google")}>
          <EarthIcon className="h-4 w-4 mr-2" />
          Google Maps
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openMap(lat, lng, "googleDirections")}>
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openMap(lat, lng, "googleStreetView")}>
          <Camera className="h-4 w-4 mr-2" />
          Google Street View
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => openMap(lat, lng, "openStreetMap")}>
          <Globe className="h-4 w-4 mr-2" />
          OpenStreetMap
        </DropdownMenuItem> */}
        {/* <DropdownMenuItem onClick={() => openMap(lat, lng, "waze")}>
          <Navigation className="h-4 w-4 mr-2" />
          Waze
        </DropdownMenuItem> */}
        <DropdownMenuItem onClick={() => openMap(lat, lng, "appleMaps")}>
          <Apple className="h-4 w-4 mr-2" />
          Apple Maps
        </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openMap(lat, lng, "bingMaps")}>
            <Navigation className="h-4 w-4 mr-2" />
            Bing Maps
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}