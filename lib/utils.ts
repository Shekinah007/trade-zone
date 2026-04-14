import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// lib/maps.ts
export const mapProviders = {
  google: (lat: number, lng: number) => 
    // `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&map_action=map&center=${lat}%2C${lng}&zoom=24&basemap=satellite`,
//  `https://www.google.com/maps/@?api=1&map_action=map&center=${lat}%2C${lng}&zoom=18&basemap=satellite`,
// `https://www.google.com/maps?q=${lat},${lng}&t=k&zoom=25`,
`https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=18&t=k`,
  
  googleStreetView: (lat: number, lng: number) => 
    `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`,
  
  googleDirections: (lat: number, lng: number) => 
    // `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},15z/data=!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MDQwMi4xIKXMDSoJLDEwMjExNjQzSAFQAw%3D%3D`,
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate&t=k`,
  
  // openStreetMap: (lat: number, lng: number) => 
  //   `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`,
  
  bingMaps: (lat: number, lng: number) => 
    `https://www.bing.com/maps?cp=${lat}~${lng}&lvl=18&style=h&sp=point.${lat}_${lng}`,
  
  waze: (lat: number, lng: number) => 
    `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  
  appleMaps: (lat: number, lng: number) => 
    `https://maps.apple.com/?ll=${lat},${lng}&q=${lat},${lng}&map=hybrid&center=${lat}%2C${lng}&span=0.078709%2C0.126868`,
};

export function openMap(lat: number, lng: number, provider: keyof typeof mapProviders = "google") {
  const url = mapProviders[provider](lat, lng);
  window.open(url, '_blank', 'noopener,noreferrer');
}
